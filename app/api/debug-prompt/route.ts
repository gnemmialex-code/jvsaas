import { NextRequest, NextResponse } from "next/server";

// Inline the relevant pipeline logic to preview the instruction without calling Replicate

const RENDER_STYLE_PROMPTS: Record<string, string> = {
  photoreal: "ultra-photorealistic, sharp natural details, true-to-life colors",
  magazine:  "high-fashion editorial photography, perfect studio lighting, magazine quality retouching",
  cinematic: "cinematic color grading, dramatic shadows and highlights, movie-quality aesthetic",
  artistic:  "fine art portrait photography, creative lighting, artistic composition",
};

const INTENSITY_PREFIX: Record<string, string> = {
  light:    "Subtly and minimally",
  moderate: "",
  strong:   "Boldly and dramatically",
};

function translateToEnglish(text: string): string {
  if (!text) return text;
  type Rule = [RegExp, string];
  const rules: Rule[] = [
    [/\b(?:mets?(?:\s+moi)?|met(?:\s+moi)?|fais(?:\s+moi)?|donne(?:\s+moi)?|place(?:\s+moi)?|change(?:\s+moi)?|transforme(?:\s+moi)?|rends?(?:\s+moi)?)\b/gi, ""],
    [/fond\s+(?:de\s+)?plage|fond\s+plage/gi, "beach background with ocean"],
    [/fond\s+(?:de\s+)?ville|fond\s+urbain/gi, "city skyline background"],
    [/fond\s+blanc/gi, "clean white studio background"],
    [/fond\s+noir/gi, "pure black background"],
    [/fond\s+studio/gi, "professional studio background"],
    [/fond\s+flou|fond\s+bokeh/gi, "blurred bokeh background"],
    [/(?:change|remplace)\s+(?:le\s+)?fond/gi, "replace the background with"],
    [/\bfond\b/gi, "background"],
    [/à\s+la\s+plage/gi, "at the beach"],
    [/à\s+paris/gi, "in Paris"],
    [/noir\s+et\s+blanc|n&b/gi, "black and white"],
    [/coucher\s+de\s+soleil/gi, "golden sunset lighting"],
    [/lumière\s+(?:dorée|chaude)/gi, "warm golden hour lighting"],
    [/lumière\s+naturelle/gi, "soft natural daylight"],
    [/tenue\s+de\s+soirée/gi, "elegant formal evening attire"],
    [/tenue\s+sportive/gi, "athletic sportswear outfit"],
    [/smoking/gi, "elegant black tuxedo"],
    [/en\s+costume/gi, "wearing a tailored suit"],
    [/cheveux\s+blonds/gi, "blonde hair"],
    [/cheveux\s+bruns/gi, "brown hair"],
    [/cheveux\s+noirs/gi, "black hair"],
    [/\bavec\s+/gi, "with "],
    [/\bsur\s+/gi, "on "],
    [/\bdans\s+/gi, "in "],
    [/\bun\b/gi, "a"],
    [/\bune\b/gi, "a"],
    [/\ble\b/gi, "the"],
    [/\bla\b/gi, "the"],
    [/\bles\b/gi, "the"],
    [/\bde\b/gi, "of"],
    [/\bet\b/gi, "and"],
  ];
  let result = text;
  for (const [pattern, replacement] of rules) {
    result = result.replace(pattern, replacement);
  }
  return result.replace(/\s+/g, " ").trim();
}

function buildEditInstruction(
  customPrompt: string,
  stylePrompt: string,
  renderStyle?: string,
  intensity?: string,
  preserveOutfit = false,
): string {
  const translated = translateToEnglish(customPrompt.trim());
  const style = stylePrompt.trim();

  let changeDesc: string;
  if (translated && style) {
    changeDesc = `Apply this visual style — ${style}. Additional adjustment: ${translated}`;
  } else if (style) {
    changeDesc = `Apply this visual style — ${style}`;
  } else if (translated) {
    changeDesc = translated;
  } else {
    changeDesc = "Enhance the photo quality, lighting, and professional aesthetic";
  }

  const renderDesc = (renderStyle && RENDER_STYLE_PROMPTS[renderStyle])
    ? `Render quality: ${RENDER_STYLE_PROMPTS[renderStyle]}.`
    : "";

  const prefix = (intensity && INTENSITY_PREFIX[intensity])
    ? `${INTENSITY_PREFIX[intensity]} transform: `
    : "";

  const preserveList = [
    "the person's face, eyes, nose, mouth, and all facial features",
    "their exact skin tone and complexion",
    "their hair color, texture, and style",
    "their body shape and proportions",
  ];
  if (preserveOutfit) {
    preserveList.push("their current clothing and outfit (do not change clothes)");
  }

  return [
    `${prefix}${changeDesc}.`,
    renderDesc,
    `Preserve exactly: ${preserveList.join("; ")}.`,
    "Do NOT alter the person's identity, duplicate them, or add any new people.",
    "The result must look photorealistic and professionally photographed.",
  ].filter(Boolean).join(" ");
}

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const {
    custom_prompt  = "",
    style_prompt   = "",
    render_style,
    intensity      = "moderate",
    output_format  = "auto",
    preserve_outfit = "0",
    style_label    = "Custom",
  } = body;

  const instruction = buildEditInstruction(
    custom_prompt,
    style_prompt,
    render_style,
    intensity,
    preserve_outfit === "1",
  );

  const ASPECT_RATIOS: Record<string, string> = {
    square:    "1:1",
    portrait:  "3:4",
    landscape: "16:9",
    auto:      "match_input_image",
  };

  return NextResponse.json({
    debug: {
      style_label,
      custom_prompt_original: custom_prompt,
      custom_prompt_translated: custom_prompt
        ? (() => {
            let t = custom_prompt;
            // Quick translation preview
            t = t.replace(/fond\s+(?:de\s+)?plage/gi, "beach background");
            t = t.replace(/coucher\s+de\s+soleil/gi, "golden sunset");
            t = t.replace(/\bfond\b/gi, "background");
            return t;
          })()
        : null,
      render_style: render_style ?? "(aucun)",
      intensity,
      output_format,
      aspect_ratio: ASPECT_RATIOS[output_format] ?? "match_input_image",
      preserve_outfit: preserve_outfit === "1",
    },
    instruction_sent_to_flux: instruction,
    instruction_length: instruction.length,
    model: process.env.REPLICATE_IMG2IMG_MODEL || "gnemmialex-code/gta-model-5-last:38230a374678b0ed7e0f8183eebfebadeed4331329ac0ae0cffde30fe25b32a4",
    note: "Vérifiez que cette instruction correspond bien à ce que vous voulez. Si l'image source est vide, le modèle ignore complètement votre photo.",
  });
}
