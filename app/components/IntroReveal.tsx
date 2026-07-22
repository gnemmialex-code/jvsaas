"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const AUDIO_SRC = "/audio/light_music-mind-relaxation-183925.mp3";

// Un fond musical très doux joue en boucle ; l'autoplay avec son étant bloqué
// par la plupart des navigateurs tant que l'utilisateur n'a pas interagi, un
// bouton mute/unmute (icône seule, sans bulle) reste disponible en bas à
// droite, collé au bouton des avis.
const TARGET_VOLUME = 0.35;
const FADE_IN_MS = 2500;

export default function IntroReveal() {
  const { t } = useI18n();
  const [volume, setVolume] = useState(TARGET_VOLUME);
  const [showSlider, setShowSlider] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeWrapperRef = useRef<HTMLDivElement | null>(null);

  // Fait monter le volume en douceur de 0 jusqu'au niveau choisi, plutôt
  // qu'un démarrage brutal — "un fondu" à l'arrivée sur le site.
  const fadeInAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = volume || TARGET_VOLUME;
    const start = performance.now();
    audio.volume = 0;
    const step = (now: number) => {
      // Clamp bas : le timestamp rAF peut précéder performance.now() de départ,
      // ce qui donnerait un volume négatif (IndexSizeError).
      const progress = Math.min(1, Math.max(0, (now - start) / FADE_IN_MS));
      audio.volume = target * progress;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  useEffect(() => {
    const tryPlay = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.muted = false;
      audio.play().then(() => { setAudioBlocked(false); fadeInAudio(); }).catch(() => setAudioBlocked(true));
    };
    tryPlay();

    // Le son doit "toujours" démarrer : si l'autoplay est bloqué par le
    // navigateur, on retente au tout premier geste de l'utilisateur, où
    // qu'il clique/appuie sur la page (pas seulement sur le bouton volume).
    const unlockOnInteraction = () => {
      if (audioRef.current && audioRef.current.paused) tryPlay();
    };
    window.addEventListener("pointerdown", unlockOnInteraction, { once: true });
    window.addEventListener("keydown", unlockOnInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockOnInteraction);
      window.removeEventListener("keydown", unlockOnInteraction);
    };
  }, []);

  // Ferme la barre de volume si on clique en dehors
  useEffect(() => {
    if (!showSlider) return;
    const handler = (e: MouseEvent) => {
      if (volumeWrapperRef.current && !volumeWrapperRef.current.contains(e.target as Node)) {
        setShowSlider(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSlider]);

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = v;
      audio.muted = v === 0;
    }
    if (audioBlocked) {
      audioRef.current?.play().then(() => setAudioBlocked(false)).catch(() => {});
    }
  };

  const handleVolumeButtonClick = () => {
    if (audioBlocked) {
      audioRef.current?.play().then(() => setAudioBlocked(false)).catch(() => {});
    }
    setShowSlider((s) => !s);
  };

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="auto" />

      {/* Collé au bouton des avis (bottom-1 right-1, 32px) — juste l'icône, sans bulle ni fond */}
      <div ref={volumeWrapperRef} className="fixed bottom-1 right-10 z-50">
        <AnimatePresence>
          {showSlider && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center justify-center bg-black/70 backdrop-blur-md border border-white/10 rounded-full py-3 px-2"
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="volume-slider"
                style={{ writingMode: "vertical-lr", direction: "rtl", width: 4, height: 72 }}
                aria-label="Volume"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleVolumeButtonClick}
          aria-label={t("intro.volume")}
          className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          {volume === 0 || audioBlocked ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </>
  );
}
