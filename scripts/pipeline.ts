import Replicate from "replicate";
import { findAllCelebrities, buildCelebrityContext } from "@/lib/celebrity-db";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const MODELS = {
  faceSwap: "codeplugtech/face-swap:278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34",
} as const;

// ─── Créer mode: img2img fallback chain ──────────────────────────────────────
//
// These models take the uploaded photo as DIRECT visual input (image-to-image).
// The person in the photo is preserved; the prompt controls scene/style.
// If a prediction fails/cancels, the poll handler retries with the next model.

type Img2ImgModelSpec = {
  spec:       string;
  buildInput: (prompt: string, negPrompt: string, imageUrl: string, strength: number, resolution?: string, celebRefB64?: string, allCelebRefs?: string[], outputFormat?: string, allowFallback?: boolean) => Record<string, unknown>;
};

const NEG = "blurry, low quality, cartoon, anime, illustration, distorted, ugly, deformed, nsfw, different person, extra limbs";

// ─── MODE PERSONNAGE (GTA 5, Fortnite, Simpsons, Minecraft) ──────────────────
// Ces styles TRANSFORMENT entièrement le sujet dans un style de personnage,
// contrairement aux styles "scène" qui gardent le visage photo intact.
export const CHARACTER_STYLE_IDS = new Set(["gta5", "fortnite", "simpsons", "minecraft"]);
export function isCharacterStyle(styleId?: string | null): boolean {
  return !!styleId && CHARACTER_STYLE_IDS.has(styleId);
}

// Negative prompt adapté : on NE bannit PAS cartoon/illustration (on les veut),
// on cible seulement les défauts.
const CHARACTER_NEG = "blurry, low quality, distorted, ugly, deformed, disfigured, nsfw, extra limbs, extra fingers, bad anatomy, text, watermark, signature, unrecognizable, multiple people";

// ─────────────────────────────────────────────────────────────────────────────
// 👉 MODÈLE DE GÉNÉRATION D'IMAGE UNIQUE : gnemmialex-code/gta-style-version-sec
//    (fine-tune Flux LoRA). Toutes les générations d'image passent par lui,
//    sans repli sur un autre modèle. Surchargable via REPLICATE_IMG2IMG_MODEL
//    dans .env.local (format "compte/modele:HASH_DE_VERSION").
//
//    Schéma d'entrée vérifié via l'API Replicate (Flux LoRA) :
//    prompt (requis), image (img2img), prompt_strength, output_format,
//    output_quality, num_inference_steps… — pas de negative_prompt,
//    une seule image d'entrée (pas d'images de référence multiples).
// ─────────────────────────────────────────────────────────────────────────────
const GTA_STYLE_MODEL =
  process.env.REPLICATE_IMG2IMG_MODEL ||
  "gnemmialex-code/gta-model-5-last:38230a374678b0ed7e0f8183eebfebadeed4331329ac0ae0cffde30fe25b32a4";

// ⚡ MOT DÉCLENCHEUR DU LoRA — indispensable. Sans le trigger exact utilisé à
// l'entraînement, le style appris ne s'active quasiment pas (c'était la cause
// des transformations trop timides). Il est injecté automatiquement en tête de
// CHAQUE prompt envoyé au modèle.
// ⚠️ Chaque version entraînée a SON trigger : si tu changes de modèle dans
// .env.local (REPLICATE_IMG2IMG_MODEL), mets aussi REPLICATE_LORA_TRIGGER à
// jour avec le trigger_word de cet entraînement.
const LORA_TRIGGER = process.env.REPLICATE_LORA_TRIGGER || "GTA 5 style model generation";

// ─── RÉGLAGES DE GÉNÉRATION SURCHARGEABLES ───────────────────────────────────
// Reporte ici (via .env.local / variables Vercel) les valeurs testées sur le
// playground replicate.com. Non défini → valeurs par défaut du code.
//   REPLICATE_PROMPT_STRENGTH      (0–1)   force img2img — remplace le calcul
//                                          par intensité pour TOUTES les générations
//   REPLICATE_NUM_INFERENCE_STEPS  (1–50)  étapes de diffusion (défaut 40)
//   REPLICATE_GUIDANCE_SCALE       (0–10)  adhérence au prompt (défaut 3.5)
//   REPLICATE_OUTPUT_QUALITY       (0–100) qualité jpg/webp (défaut 95)
//   REPLICATE_LORA_SCALE           (0–2)   force du LoRA (défaut 1.1)
function envNum(name: string): number | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    console.warn(`[Pipeline] ${name}="${raw}" n'est pas un nombre — valeur ignorée`);
    return undefined;
  }
  return n;
}

const TUNING = {
  promptStrength: envNum("REPLICATE_PROMPT_STRENGTH"),
  steps:          envNum("REPLICATE_NUM_INFERENCE_STEPS"),
  guidance:       envNum("REPLICATE_GUIDANCE_SCALE"),
  outputQuality:  envNum("REPLICATE_OUTPUT_QUALITY"),
  loraScale:      envNum("REPLICATE_LORA_SCALE"),
};

const GTA_STYLE_SPEC: Img2ImgModelSpec = {
  spec: GTA_STYLE_MODEL,
  // Le modèle Flux LoRA n'a pas d'entrée "negative_prompt" : la liste des
  // interdictions est injectée dans le prompt sous forme de clause explicite,
  // que Flux suit très bien.
  buildInput: (prompt, negPrompt, imageUrl, strength, _resolution, _primary, _allRefs, outputFormat) => ({
    // Trigger LoRA en tête (active le style appris), puis le prompt complet,
    // puis la clause d'interdictions (le modèle n'a pas de negative_prompt).
    prompt: `${LORA_TRIGGER}, ${prompt}` + (negPrompt
      ? ` ═══ NEGATIVE PROMPT — NEVER GENERATE ANY OF THE FOLLOWING, ZERO TOLERANCE: ${negPrompt}.`
      : ""),
    image:               imageUrl,
    // Surcharge globale (valeurs testées sur le playground Replicate) sinon
    // force calculée selon l'intensité choisie par l'utilisateur.
    prompt_strength:     TUNING.promptStrength ?? strength,
    // Le modèle accepte webp/jpg/png — on garde jpg par défaut, png pour Ultra.
    output_format:       outputFormat === "png" ? "png" : "jpg",
    output_quality:      TUNING.outputQuality ?? 95,
    // 40 étapes (au lieu de 28 par défaut) : rendu nettement plus détaillé.
    num_inference_steps: TUNING.steps ?? 40,
    // Force du LoRA légèrement au-dessus de 1 : style GTA plus affirmé.
    lora_scale:          TUNING.loraScale ?? 1.1,
    // Adhérence au prompt renforcée (défaut 3).
    guidance_scale:      TUNING.guidance ?? 3.5,
    go_fast:             false,
  }),
};

// Modèle unique : aucune chaîne de repli.
export const STYLE_MODELS: Img2ImgModelSpec[] = [GTA_STYLE_SPEC];

// ─── SECTION /gta6 : MODÈLE ET PROMPT DÉDIÉS ─────────────────────────────────
// La partie générative GTA 6 (vue /gta6, styleId "gta6") n'utilise PAS le
// fine-tune Flux LoRA ci-dessus : elle passe par flux-kontext-pro (édition
// d'image guidée par texte, préserve l'identité du sujet), avec un prompt
// interne FIXE qui décrit le style key art officiel du reveal GTA VI.
// Aucun autre mode de génération n'est affecté.
export const GTA6_MODEL =
  process.env.REPLICATE_GTA6_MODEL || "black-forest-labs/flux-kontext-pro";

export const GTA6_KONTEXT_PROMPT =
  "Transform this photo into official Rockstar Games Grand Theft Auto VI key art illustration, " +
  "in the exact style of the GTA 6 announcement artwork. " +
  "RENDERING TECHNIQUE: completely flat 2D digital vector illustration, zero photorealism, " +
  "zero 3D render, zero photographic texture or grain. Every surface is built from clean solid " +
  "color planes with crisp hard edges. Cel-shading with sharply cut shadow shapes, shadows " +
  "tinted lavender-purple and magenta instead of grey. Thin dark line art contouring figures " +
  "and clothing folds, confident and clean, never sketchy. Skin rendered as large flat tone " +
  "planes with 3-4 value steps maximum, subtle painterly transitions only inside the face. " +
  "Body hair, stubble, eyebrows and flyaway hair strands drawn as hundreds of individual fine " +
  "dark line strokes layered over the flat base colors. Eyelashes drawn individually. Clothing " +
  "folds simplified into big angular graphic shapes with one hard shadow tone; fabric patterns " +
  "(tropical prints, ripped denim, fur, jewelry chains) drawn crisp and graphic, every chain " +
  "link and denim fray individually inked. " +
  "LIGHTING: single warm golden-hour sun from the side, creating a bright yellow-cream rim " +
  "light tracing shoulders, hair, arms and jawline with a hard edge. Lit skin areas warm " +
  "peach-gold, shadow side of the face and body shifted to cool violet-pink. Slight warm glow " +
  "halo separating the character from the cooler background. " +
  "CHARACTER: preserve the exact facial likeness, identity, expression, skin tone and " +
  "hairstyle of the person in the photo. Confident relaxed pose, full body visible, wearing an " +
  "open short-sleeve tropical shirt with subtle tonal palm print over a plain white t-shirt, " +
  "cargo pants, sneakers, thin gold chain necklace and a wristwatch, all rendered in the same " +
  "flat cel-shaded style. " +
  "BACKGROUND, rendered paler, hazier and less saturated than the character so the figure " +
  "pops: Vice City waterfront at golden hour, milky turquoise-mint bay water with pale pink " +
  "ripple reflections painted as flat wavy shapes, lavender and periwinkle palm tree " +
  "silhouettes, distant skyline of pale pink, peach, mint and powder-blue art deco towers and " +
  "skyscrapers fading into a soft haze, cyan sky graduating to pale butter-yellow at the " +
  "horizon, a small purple police helicopter in the sky, a police speedboat cutting a white " +
  "foam wake, a wooden dock with mooring posts and rope in the foreground, a white pelican on " +
  "a buoy, a distant concrete bridge. " +
  "COLOR PALETTE: dominant pastel Miami palette — turquoise, mint, lavender, periwinkle, " +
  "blush pink, peach, butter yellow — with the main character carrying the strongest " +
  "saturation in the frame. " +
  "QUALITY: masterpiece AAA video game cover key art, ultra-clean vector poster finish, " +
  "perfectly balanced composition, sharp at every scale, no blur, no noise, no gradient " +
  "banding, no photorealistic skin, no CGI, no soft airbrushed shading.";

// Champ "Votre scène GTA 6" du dashboard : le texte libre de l'utilisateur
// (traduit en anglais) est injecté en clause PRIORITAIRE à la fin du prompt
// interne. Là où sa demande entre en conflit avec la scène par défaut (fond,
// tenue, pose, objets…), c'est SA version qui remplace celle du prompt de
// base ; tout ce qu'il ne mentionne pas garde la description par défaut.
// Le style de rendu key art GTA VI et l'identité du visage, eux, ne bougent jamais.
export function buildGta6Prompt(userScene?: string): string {
  const scene = translateToEnglish((userScene ?? "").trim());
  if (!scene) return GTA6_KONTEXT_PROMPT;
  return (
    GTA6_KONTEXT_PROMPT +
    " USER SCENE REQUEST — HIGHEST PRIORITY, OVERRIDES THE DEFAULT SCENE ABOVE: " +
    `"${scene}". ` +
    "Apply this request on top of everything described above. Wherever it conflicts with the " +
    "default scene (background, setting, outfit, pose, props, mood, characters), the user " +
    "request WINS and completely replaces that part of the default description. " +
    "Every element the user request does not mention keeps the default description above. " +
    "Non-negotiable regardless of the request: keep the exact flat 2D GTA VI key art " +
    "illustration rendering style described above, keep the person's exact face, identity and " +
    "expression from the photo, and keep the poster-quality balanced composition."
  );
}

export const STYLE_MODEL_COUNT = STYLE_MODELS.length;

// ─── Dimension table ──────────────────────────────────────────────────────────
export const ZIMAGE_DIMS: Record<string, { width: number; height: number }> = {
  square:    { width: 1024, height: 1024 },
  portrait:  { width: 832,  height: 1152 },
  landscape: { width: 1216, height: 832  },
  auto:      { width: 832,  height: 1152 },
};

// ─── Quality settings per subscription tier ───────────────────────────────────
//
// resolution     → output resolution (faster + cheaper at 1K)
// format         → jpg for lossy compression, png lossless for ultra
// maxRefImages   → max celeb reference photos passed to the model
// allowFallback  → Replicate may route to a faster/cheaper model variant
const QUALITY_SETTINGS = {
  free:      { format: "jpg" as const, resolution: "1K", maxRefImages: 0, allowFallback: true  },
  essentiel: { format: "jpg" as const, resolution: "1K", maxRefImages: 1, allowFallback: true  },
  pro:       { format: "jpg" as const, resolution: "2K", maxRefImages: 2, allowFallback: false },
  ultra:     { format: "png" as const, resolution: "4K", maxRefImages: 3, allowFallback: false },
} as const;

// Qualité EXPLICITE choisie par l'utilisateur (HD / 4K / Ultra) dans le Dashboard.
// Déjà plafonnée par la formule côté serveur ; ici on la traduit en résolution + format.
const REQUESTED_QUALITY_OUTPUT: Record<"hd" | "4k" | "ultra", { resolution: string; format: "jpg" | "png" }> = {
  hd:    { resolution: "2K", format: "jpg" },
  "4k":  { resolution: "4K", format: "jpg" },
  ultra: { resolution: "4K", format: "png" },
};

// ─── Render style descriptors ─────────────────────────────────────────────────
const RENDER_STYLE_PROMPTS: Record<string, string> = {
  photoreal: "ultra-photorealistic, sharp natural details, true-to-life colors",
  magazine:  "high-fashion editorial photography, perfect studio lighting, magazine quality",
  cinematic: "cinematic color grading, dramatic shadows and highlights, film quality",
  artistic:  "fine art portrait photography, creative lighting, artistic composition",
};

export interface PipelineInput {
  mode:               "style" | "swapface";
  inputImageUrl?:     string;
  styleId?:           string;
  stylePrompt?:       string;
  customPrompt?:      string;
  sourceImageUrl?:    string;
  targetImageUrl?:    string;
  faceIndex?:         string;
  extraPrompt?:       string;
  qualityTier?:       keyof typeof QUALITY_SETTINGS;
  requestedQuality?:  "hd" | "4k" | "ultra";
  renderStyle?:       string;
  transformIntensity?: string;
  outputFormat?:      string;
  preserveOutfit?:    boolean;
  celebRefImageUrl?:  string;
  celebRefImageUrls?: string[];
  celebRefCount?:     number;
  celebName?:         string;
  celebGender?:       string;
  /** Script maître (verrous fond/identité/qualité) — désactivable par l'admin pour tester. */
  masterScriptEnabled?: boolean;
  /** Mode "GTA 5 Intégral" : toute l'image (décor compris) est transformée.
      Réservé Essentiel/Ultimate — change aussi les réglages du modèle IA. */
  fullScene?: boolean;
  /** Taille de l'image générée (section GTA 6) : "16:9", "9:16" ou "1:1". */
  aspectRatio?: string;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const is429 = msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("throttled");
      if (is429 && attempt < retries) {
        const match = msg.match(/"retry_after"\s*:\s*(\d+)/);
        const waitMs = match ? (Number(match[1]) + 2) * 1000 : 15000;
        console.log(`[Pipeline] Rate limited – waiting ${waitMs / 1000}s (retry ${attempt + 1}/${retries})`);
        await new Promise((r) => setTimeout(r, waitMs));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

// ─── HIDDEN SYSTEM CONTEXT ───────────────────────────────────────────────────
//
// Injected silently into every generation prompt.
// Never exposed in the UI. Guides the model for maximum precision on:
//   • biometric identity preservation
//   • public figure recognition & accuracy
//   • scene-only transformation
//   • photorealistic integration quality

const HIDDEN_SYSTEM_CONTEXT =
  "ABSOLUTE IMAGE-TO-IMAGE TRANSFORMATION CONTRACT — READ EVERY INSTRUCTION BEFORE GENERATING. " +

  // ── CRITICAL PREAMBLE: the base image is sacred ───────────────────────────
  "CRITICAL PREAMBLE — THE BASE IMAGE IS A FIXED CANVAS THAT MUST NOT BE MODIFIED: " +
  "This is an image-to-image task. You have received an input photograph. That photograph is your fixed canvas. " +
  "Your role is NOT to regenerate this photograph. Your role is NOT to reimagine it. " +
  "Your role is NOT to improve it, reinterpret it, or recreate it from scratch. " +
  "Your sole role is to apply ONLY what the user has explicitly requested on top of this fixed canvas, " +
  "while leaving every single other element of the photograph exactly as it is. " +
  "The person in the input photograph — their face, skin tone, hair, body, clothing, posture, expression — " +
  "must appear in the output as if their pixels were directly transferred from the input without any processing. " +
  "This person must not be regenerated, not be redrawn, not be smoothed, not be altered in any way. " +
  "Their face must be pixel-for-pixel identical to the input. " +
  "Their skin color must be pixel-for-pixel identical to the input. " +
  "Their hair must be pixel-for-pixel identical to the input. " +
  "Their body must be pixel-for-pixel identical to the input. " +
  "If the user says 'add someone next to me' — add only that person. Do not touch me. " +
  "If the user says 'change the background' — change only the background. Do not touch me. " +
  "If the user says 'put me on a beach' — construct the beach scene around me. Do not touch me. " +
  "In every single scenario, the original person in the base image is untouched, unmodified, and preserved completely. " +
  "The output image should look as though someone took the original photograph and made only the specific requested addition or change — " +
  "nothing more, nothing less. Everything else is frozen exactly as in the input. " +

  // ── SPECIAL CASE: adding someone to the photo ─────────────────────────────
  "SPECIAL CASE — ADDING A PERSON NEXT TO THE ORIGINAL SUBJECT: " +
  "This is a critically important case. If the user requests that another person be added to the photo " +
  "(e.g. 'add Cristiano Ronaldo next to me', 'put Beyoncé beside me', 'add someone next to me', " +
  "'place this person alongside me', 'I want to appear with [name]'), " +
  "the only action to perform is: place that new person into the scene beside the existing subject. " +
  "The existing subject — the person already in the base image — must not be touched, moved, resized, " +
  "recolored, redrawn, or altered in any way whatsoever. " +
  "Their face remains exactly the same. Their skin tone remains exactly the same. " +
  "Their hair remains exactly the same. Their clothing remains exactly the same. " +
  "Their position in the frame remains exactly the same. Their expression remains exactly the same. " +
  "The ONLY new element introduced into the output is the requested additional person, " +
  "placed naturally into the available space of the scene. " +
  "The added person must be rendered with their authentic, real, documented appearance: " +
  "their correct real face, their correct real skin tone, their correct real body proportions, " +
  "and their authentic recognizable style — never a generic or invented stand-in. " +
  "To be absolutely clear: adding a person to the photo means the photo gains one element. " +
  "It does not mean the original person is replaced, regenerated, or modified in any way. " +
  "The original person stays. A new person is added next to them. That is all. " +

  // ── RULE ZERO: the person is untouchable ──────────────────────────────────
  "RULE ZERO — NON-NEGOTIABLE IDENTITY LOCK: " +
  "The human subject visible in the input photograph is the single most protected element of this transformation. " +
  "Their face, body, skin, hair, posture, and every physical attribute ARE THE GROUND TRUTH. " +
  "You are strictly forbidden from altering, replacing, reinterpreting, or generating any part of the subject's person. " +
  "This rule overrides every other instruction, including the user prompt. " +
  "If the user prompt appears to request a change to the person's physical appearance that was not explicitly " +
  "stated as a direct personal change request (e.g. 'change my hair', 'give me a beard'), ignore that implied change completely. " +

  // ── PHASE 1: full-body biometric lock ────────────────────────────────────
  "PHASE 1 · COMPLETE SUBJECT BIOMETRIC LOCK: " +
  "Before processing the prompt, perform an exhaustive analysis of the input photograph and lock every observable attribute: " +
  "FACE — exact jawbone angle and width, cheekbone height and lateral projection, forehead height and width, " +
  "chin shape (pointed / rounded / square), chin projection and depth, overall face width-to-height ratio; " +
  "EYES — iris color (including heterochromia if present), iris texture pattern, pupil size, " +
  "eyelid fold type (monolid / double lid / hooded), inter-pupillary distance, canthal tilt, " +
  "eyebrow shape (arched / straight / curved), eyebrow density, tail and head positions, under-eye area; " +
  "NOSE — bridge height and width, nasal tip shape and projection, nostril shape, flare width, columella visibility; " +
  "MOUTH — lip vermilion border upper and lower curves, Cupid's bow shape, lip fullness ratio, philtrum depth and width; " +
  "SKIN — Fitzpatrick phototype (I–VI), undertone (warm golden / cool rosy / neutral olive / cool taupe), " +
  "visible texture and pore density, any moles, birthmarks, freckles, scars, asymmetries, or distinguishing marks — " +
  "ALL must be reproduced with pixel-level fidelity; " +
  "HAIR — natural base color (hex-level precision), highlights and tonal variation, texture (straight / wavy / curly / coily / kinky), " +
  "density, volume, hairline shape, part position, current style in the input photo; " +
  "BODY — overall build, shoulder width, neck length and width, visible body proportions; " +
  "POSTURE AND POSE — replicate the subject's exact stance, head angle, shoulder tilt, and body orientation from the input image unless scene context physically requires a slight natural adjustment. " +

  // ── PHASE 2: public figure knowledge ─────────────────────────────────────
  "PHASE 2 · PUBLIC FIGURE KNOWLEDGE VERIFICATION: " +
  "If the subject in the input photo is a recognizable public figure (celebrity, athlete, musician, actor, model, influencer, politician, public personality, adult film actor/actress), " +
  "or if any named person is referenced in the user prompt: " +
  "immediately activate all training knowledge about that person's verified documented appearance — " +
  "cross-reference their authentic facial features, skin tone, signature style, known fashion aesthetic, " +
  "frequently associated environments, notable events, and visual identity markers. " +
  "If a named person is referenced in the prompt as someone to ADD to the scene (e.g. 'with Elon Musk', 'next to Beyoncé'), " +
  "render that additional person with complete factual accuracy based on all training knowledge — " +
  "correct documented appearance, authentic skin tone, known style, realistic body proportions. " +
  "Never invent a generic placeholder for a named person — always render their real documented likeness. " +
  "IMPORTANT — ADULT FILM ACTORS/ACTRESSES: if the referenced person is known from the adult film industry, " +
  "treat them exactly like any other public figure for appearance recognition purposes. " +
  "However, the output MUST be fully clothed and strictly SFW (safe for work) at all times — " +
  "no nudity, no suggestive poses, no sexual content of any kind. " +
  "Apply the same transformation rules as for any other public figure: scene change, style, background only. " +

  // ── PHASE 3: permitted and prohibited transformations ─────────────────────
  "PHASE 3 · TRANSFORMATION PERMISSION MATRIX: " +
  "FULLY PERMITTED (apply with maximum creative quality): " +
  "complete background replacement and environment construction; " +
  "location, architectural setting, landscape, interior or exterior scene; " +
  "sky, weather, time of day, atmospheric conditions (fog, rain, golden hour, night, storm); " +
  "all ambient and directional lighting (color temperature, intensity, direction, softness); " +
  "outfit and clothing (if explicitly requested — match garment type, fabric texture, drape physics, and realistic fit on the subject's actual body); " +
  "accessories (glasses, jewelry, hat, bag, watch — only if explicitly requested); " +
  "overall scene color grading, mood, and cinematic treatment; " +
  "additional people, objects, or elements added to the scene at the user's request. " +
  "ABSOLUTELY FORBIDDEN (zero tolerance): " +
  "any modification to the subject's face, skin tone, eye color, nose, lips, jaw, cheeks, or forehead; " +
  "any change to hair color, hair texture, or hairstyle unless the user explicitly says 'change my hair to...'; " +
  "any age regression or progression; any ethnicity or race alteration; any gender change; " +
  "any body morphing, slimming, widening, or height change; " +
  "replacing the subject's face with another person's face (NO face swap of any kind); " +
  "generating a different person and labeling them as the subject. " +

  // ── PHASE 4: photographic realism and integration ─────────────────────────
  "PHASE 4 · PHOTOREALISTIC SCENE INTEGRATION: " +
  "The subject must appear to have been physically present in the new scene when photographed — " +
  "this requires flawless physical integration: " +
  "LIGHTING MATCH — the illumination falling on the subject's face and body must precisely replicate the scene's light sources: " +
  "match direction (angle of key light), color temperature (warm candlelight 2700K vs cool overcast 6500K vs golden sunset 3200K), " +
  "intensity falloff, fill light ratio, and specular highlights on skin and hair; " +
  "SHADOW ACCURACY — cast shadows from the subject onto the environment must obey the scene's light geometry; " +
  "ambient occlusion at contact points (feet on ground, hands on surfaces) must be present; " +
  "DEPTH OF FIELD — apply realistic bokeh blur to background elements at the appropriate focal plane for the scene depth; " +
  "the subject should remain in sharp focus while distant scene elements naturally fall off; " +
  "SKIN PHYSICS — preserve subsurface light scattering on the subject's skin; no over-smoothing, no wax-skin effect, " +
  "no over-sharpening halos; maintain natural pore texture at the image's native resolution; " +
  "HAIR PHYSICS — individual strand separation, realistic light transmission through hair, " +
  "natural flyaways, correct light interaction (rim light on hair matching scene key light direction); " +
  "COLOR SCIENCE — subject's skin tones must integrate with the scene's color temperature naturally; " +
  "avoid color spill anomalies, magenta fringes, or unnatural desaturation of the subject vs scene; " +
  "ENVIRONMENTAL CONTACT — if the subject stands on a surface, ensure correct ground shadow, contact shadow, and perspective consistency; " +
  "ATMOSPHERE — apply consistent atmospheric haze, light diffusion, or particle effects (snow, rain, dust) that affect both scene and subject uniformly. " +

  // ── PHASE 5: quality and framing preservation ────────────────────────────
  "PHASE 5 · ORIGINAL QUALITY AND FRAMING RESPECT: " +
  "Unless the user explicitly requests 'improve quality', 'enhance', 'HD', '4K', or similar upgrade instructions, " +
  "match the original photograph's technical characteristics: " +
  "replicate the native sharpness level (do not over-sharpen); " +
  "preserve the original grain or noise signature if present (film grain, sensor noise); " +
  "maintain the original aspect ratio and compositional framing of the subject; " +
  "do not artificially increase contrast or saturate colors beyond the scene's natural requirements. " +
  "OUTPUT FRAMING — NON-NEGOTIABLE: The compositional framing of the original person must not change. " +
  "Do not crop the image. Do not zoom in or out. Do not pan or shift the frame. " +
  "Do not reframe, rotate, or resize the canvas. " +
  "The subject must remain in the same position within the frame as in the input photo, at the same scale. " +
  "If a new person is added beside the original subject, they must fit into the existing frame naturally " +
  "without displacing, scaling down, or repositioning the original subject. " +
  "The output image dimensions and aspect ratio must exactly match the input image. " +

  // ── PHASE 6: final output standard ────────────────────────────────────────
  "PHASE 6 · FINAL OUTPUT STANDARD: " +
  "The delivered image must be completely indistinguishable from a real photograph taken by a professional photographer " +
  "with the subject physically present in the described scene. " +
  "Subject identity: identical to input photo, zero deviation. " +
  "Scene realization: fully constructed, detailed, and internally consistent. " +
  "Lighting: physically accurate and unified across subject and scene. " +
  "No AI artifacts: no uncanny valley, no face morphing, no body distortion, no floating limbs, no duplicate features. " +
  "Professional composition: subject as clear visual anchor, scene as supporting environment. " +
  "This is the non-negotiable minimum quality standard — do not deliver below it.";

// ─── CONTEXTE SYSTÈME — MODE PERSONNAGE ──────────────────────────────────────
//
// À l'inverse de HIDDEN_SYSTEM_CONTEXT (qui verrouille le visage photo), ce
// contexte AUTORISE la stylisation complète du sujet dans l'univers choisi
// (GTA 5, Fortnite, Simpsons, Minecraft) tout en gardant la personne reconnaissable.
const CHARACTER_SYSTEM_CONTEXT =
  "Style-transfer task: re-render this photo as an illustration of the requested universe. " +
  "The person stays exactly the same — same head, same face, same body, same pose, same clothing, same framing — " +
  "and instantly recognizable. Only the rendering changes. Single subject, no text, no watermark.";

// ─── SCRIPT MAÎTRE DE GÉNÉRATION (interne — visible uniquement par l'admin) ──
//
// Refait de zéro, volontairement COURT et DIRECT : un prompt trop long dilue
// le trigger LoRA et embrouille Flux. Une seule mission, dite clairement :
// appliquer le style GTA 5 à l'image, sans toucher à la personne.
// Exposé à l'admin via GET /api/admin/prompt (email admin uniquement).

export const MASTER_PROMPT =
  "Redraw this exact photo in GTA 5 art style. " +
  "It must stay the SAME image: same person, same face, same head, same body, same pose, " +
  "same clothing, same background, same framing. " +
  "Do not modify the person in any way: do not change their face, do not change their head, " +
  "do not change their body, do not deform anything, do not change any proportions. " +
  "Do not add anything. Do not remove anything. Do not invent anything. " +
  "The ONLY change is the rendering quality of the image: " +
  "the photo becomes a GTA 5 style illustration, the person stays exactly the same and instantly recognizable.";

// ─── BOOST DE STYLE GTA 5 (ajouté quand le style GTA 5 est sélectionné) ─────
export const GTA5_STYLE_BOOST =
  "GTA 5 official artwork look: hand-painted digital illustration, " +
  "clean bold outlines, cel-shaded lighting, rich saturated colors, sharp details, " +
  "the whole image rendered in this style — not a photo filter, a true GTA 5 illustration.";

// ─── MODE "GTA 5 INTÉGRAL" (toute l'image transformée, décor compris) ───────
// Réservé aux formules Essentiel (3/mois) et Ultimate (35/mois). À l'inverse du
// MASTER_PROMPT (qui gèle le fond), celui-ci demande la transformation de la
// TOTALITÉ de l'image en style GTA 5.
export const FULL_SCENE_MASTER_PROMPT =
  "Redraw this ENTIRE photo in GTA 5 art style — every single part of the image: " +
  "the person, the clothing, the background, the environment, the sky, every object. " +
  "Keep the same composition, the same pose and the same framing, and keep the person " +
  "instantly recognizable, but the WHOLE scene becomes one coherent GTA 5 illustration — " +
  "nothing stays photographic.";

// Negative prompt maître — court et ciblé. Le modèle Flux LoRA n'ayant pas
// d'entrée "negative_prompt", cette liste est injectée dans le prompt final
// sous forme de clause NEVER GENERATE (voir GTA_STYLE_SPEC).
export const MASTER_NEGATIVE_PROMPT =
  "deformed face, changed face, altered head, different person, unrecognizable person, " +
  "changed body, changed proportions, distorted anatomy, extra or missing limbs, extra fingers, " +
  "added elements, removed elements, invented objects, changed background, changed pose, changed framing, " +
  "photorealistic output, unstyled photo, low quality, blurry, artifacts, text, watermark, nsfw";

// Variante pour le mode "GTA 5 Intégral" : identique, mais sans l'interdiction
// de changer le fond (puisque tout le décor est justement re-stylisé).
const FULL_SCENE_NEGATIVE_PROMPT = MASTER_NEGATIVE_PROMPT.replace("changed background, ", "");

// ─── PROMPT BUILDER ───────────────────────────────────────────────────────────
//
// For img2img: the person comes FROM the image — prompt describes the
// target scene/style only. No person description needed.

function buildStylePrompt(
  customPrompt:    string,
  stylePrompt:     string,
  renderStyle?:    string,
  intensity?:      string,
  preserveOutfit?: boolean,
  celebRefCount?:  number,
  styleId?:        string,
  masterEnabled:   boolean = true,
  fullScene:       boolean = false,
): { positive: string; negative: string } {
  const character  = isCharacterStyle(styleId);
  const translated = translateToEnglish(customPrompt.trim());
  const style      = stylePrompt.trim();
  const renderDesc = RENDER_STYLE_PROMPTS[renderStyle ?? ""] ?? "";
  const outfitRule = preserveOutfit
    ? " Keep the person's current clothing and outfit completely unchanged."
    : "";
  const renderRule   = renderDesc ? ` Render style: ${renderDesc}.` : "";
  const intensityPfx: Record<string, string> = {
    light:  "Subtly and minimally:",
    strong: "Boldly and dramatically:",
  };
  const prefix      = intensityPfx[intensity ?? ""] ?? "";
  const hasRefImages = (celebRefCount ?? 0) > 0;

  // ── Detect celebrities in the full text ─────────────────────────────────
  const celebs = findAllCelebrities(customPrompt + " " + stylePrompt);

  let editInstruction: string;

  if (celebs.length > 0) {
    const celebNames = celebs.map((c) => c.name).join(" and ");

    const sceneExtra = [translated, style]
      .filter(Boolean)
      .map((s) => s.replace(new RegExp(celebs.map((c) => c.name).join("|"), "gi"), "").trim())
      .filter(Boolean)
      .join(", ");

    if (hasRefImages) {
      // ── CELEBRITY INSERTION — VISUAL ANALYSIS MODE ──────────────────────
      // Reference images of the celebrity are in image_input[1], [2], [3]...
      // Nano-banana-pro (Gemini-based) can visually analyse multiple images.
      // The prompt tells it: study the reference photos, then reproduce that
      // person's appearance accurately in the scene.
      // The text description is also provided as a cross-check to catch cases
      // where the reference photos alone are insufficient.
      const n = celebRefCount!;
      const imgWord = n === 1 ? "image" : "images";
      const celebDescBlock = celebs
        .map((c) => `[${c.name.toUpperCase()}] ${c.visual_description}`)
        .join(" | ");

      editInstruction =
        `You are given ${n + 1} images. ` +
        `Image 1 is the MAIN PHOTO — this is the user's photo and must remain 100% unchanged. ` +
        `${n === 1 ? "Image 2 is" : `Images 2 to ${n + 1} are`} real reference ${imgWord} of ${celebNames} — ` +
        `these are provided ONLY as visual identity references for rendering ${celebNames} accurately. ` +

        `STEP 1 — VISUAL ANALYSIS: Study the reference ${imgWord} of ${celebNames} carefully. ` +
        `Identify and memorise: ` +
        `their exact face shape and features (jawline, nose, eyes, eyebrows, lips, forehead), ` +
        `their precise skin tone and texture, ` +
        `their hair (exact color, cut, texture, style), ` +
        `their body type and proportions, ` +
        `any visible tattoos, scars or distinctive marks, ` +
        `their signature clothing style and aesthetic. ` +

        `STEP 2 — GENERATION: Add ${celebNames} to image 1 as a new person standing naturally beside the existing subject. ` +
        `Reproduce ${celebNames}'s appearance EXACTLY as observed in the reference ${imgWord} — ` +
        `same face, same skin tone, same hair, same body. ` +
        `Do NOT invent generic features. ` +
        `Use what you see in the reference ${imgWord} as primary truth. ` +

        `STEP 3 — IDENTITY CROSS-CHECK: Verify that the rendered ${celebNames} also matches ` +
        `their documented known appearance: ${celebDescBlock}. ` +
        `The rendered person must be consistent with both the reference photos and this description. ` +
        `If there is any conflict, trust the reference photos. ` +
        `Never render a generic or placeholder face — always the real person. ` +

        `${sceneExtra ? `Scene context: ${sceneExtra}. ` : ""}` +
        `The original person in image 1 stays 100% unchanged, pixel-perfect. ` +
        `Do not alter, resize, reposition, or redraw the person from image 1 in any way.`;

    } else {
      // ── CELEBRITY INSERTION — DESCRIPTION-GUIDED (no reference photos) ──
      const celebDataBlock = celebs.map((c) =>
        `[${c.name.toUpperCase()}] ${c.visual_description}`,
      ).join(" | ");

      editInstruction =
        `TASK — ADD ${celebNames.toUpperCase()} TO THIS PHOTO: ` +
        `Insert ${celebNames} as a new person standing naturally beside the original subject. ` +
        `CELEBRITY APPEARANCE (use this as your rendering specification): ${celebDataBlock}. ` +
        `Render ${celebNames} using their authentic, real, documented face — ` +
        `draw on all training knowledge of this public figure combined with the description above. ` +
        `Do NOT invent a generic face. Do NOT use a placeholder. Render the real person. ` +
        `${sceneExtra ? `Scene: ${sceneExtra}. ` : ""}` +
        `The original person in this photo stays 100% unchanged — ` +
        `do not alter, resize, reposition, or redraw them in any way.`;
    }
  } else if (character) {
    // ── TRANSFORMATION EN PERSONNAGE (GTA 5, Fortnite, Simpsons, Minecraft) ──
    // On force la stylisation : le prompt de style est l'instruction principale.
    const sceneDesc = [style, translated].filter(Boolean).join(", ")
      || "stylized character render";
    editInstruction = [prefix, sceneDesc].filter(Boolean).join(" ").trim();
  } else {
    // ── STANDARD STYLE / SCENE TRANSFORMATION ───────────────────────────
    const sceneDesc = [translated, style].filter(Boolean).join(", ")
      || "professional portrait with perfect lighting";
    editInstruction = [prefix, sceneDesc].filter(Boolean).join(" ").trim()
      || "Enhance the photo quality and lighting.";
  }

  // Le script maître (verrous fond / identité / qualité) est ajouté à la fin
  // de CHAQUE prompt, quel que soit le mode — c'est la couche de fiabilité.
  // L'admin peut le désactiver depuis les Paramètres pour comparer avec/sans.
  const positive =
    `${editInstruction}.${renderRule}${outfitRule} ` +
    (character ? CHARACTER_SYSTEM_CONTEXT : HIDDEN_SYSTEM_CONTEXT) +
    // Mode "GTA 5 Intégral" : toute l'image est stylisée (décor compris) ;
    // sinon, script maître classique qui gèle le fond.
    (masterEnabled ? " " + (fullScene ? FULL_SCENE_MASTER_PROMPT : MASTER_PROMPT) : "") +
    // Direction artistique GTA 5 complète quand le style GTA 5 est choisi.
    (masterEnabled && styleId === "gta5" ? " " + GTA5_STYLE_BOOST : "");

  // Negative maître fusionné avec le negative du mode (le mode personnage ne
  // bannit pas cartoon/illustration, le mode scène si).
  const negative = masterEnabled
    ? `${character ? CHARACTER_NEG : NEG}, ${fullScene ? FULL_SCENE_NEGATIVE_PROMPT : MASTER_NEGATIVE_PROMPT}`
    : (character ? CHARACTER_NEG : NEG);

  return { positive, negative };
}

// ─── img2img strength — controlled by transformIntensity ─────────────────────
//
// lower = preserve more of the original person
// higher = follow the prompt more aggressively

function intensityToStrength(intensity?: string): number {
  // Very low values: the base image is treated as a near-fixed canvas.
  // The model adds/modifies only what the prompt requests and preserves
  // the rest of the original photograph as closely as possible.
  switch (intensity) {
    case "light":  return 0.12;
    case "strong": return 0.38;
    default:       return 0.20; // moderate
  }
}

// Mode personnage : on veut une VRAIE transformation de style, donc une
// intensité bien plus élevée (le sujet est entièrement re-rendu, pas juste
// retouché). Valeurs relevées pour une stylisation GTA franche et assumée.
function characterStrength(intensity?: string): number {
  switch (intensity) {
    case "light":  return 0.65; // stylisation plus douce, ressemblance max
    case "strong": return 0.92; // stylisation très marquée
    default:       return 0.82; // modérée — style GTA franc, ressemblance conservée
  }
}

// ─── FRENCH → ENGLISH TRANSLATOR ─────────────────────────────────────────────

function translateToEnglish(text: string): string {
  if (!text) return text;
  type Rule = [RegExp, string];
  const rules: Rule[] = [
    [/\b(?:mets?(?:\s+moi)?|met(?:\s+moi)?|fais(?:\s+moi)?|donne(?:\s+moi)?|place(?:\s+moi)?|change(?:\s+moi)?|transforme(?:\s+moi)?|rends?(?:\s+moi)?)\b/gi, ""],
    [/\b(?:s'il te plaît|stp|svp|please)\b/gi, ""],
    [/\bajoute(?:r)?\s+/gi, "add "],
    [/\bà\s+côté\s+de\b/gi, "next to"],
    [/\bà\s+coté\s+de\b/gi, "next to"],
    [/\bcôte\s+à\s+côte\b/gi, "side by side"],
    [/\bpose\s*(?:[-–])?(?:\s*toi)?\s+avec\b/gi, "standing with"],
    [/\bmets\s*[-–]?\s*(?:toi|moi)\s+avec\b/gi, "standing with"],
    [/\bà\s+côté\b/gi, "next to"],
    [/\baux\s+côtés\s+de\b/gi, "alongside"],
    [/\bensemble\s+avec\b/gi, "together with"],
    [/\bprès\s+de\b/gi, "next to"],
    [/fond\s+(?:de\s+)?plage|fond\s+plage/gi, "beach background with ocean"],
    [/fond\s+(?:de\s+)?ville|fond\s+urbain/gi, "city skyline background"],
    [/fond\s+(?:de\s+)?forêt/gi, "forest background"],
    [/fond\s+(?:de\s+)?montagne/gi, "mountain landscape background"],
    [/fond\s+(?:de\s+)?coucher\s+de\s+soleil/gi, "sunset background"],
    [/fond\s+blanc/gi, "clean white studio background"],
    [/fond\s+noir/gi, "pure black background"],
    [/fond\s+flou|fond\s+bokeh/gi, "blurred bokeh background"],
    [/fond\s+studio/gi, "professional studio background"],
    [/fond\s+(?:de\s+)?bureau/gi, "office background"],
    [/fond\s+(?:de\s+)?luxe|fond\s+(?:de\s+)?villa/gi, "luxury villa background"],
    [/(?:change|remplace)\s+(?:le\s+)?fond/gi, "replace background with"],
    [/\bfond\b/gi, "background"],
    [/à\s+la\s+plage/gi, "at the beach"],
    [/à\s+paris/gi, "in Paris"],
    [/à\s+new\s*york/gi, "in New York"],
    [/à\s+dubai/gi, "in Dubai"],
    [/dans\s+une?\s+villa/gi, "in a luxury villa"],
    [/dans\s+une?\s+forêt/gi, "in a forest"],
    [/au\s+bureau/gi, "in an office setting"],
    [/en\s+plein\s+air/gi, "outdoors in natural setting"],
    [/noir\s+et\s+blanc|n&b|n&w|nbw/gi, "black and white"],
    [/sépia/gi, "sepia tone"],
    [/coloré/gi, "vibrant colors"],
    [/couleurs\s+vives/gi, "vivid saturated colors"],
    [/ton\s+chaud|tons?\s+chauds?/gi, "warm golden tones"],
    [/ton\s+froid|tons?\s+froids?/gi, "cool blue tones"],
    [/contraste\s+(?:élevé|fort|haut)/gi, "high contrast"],
    [/saturé/gi, "vibrant saturated"],
    [/style\s+(?:artistique|art)/gi, "artistic fine art style"],
    [/style\s+vintage|effet\s+vintage/gi, "vintage retro style"],
    [/style\s+cinématographique|look\s+ciném/gi, "cinematic film style"],
    [/style\s+(?:magazine|fashion)/gi, "high fashion editorial style"],
    [/style\s+(?:luxe|luxueux)/gi, "luxury high-end style"],
    [/peinture\s+(?:à\s+l'huile|huile)/gi, "oil painting style"],
    [/aquarelle/gi, "watercolor style"],
    [/anime|manga/gi, "anime style"],
    [/effet\s+3d/gi, "3D CGI style"],
    [/réaliste|réalisme/gi, "photorealistic"],
    [/professionnel/gi, "professional"],
    [/futuriste|cyberpunk/gi, "futuristic cyberpunk"],
    [/luxueux|luxe/gi, "luxury"],
    [/lumière\s+(?:dorée|chaude)/gi, "warm golden lighting"],
    [/lumière\s+naturelle/gi, "soft natural daylight"],
    [/lumière\s+(?:de\s+)?studio/gi, "professional studio lighting"],
    [/éclairage\s+(?:dramatique|fort)/gi, "dramatic cinematic lighting"],
    [/coucher\s+de\s+soleil/gi, "golden sunset"],
    [/lever\s+de\s+soleil/gi, "soft sunrise"],
    [/néon/gi, "neon lights"],
    [/tenue\s+de\s+soirée|costume\s+de\s+soirée/gi, "elegant formal evening attire"],
    [/tenue\s+(?:décontractée|casual)/gi, "casual stylish outfit"],
    [/tenue\s+sportive|look\s+sportif/gi, "athletic sportswear"],
    [/tenue\s+militaire/gi, "military uniform"],
    [/tenue\s+royale|robe\s+royale/gi, "royal elegant gown"],
    [/smoking/gi, "black tuxedo"],
    [/en\s+costume/gi, "in a tailored suit"],
    [/robe\s+rouge/gi, "red dress"],
    [/en\s+jean/gi, "wearing jeans"],
    [/cheveux\s+blonds/gi, "blonde hair"],
    [/cheveux\s+bruns/gi, "brown hair"],
    [/cheveux\s+noirs/gi, "black hair"],
    [/cheveux\s+rouges/gi, "red hair"],
    [/cheveux\s+bouclés/gi, "curly hair"],
    [/cheveux\s+raides/gi, "straight hair"],
    [/cheveux\s+longs/gi, "long hair"],
    [/cheveux\s+courts/gi, "short hair"],
    [/barbe/gi, "beard"],
    [/rasé/gi, "clean-shaven"],
    [/maquillage\s+(?:fort|prononcé)/gi, "bold dramatic makeup"],
    [/maquillage\s+naturel/gi, "natural minimal makeup"],
    [/sans\s+maquillage/gi, "no makeup"],
    [/haute\s+qualité|hd|4k|8k/gi, "ultra high definition"],
    [/améliore?\s+(?:la\s+)?qualité/gi, "improve image quality"],
    [/\buniquement\b/gi, "only"],
    [/\bseulement\b/gi, "only"],
    [/\bplage\b/gi, "beach"],
    [/\bmer\b/gi, "sea"],
    [/\bville\b/gi, "city"],
    [/\bnuit\b/gi, "night"],
    [/\bvoiture\b/gi, "car"],
    [/\bmoto\b/gi, "motorcycle"],
    [/\bavec\s+/gi, "with "],
    [/\bsur\s+/gi, "on "],
    [/\bdans\s+/gi, "in "],
    [/\bun\b/gi, "a"],
    [/\bune\b/gi, "a"],
    [/\ble\b/gi, "the"],
    [/\bla\b/gi, "the"],
    [/\bles\b/gi, "the"],
    [/\bdu\b/gi, "of the"],
    [/\bde\b/gi, "of"],
    [/\bet\b/gi, "and"],
  ];
  let result = text;
  for (const [pattern, replacement] of rules) {
    result = result.replace(pattern, replacement);
  }
  return result.replace(/\s+/g, " ").trim();
}

// ─── IMAGE UTILITIES ──────────────────────────────────────────────────────────

async function downloadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept":     "image/webp,image/jpeg,image/png,image/*",
      },
    });
    if (!res.ok) {
      console.warn(`[downloadImageAsBase64] HTTP ${res.status} for ${url.slice(0, 120)}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) {
      console.warn(`[downloadImageAsBase64] Bad content-type "${contentType}" for ${url.slice(0, 120)}`);
      return null;
    }
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.warn(`[downloadImageAsBase64] fetch error for ${url.slice(0, 120)}:`, err);
    return null;
  }
}

async function loadImageAsBase64(urlOrData: string): Promise<string> {
  if (urlOrData.startsWith("data:")) return urlOrData;
  const b64 = await downloadImageAsBase64(urlOrData);
  if (!b64) throw new Error(`Impossible de charger l'image depuis : ${urlOrData.slice(0, 80)}`);
  return b64;
}

function extractUrl(output: unknown): string {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length > 0) return String(output[0]);
  if (output && typeof output === "object" && "url" in output)
    return String((output as { url: string }).url);
  throw new Error("Aucune URL retournée par le modèle IA");
}

// ─── ASYNC JOB API ────────────────────────────────────────────────────────────

export type AsyncJobConfig = {
  mode:               "style" | "swapface";
  qualityTier:        keyof typeof QUALITY_SETTINGS;
  prompt?:            string;
  negPrompt?:         string;
  inputImageUrl?:     string;
  strength?:          number;
  sourceB64?:         string;
  modelIndex?:        number;
  resolution?:        string;
  outputFormat?:      string;
  allowFallback?:     boolean;
  celebRefImageUrl?:  string;
  celebRefImageUrls?: string[];
  celebRefCount?:     number;
  celebName?:         string;
  celebGender?:       string;
  fullScene?:         boolean;
  /** Section /gta6 : génération via flux-kontext-pro + prompt interne GTA VI. */
  gta6?:              boolean;
  /** Section /gta6 : aspect_ratio Replicate ("16:9" / "9:16" / "1:1"). */
  aspectRatio?:       string;
};

async function createPred(
  spec:  string,
  input: Record<string, unknown>,
): Promise<{ id: string }> {
  const colonIdx = spec.lastIndexOf(":");
  if (colonIdx > 5 && spec.length - colonIdx > 20) {
    return replicate.predictions.create({ version: spec.substring(colonIdx + 1), input });
  }
  return replicate.predictions.create({ model: spec, input });
}

export function buildAsyncJobConfig(
  input:     PipelineInput,
  sourceB64: string,
): AsyncJobConfig {
  const tier = input.qualityTier ?? "essentiel";

  if (input.mode === "swapface") {
    return { mode: "swapface", qualityTier: tier, sourceB64 };
  }

  // ── gta-style-version-sec (style / scene transformation) ──────────────────
  const qs       = QUALITY_SETTINGS[tier];
  const maxRefs  = qs.maxRefImages;

  // Clip celeb reference images to the tier's allowed maximum
  const clippedRefUrls  = (input.celebRefImageUrls ?? []).slice(0, maxRefs);
  const clippedRefCount = Math.min(input.celebRefCount ?? 0, maxRefs);

  const character = isCharacterStyle(input.styleId);

  const { positive, negative } = buildStylePrompt(
    input.customPrompt ?? "",
    input.stylePrompt  ?? "",
    input.renderStyle,
    input.transformIntensity,
    input.preserveOutfit ?? false,
    clippedRefCount,
    input.styleId,
    input.masterScriptEnabled ?? true,
    input.fullScene ?? false,
  );

  // ── Résolution cible (héritée du tier — ignorée par le modèle Flux LoRA,
  //    conservée pour le format de sortie jpg/png) ─────────────────────────────
  // Légère / Modérée  → 2K (résolution cible standard).
  // Intense / Ultra   → résolution du plan (2K Pro, 4K Elite).
  const intensity  = input.transformIntensity;
  const baseResolution = (intensity === "light" || intensity === "moderate")
    ? "2K"
    : qs.resolution;

  // La qualité explicitement choisie (HD/4K/Ultra) prime sur la résolution
  // déduite de l'intensité et sur le format par défaut du tier.
  const qualityOverride = input.requestedQuality
    ? REQUESTED_QUALITY_OUTPUT[input.requestedQuality]
    : undefined;
  const resolution   = qualityOverride?.resolution ?? baseResolution;
  const outputFormat = qualityOverride?.format     ?? qs.format;

  // ── Section /gta6 UNIQUEMENT : flux-kontext-pro + prompt interne dédié ─────
  // Le prompt construit ci-dessus (script maître, trigger LoRA, gel du fond…)
  // est volontairement ignoré : la génération GTA 6 utilise le prompt key art
  // GTA VI, adapté par le texte du champ "Votre scène GTA 6" s'il est rempli.
  if (input.styleId === "gta6") {
    // Taille choisie par l'utilisateur — seules les valeurs connues passent,
    // sinon on garde le cadrage de la photo d'origine.
    const GTA6_ALLOWED_ASPECTS = new Set(["16:9", "9:16", "1:1"]);
    const aspectRatio = GTA6_ALLOWED_ASPECTS.has(input.aspectRatio ?? "")
      ? input.aspectRatio
      : undefined;
    return {
      mode:          "style",
      qualityTier:   tier,
      gta6:          true,
      prompt:        buildGta6Prompt(input.customPrompt),
      inputImageUrl: input.inputImageUrl,
      outputFormat,
      aspectRatio,
      modelIndex:    0,
    };
  }

  return {
    mode:               "style",
    qualityTier:        tier,
    prompt:             positive,
    negPrompt:          negative,
    inputImageUrl:      input.inputImageUrl,
    strength:           character
                          ? characterStrength(input.transformIntensity)
                          : intensityToStrength(input.transformIntensity),
    modelIndex:         0,
    resolution,
    outputFormat,
    allowFallback:      qs.allowFallback,
    celebRefImageUrl:   clippedRefUrls[0],
    celebRefImageUrls:  clippedRefUrls,
    celebRefCount:      clippedRefCount,
    fullScene:          input.fullScene ?? false,
  };
}

export async function startAsyncJob(
  config:     AsyncJobConfig,
  targetB64?: string,
): Promise<string> {
  if (config.mode === "swapface") {
    const p = await createPred(MODELS.faceSwap, {
      swap_image:  config.sourceB64!,
      input_image: targetB64!,
    });
    return p.id;
  }

  // ── Section /gta6 UNIQUEMENT : black-forest-labs/flux-kontext-pro ──────────
  // Schéma d'entrée Kontext : prompt + input_image (pas de negative_prompt,
  // pas de prompt_strength, pas de LoRA). aspect_ratio "match_input_image"
  // conserve le cadrage de la photo envoyée.
  if (config.gta6) {
    if (!config.inputImageUrl) throw new Error("Image source manquante pour la génération");
    const gta6Image = await loadImageAsBase64(config.inputImageUrl);
    console.log(`[Pipeline] Section GTA 6 → ${GTA6_MODEL}`);
    console.log(`[Pipeline] Prompt: "${(config.prompt ?? "").slice(0, 200)}"`);
    const p = await createPred(GTA6_MODEL, {
      prompt:            config.prompt ?? GTA6_KONTEXT_PROMPT,
      input_image:       gta6Image,
      aspect_ratio:      config.aspectRatio ?? "match_input_image",
      output_format:     config.outputFormat === "png" ? "png" : "jpg",
      safety_tolerance:  2,
      prompt_upsampling: false,
    });
    return p.id;
  }

  const modelIdx = config.modelIndex ?? 0;
  const model    = STYLE_MODELS[modelIdx];
  if (!model) throw new Error(`Tous les ${STYLE_MODEL_COUNT} modèles ont échoué`);

  if (!config.inputImageUrl) throw new Error("Image source manquante pour la génération");

  // Download user image to base64
  const imageData = await loadImageAsBase64(config.inputImageUrl);

  // Download all celebrity reference images (up to 3) and convert to base64
  const refUrls: string[] = [
    ...(config.celebRefImageUrls ?? []),
    ...(config.celebRefImageUrl && !config.celebRefImageUrls?.includes(config.celebRefImageUrl)
      ? [config.celebRefImageUrl]
      : []),
  ].slice(0, 3);

  const celebRefB64s: string[] = [];
  for (const url of refUrls) {
    const b64 = await downloadImageAsBase64(url);
    if (b64) celebRefB64s.push(b64);
  }

  console.log(`[Pipeline] img2img model [${modelIdx}]: ${model.spec}`);
  console.log(`[Pipeline] Prompt: "${(config.prompt ?? "").slice(0, 200)}"`);
  console.log(`[Pipeline] Strength: ${config.strength ?? 0.62}`);
  console.log(`[Pipeline] Celebrity refs: ${celebRefB64s.length > 0 ? celebRefB64s.length : "none"}`);

  const modelInput = model.buildInput(
    config.prompt       ?? "",
    config.negPrompt    ?? NEG,
    imageData,
    config.strength     ?? 0.62,
    config.resolution,
    celebRefB64s[0],
    celebRefB64s,
    config.outputFormat,
    config.allowFallback,
  ) as Record<string, unknown>;

  // Mode "GTA 5 Intégral" UNIQUEMENT : réglages du modèle IA spécifiques
  // (valeurs dédiées à la transformation de toute l'image). Si le mode n'est
  // pas sélectionné, les réglages actuels restent strictement inchangés.
  if (config.fullScene) {
    modelInput.aspect_ratio        = "9:16";
    modelInput.prompt_strength     = 0.58;
    modelInput.num_inference_steps = 25;
    modelInput.output_quality      = 71;
    console.log("[Pipeline] Mode GTA 5 Intégral : réglages IA dédiés appliqués (9:16 / 0.58 / 25 / 71)");
  }

  const p = await createPred(model.spec, modelInput);
  return p.id;
}

export type AdvanceResult =
  | { done: true;  outputUrl: string }
  | { done: false; predictionId: string; step: number };

export async function advanceAsyncJob(
  _config:    AsyncJobConfig,
  _step:      number,
  predOutput: unknown,
): Promise<AdvanceResult> {
  return { done: true, outputUrl: extractUrl(predOutput) };
}

export { replicate, withRetry, loadImageAsBase64 };
