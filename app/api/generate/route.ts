import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase";
import {
  buildAsyncJobConfig,
  startAsyncJob,
  type AsyncJobConfig,
  type PipelineInput,
} from "@/scripts/pipeline";
import { validateImageFile } from "@/lib/validation";
import { uploadToStorage } from "@/lib/storage";
import { isMasterScriptEnabled } from "@/lib/generation-settings";
import { findAllCelebrities } from "@/lib/celebrity-db";
import { getCelebRefImages } from "@/lib/celebrity-refs";

export const maxDuration = 60;

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const BUCKET        = "celebswap-images";

// Crédits déduits par génération selon le tier.
// Essentiel = qualité 1K, moins de crédits consommés.
// Ultra = qualité 4K PNG, coûte plus de crédits.
const CREDITS_PER_TIER: Record<string, number> = {
  free:      100,
  essentiel: 50,
  pro:       100,
  ultra:     150,
};

// ── Mode "GTA 5 Intégral" (toute l'image transformée, décor compris) ─────────
// Réservé aux formules Essentiel (plan pro) et Ultimate (plan ultra), avec un
// quota mensuel : 3 générations pour Essentiel, 35 pour Ultimate.
const FULL_SCENE_LABEL = "GTA 5 Intégral";
const FULL_SCENE_MONTHLY_LIMITS: Record<string, number> = {
  free:      0,
  essentiel: 0,
  pro:       3,
  ultra:     35,
};

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function planToTier(planId?: string | null): "free" | "essentiel" | "pro" | "ultra" {
  if (!planId) return "essentiel";
  const p = planId.toLowerCase();
  if (p.includes("ultra") || p.includes("elite")) return "ultra";
  if (p.includes("pro")) return "pro";
  return "essentiel";
}

// Qualité de rendu maximale autorisée par formule (sécurité côté serveur :
// on ne fait jamais confiance à la valeur envoyée par le client seul).
type QualityLevel = "hd" | "4k" | "ultra";
function maxQualityForTier(tier: "free" | "essentiel" | "pro" | "ultra"): QualityLevel {
  if (tier === "ultra") return "ultra";
  if (tier === "pro")   return "4k";
  return "hd"; // free + essentiel
}
function clampQuality(requested: string | null | undefined, tier: "free" | "essentiel" | "pro" | "ultra"): QualityLevel {
  const order: QualityLevel[] = ["hd", "4k", "ultra"];
  const max  = maxQualityForTier(tier);
  const req  = (requested === "hd" || requested === "4k" || requested === "ultra") ? requested : max;
  return order.indexOf(req) <= order.indexOf(max) ? req : max;
}

async function getUserPlanId(userId: string): Promise<string> {
  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("users")
    .select("plan_id")
    .eq("id", userId)
    .single();
  if (error || !data?.plan_id) return "plan_essentiel";
  return data.plan_id;
}

async function uploadFile(
  file: File,
  userId: string,
): Promise<{ url: string; b64: string }> {
  // Upload avec le client service role : le bucket n'a pas de policy RLS
  // d'insertion, et le client session (clé anon) se fait rejeter
  // ("new row violates row-level security policy").
  const admin = createSupabaseAdmin();
  const validation = validateImageFile(file, MAX_FILE_SIZE);
  if (!validation.valid) throw new Error(validation.error);

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext    = file.name.split(".").pop() ?? "jpg";
  const path   = `inputs/${userId}/${generateId()}.${ext}`;
  const url    = await uploadToStorage(admin, buffer, path, file.type);
  const b64    = `data:${file.type};base64,${buffer.toString("base64")}`;
  return { url, b64 };
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  // Guest check
  if (!userId) {
    const freeUsed = req.cookies.get("free_gen_used")?.value;
    if (freeUsed === "1") {
      return NextResponse.json({ error: "Créez un compte pour continuer à générer" }, { status: 402 });
    }
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const mode = (formData.get("mode") as string) ?? "style";

  // ── Lecture du plan + vérification des crédits ────────────────────────────
  let qualityTier: "free" | "essentiel" | "pro" | "ultra" = "free";
  let creditsRequired = CREDITS_PER_TIER["free"]!;

  if (userId) {
    const planId = await getUserPlanId(userId);
    qualityTier      = planToTier(planId);
    creditsRequired  = CREDITS_PER_TIER[qualityTier] ?? 100;

    const { data: creditData } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (!creditData || creditData.credits < creditsRequired) {
      return NextResponse.json({ error: "Crédits insuffisants" }, { status: 402 });
    }
  }

  // ── Restrictions par plan ──────────────────────────────────────────────────
  if (mode === "video" && (qualityTier === "free" || qualityTier === "essentiel")) {
    return NextResponse.json(
      { error: "La génération vidéo est réservée aux plans Pro et Elite. Passez à Pro pour y accéder.", upgrade: true },
      { status: 403 }
    );
  }

  const effectiveUserId = userId ?? "anon";

  // ── Options de génération ──────────────────────────────────────────────────
  const renderStyle        = (formData.get("render_style")    as string | null) ?? undefined;
  const transformIntensity = (formData.get("intensity")       as string | null) ?? "moderate";
  const outputFormat       = (formData.get("output_format")   as string | null) ?? "auto";
  const preserveOutfit     = (formData.get("preserve_outfit") as string | null) === "1";
  // Qualité choisie par l'utilisateur, plafonnée par sa formule.
  const requestedQuality   = clampQuality(formData.get("quality") as string | null, qualityTier);

  try {
    const generationId = generateId();
    let styleLabel: string;
    let inputImageForRecord = "";
    let predictionId: string;
    let jobConfig: AsyncJobConfig;

    if (mode === "swapface") {
      // ── SWAPFACE ──────────────────────────────────────────────────────────
      const sourceFile = formData.get("source_image") as File | null;
      const targetFile = formData.get("target_image") as File | null;
      if (!sourceFile || !targetFile) {
        return NextResponse.json({ error: "Images source et cible requises" }, { status: 400 });
      }
      const [src, tgt] = await Promise.all([
        uploadFile(sourceFile, effectiveUserId),
        uploadFile(targetFile, effectiveUserId),
      ]);
      inputImageForRecord = src.url;
      styleLabel          = "SwapFace";

      jobConfig    = buildAsyncJobConfig({ mode: "swapface", qualityTier } as PipelineInput, src.b64);
      predictionId = await startAsyncJob(jobConfig, tgt.b64);

    } else if (mode === "style") {
      // ── STYLE IA ──────────────────────────────────────────────────────────
      const imageFile      = formData.get("image")        as File | null;
      const styleId        = formData.get("style_id")     as string | null;
      const rawStylePrompt = formData.get("style_prompt") as string | null;
      const customPrompt   = (formData.get("custom_prompt") as string) ?? "";
      const fullScene      = (formData.get("full_scene") as string | null) === "1";
      styleLabel           = (formData.get("style_label") as string) ?? "Génération IA";

      if (!imageFile) {
        return NextResponse.json({ error: "Photo requise" }, { status: 400 });
      }
      if (!rawStylePrompt && !customPrompt.trim()) {
        return NextResponse.json({ error: "Veuillez choisir un style ou entrer une description" }, { status: 400 });
      }

      // ── Mode "GTA 5 Intégral" : accès + quota mensuel vérifiés côté serveur ──
      if (fullScene) {
        const fullSceneLimit = FULL_SCENE_MONTHLY_LIMITS[qualityTier] ?? 0;
        if (!userId || fullSceneLimit === 0) {
          return NextResponse.json(
            { error: "Le mode GTA 5 Intégral est réservé aux formules Essentiel et Ultimate.", upgrade: true },
            { status: 403 }
          );
        }
        const admin = createSupabaseAdmin();
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const { count } = await admin
          .from("generations")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("style", FULL_SCENE_LABEL)
          .gte("created_at", monthStart.toISOString());
        if ((count ?? 0) >= fullSceneLimit) {
          return NextResponse.json(
            {
              error: qualityTier === "pro"
                ? `Quota GTA 5 Intégral atteint (${fullSceneLimit}/mois avec Essentiel). Passez à Ultimate pour 35 générations par mois.`
                : `Quota GTA 5 Intégral atteint (${fullSceneLimit} générations ce mois-ci). Il se réinitialise le 1er du mois prochain.`,
              upgrade: qualityTier === "pro",
            },
            { status: 403 }
          );
        }
        styleLabel = FULL_SCENE_LABEL;
      }

      const stylePrompt = rawStylePrompt
        || "photorealistic portrait, ultra HD, professional photography, perfect lighting";

      const { url: inputImageUrl, b64: sourceB64 } = await uploadFile(imageFile, effectiveUserId);
      inputImageForRecord = inputImageUrl;

      // Detect celebrities in the prompt and load their reference images from Storage
      const detectedCelebs = findAllCelebrities((customPrompt ?? "") + " " + (stylePrompt ?? ""));
      const primaryCeleb   = detectedCelebs[0];

      let celebRefImageUrls: string[] = [];
      let celebRefImageUrl: string | undefined;

      if (primaryCeleb) {
        celebRefImageUrls = await getCelebRefImages(
          primaryCeleb.id,
          primaryCeleb.reference_images ?? [],
          primaryCeleb.reference_image_url,
        );
        celebRefImageUrl = celebRefImageUrls[0];
        if (celebRefImageUrls.length > 0) {
          console.log(`[Generate] ${primaryCeleb.name}: ${celebRefImageUrls.length} reference image(s) loaded`);
        }
      }

      const pipelineInput: PipelineInput = {
        mode:              "style",
        inputImageUrl,
        styleId:           styleId ?? "custom",
        stylePrompt,
        customPrompt,
        qualityTier,
        requestedQuality,
        renderStyle,
        transformIntensity,
        outputFormat,
        preserveOutfit,
        celebRefImageUrl,
        celebRefImageUrls,
        celebRefCount:  celebRefImageUrls.length,
        celebName:      primaryCeleb?.name,
        celebGender:    primaryCeleb?.gender,
        // Script maître (verrous fond/identité/qualité) — togglable par l'admin
        masterScriptEnabled: await isMasterScriptEnabled(),
        // Mode GTA 5 Intégral : toute l'image stylisée + réglages IA dédiés
        fullScene,
      };

      jobConfig    = buildAsyncJobConfig(pipelineInput, sourceB64);
      predictionId = await startAsyncJob(jobConfig);

    } else {
      return NextResponse.json({ error: "Ce mode n'est pas encore disponible" }, { status: 400 });
    }

    // ── Déduire les crédits + sauvegarder le job ────────────────────────────
    if (userId) {
      await supabase.rpc("decrement_credits", { user_id: userId, amount: creditsRequired });

      const { error: insertError } = await supabase.from("generations").insert({
        id:               generationId,
        user_id:          userId,
        input_image_url:  inputImageForRecord,
        output_image_url: "",
        style:            styleLabel,
        status:           "pending",
        prediction_id:    predictionId,
        step:             1,
        job_config:       jobConfig,
      });

      if (insertError) {
        console.error("[Generate] DB insert error:", insertError.message);
        throw new Error(`Erreur DB : ${insertError.message}`);
      }

      // Auto-delete oldest done generations based on plan limit
      const HISTORY_LIMITS: Record<string, number> = {
        free:      10,
        essentiel: 20,
        pro:       100,
        ultra:     999,
      };
      const historyLimit = HISTORY_LIMITS[qualityTier] ?? 20;

      const { data: doneGens } = await supabase
        .from("generations")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "done")
        .order("created_at", { ascending: false });

      if (doneGens && doneGens.length > historyLimit) {
        const toDelete = doneGens.slice(historyLimit).map((g: { id: string }) => g.id);
        await supabase.from("generations").delete().in("id", toDelete).eq("user_id", userId);
      }
    }

    const response = NextResponse.json({ job_id: generationId, prediction_id: predictionId });

    if (!userId) {
      response.cookies.set("free_gen_used", "1", {
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: "lax",
      });
    }

    return response;

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur pipeline IA";
    console.error("[Generate] Error:", msg);

    if (msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("throttled")) {
      return NextResponse.json(
        { error: "Limite d'API Replicate atteinte — réessayez dans 30 secondes" },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const { data: generation, error } = await supabase
    .from("generations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !generation) {
    return NextResponse.json({ error: "Génération introuvable" }, { status: 404 });
  }

  return NextResponse.json(generation);
}
