"use client";

import { motion } from "framer-motion";
import { Check, Pen } from "lucide-react";
import { useState, useEffect } from "react";

function useIsPointerDevice() {
  const [isPointer, setIsPointer] = useState(false);
  useEffect(() => {
    setIsPointer(window.matchMedia("(hover: hover)").matches);
  }, []);
  return isPointer;
}

export interface Style {
  id: string;
  label: string;
  description: string;
  emoji: string;
  prompt: string;
  tags: string[];
  previewImg?: string;
  tier?: "pro" | "elite";
}

// ─── PERSONNAGES / UNIVERS ───────────────────────────────────────────────────
// Les 4 univers disponibles : GTA 5, Fortnite, Simpsons et Minecraft.
// 📸 PHOTOS : déposez les visuels d'aperçu dans /public/styles/ avec ces noms
//    de fichier exacts (previewImg). Formats : png/jpg/jpeg/webp.
// 🎭 Chaque univers TRANSFORME la personne de la photo uploadée en un personnage
//    de cet univers, en conservant sa ressemblance (prompt ci-dessous).
export const STYLES: Style[] = [
  {
    id: "gta5",
    label: "GTA 5",
    description: "Transformez-vous en personnage de GTA 5",
    emoji: "🎮",
    prompt: "transform the person in the photo into a Grand Theft Auto V (GTA 5) character, Rockstar Games loading screen art style, semi-realistic stylized illustration, bold outlines, cel-shaded rendering, cinematic Los Santos vibe, keeping the person's facial features and likeness recognizable, high detail, 4k",
    tags: ["Jeu vidéo", "GTA"],
    previewImg: "/styles/gta5.png",
  },
  {
    id: "fortnite",
    label: "Fortnite",
    description: "Transformez-vous en skin Fortnite",
    emoji: "🪂",
    prompt: "transform the person in the photo into a Fortnite character skin, Epic Games 3D cartoon render style, vibrant colors, glossy stylized shading, video game character render, keeping the person's facial features and likeness recognizable, high detail, 4k",
    tags: ["Jeu vidéo", "Fortnite"],
    previewImg: "/styles/fortnite.png",
  },
  {
    id: "simpsons",
    label: "Simpsons",
    description: "Transformez-vous en personnage des Simpsons",
    emoji: "🟡",
    prompt: "transform the person in the photo into a character from The Simpsons TV show, Matt Groening cartoon art style, yellow skin, big round eyes, bold black outlines, flat 2D animation style, keeping the person's recognizable features (hairstyle, glasses, clothing), high detail",
    tags: ["Cartoon", "Simpsons"],
    previewImg: "/styles/simpsons.png",
  },
  {
    id: "minecraft",
    label: "Minecraft",
    description: "Transformez-vous en personnage Minecraft",
    emoji: "🧱",
    prompt: "transform the person in the photo into a Minecraft character, blocky voxel 3D style, cubic pixelated blocks, low-resolution square textures, Minecraft skin aesthetic, keeping the person's recognizable colors and features, high detail render",
    tags: ["Jeu vidéo", "Minecraft"],
    previewImg: "/styles/minecraft.png",
  },
];

interface StyleSelectorProps {
  selected: string | null;
  onSelect: (style: Style) => void;
  customPrompt: string;
  onCustomPromptChange: (v: string) => void;
}

export default function StyleSelector({ selected, onSelect, customPrompt, onCustomPromptChange }: StyleSelectorProps) {
  const isPointerDevice = useIsPointerDevice();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STYLES.map((style, i) => {
          const isSelected = selected === style.id;
          return (
            <motion.button
              key={style.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={isPointerDevice ? { scale: 1.05, transition: { duration: 0.15 } } : undefined}
              onClick={() => onSelect(style)}
              className={`
                relative rounded-xl border text-left transition-all duration-200 overflow-hidden
                [@media(hover:hover)]:hover:z-10
                ${isSelected
                  ? "border-accent-orange shadow-orange"
                  : "border-surface-border bg-surface hover:border-accent-orange/40 hover:bg-surface-hover"
                }
              `}
            >
              {/* Image preview */}
              {style.previewImg && (
                <div className="w-full h-20 overflow-hidden bg-surface-hover relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={style.previewImg}
                    alt={style.label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                    }}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-accent-orange/20" />
                  )}
                </div>
              )}

              <div className={`p-3 ${isSelected ? "bg-accent-orange/10" : ""}`}>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-accent-orange rounded-full flex items-center justify-center z-10">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <span className="text-xl mb-1 block">{style.emoji}</span>
                <p className="font-semibold text-xs text-white leading-tight mb-0.5">
                  {style.label}
                </p>
                <p className="text-white/40 text-xs leading-tight">{style.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Prompt personnalisé */}
      <div className="border border-surface-border rounded-xl p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
          <Pen className="w-4 h-4" />
          Prompt personnalisé <span className="text-white/30 text-xs font-normal">(optionnel)</span>
        </p>
        <p className="text-white/30 text-xs mb-3">
          Décris en plus de détails ce que tu veux. S&apos;ajoute au style sélectionné.
        </p>
        <textarea
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          placeholder="Ex: fond urbain la nuit, vêtements en cuir, éclairage néon bleu, ambiance futuriste..."
          rows={6}
          className="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent-orange/60 resize-y min-h-[120px]"
        />
      </div>
    </div>
  );
}
