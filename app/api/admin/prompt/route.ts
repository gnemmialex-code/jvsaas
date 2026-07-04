import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { MASTER_PROMPT, MASTER_NEGATIVE_PROMPT, GTA5_STYLE_BOOST } from "@/scripts/pipeline";
import { isMasterScriptEnabled, setMasterScriptEnabled } from "@/lib/generation-settings";

const ADMIN_EMAIL = "gnemmialex@gmail.com";

async function requireAdmin() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

/* GET — script maître de génération (prompt de base + negative prompt + état).
   Réservé à l'admin : jamais embarqué dans le bundle client, les autres
   utilisateurs reçoivent un 403. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  return NextResponse.json({
    enabled: await isMasterScriptEnabled(),
    model:
      process.env.REPLICATE_IMG2IMG_MODEL ||
      "gnemmialex-code/gta-model-5-last:38230a374678b0ed7e0f8183eebfebadeed4331329ac0ae0cffde30fe25b32a4",
    master_prompt:   MASTER_PROMPT,
    gta5_style_boost: GTA5_STYLE_BOOST,
    negative_prompt: MASTER_NEGATIVE_PROMPT,
    note:
      "Le negative prompt est injecté dans le prompt final (clause NEVER GENERATE) " +
      "car le modèle Flux LoRA n'a pas d'entrée negative_prompt dédiée. " +
      "Le trigger LoRA \"gta 5 style version sec\" est ajouté en tête de chaque prompt, " +
      "et le boost GTA 5 s'ajoute quand le style GTA 5 est sélectionné.",
  });
}

/* POST — active/désactive le script maître (test avec / sans).
   Corps attendu : { "enabled": boolean } */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "Champ 'enabled' (boolean) requis" }, { status: 400 });
  }

  try {
    await setMasterScriptEnabled(body.enabled);
    return NextResponse.json({ ok: true, enabled: body.enabled });
  } catch (err) {
    console.error("[Admin prompt] toggle error:", err);
    return NextResponse.json({ error: "Impossible d'enregistrer le réglage" }, { status: 500 });
  }
}
