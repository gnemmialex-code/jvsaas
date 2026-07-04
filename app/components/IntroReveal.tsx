"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

const AUDIO_SRC = "/audio/light_music-mind-relaxation-183925.mp3";

// Vraies images PNG transparentes déposées dans /public/clouds/ (cloud1.png,
// cloud2.png, …) — si aucune n'est trouvée, on retombe sur une silhouette
// cartoon dessinée en SVG pour que l'intro reste jolie en attendant.
const CLOUD_IMAGE_CANDIDATES = Array.from({ length: 12 }, (_, i) => `/clouds/cloud${i + 1}.png`);

// Icône "nuage" plate façon cartoon (silhouette classique à lobes arrondis), utilisée en repli.
const CLOUD_PATH =
  "M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6c0-53-43-96-96-96c-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160c0 2.7 .1 5.4 .2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144l368 0c70.7 0 128-57.3 128-128c0-61.9-44-113.6-102.4-125.4z";

interface CloudDeco {
  left: number;   // % (relatif au panneau)
  top: number;    // %
  size: number;   // vw
  flip: boolean;
  layer: "back" | "mid" | "front";
  imgIndex: number;
}

const LAYER_STYLE: Record<CloudDeco["layer"], { opacity: number; blur: number; sizeMin: number; sizeRange: number }> = {
  back:  { opacity: 0.28, blur: 3,   sizeMin: 28, sizeRange: 20 },
  mid:   { opacity: 0.62, blur: 1,   sizeMin: 18, sizeRange: 14 },
  front: { opacity: 1,    blur: 0,   sizeMin: 10, sizeRange: 12 },
};

// Beaucoup de nuages, sur trois profondeurs (gros et très pâles/flous en
// arrière-plan, moyens en profondeur intermédiaire, nets et détaillés au
// premier plan avec une ombre douce), dispersés au hasard pour un ciel
// dense et jamais identique d'un chargement à l'autre.
function generateClouds(count: number): CloudDeco[] {
  const clouds: CloudDeco[] = [];
  for (let i = 0; i < count; i++) {
    const r = i / count;
    const layer: CloudDeco["layer"] = r < 0.3 ? "back" : r < 0.62 ? "mid" : "front";
    const { sizeMin, sizeRange } = LAYER_STYLE[layer];
    clouds.push({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: sizeMin + Math.random() * sizeRange,
      flip: Math.random() > 0.5,
      layer,
      imgIndex: Math.floor(Math.random() * 1000),
    });
  }
  return clouds;
}

// Nuages supplémentaires massés le long du bord intérieur du rideau : ils
// débordent du panneau pour que la "coupure" entre les deux rideaux soit
// masquée par des nuages, jamais par une ligne droite.
function generateEdgeClouds(count: number): CloudDeco[] {
  const clouds: CloudDeco[] = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      left: 88 + Math.random() * 18,          // 88 % → 106 % : à cheval sur le bord
      top: (i / count) * 100 + Math.random() * (100 / count),
      size: 12 + Math.random() * 12,
      flip: Math.random() > 0.5,
      layer: Math.random() > 0.45 ? "front" : "mid",
      imgIndex: Math.floor(Math.random() * 1000),
    });
  }
  return clouds;
}

// Fond sombre du rideau avec un bord intérieur découpé en lobes de nuage
// (jamais une coupe droite). Le chemin est généré aléatoirement à chaque
// chargement : lobes qui gonflent vers l'extérieur, creux qui rentrent.
function generateEdgeLobes(count: number): number[] {
  // 82 % minimum : avec des panneaux de 62vw qui se chevauchent au centre,
  // les deux fonds sombres se recouvrent toujours (aucun jour possible).
  return Array.from({ length: count + 1 }, () => 82 + Math.random() * 16);
}

function scallopedPanelPath(lobes: number[]): string {
  const n = lobes.length;
  let d = `M0,0 L${lobes[0].toFixed(1)},0`;
  for (let i = 1; i < n; i++) {
    const y = (i / (n - 1)) * 100;
    const prevY = ((i - 1) / (n - 1)) * 100;
    const cy = (prevY + y) / 2;
    // Contrôle alterné vers l'extérieur puis l'intérieur → lobes arrondis façon nuage
    const cx = lobes[i - 1] + (i % 2 === 0 ? -16 : 16);
    d += ` Q${cx.toFixed(1)},${cy.toFixed(1)} ${lobes[i].toFixed(1)},${y.toFixed(1)}`;
  }
  d += ` L0,100 Z`;
  return d;
}

function DarkCloudBackdrop({ lobes, mirrored }: { lobes: number[]; mirrored?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      style={mirrored ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d={scallopedPanelPath(lobes)} fill="#0a0b12" />
    </svg>
  );
}

function CloudLayer({ clouds, images }: { clouds: CloudDeco[]; images: string[] }) {
  return (
    <>
      {clouds.map((c, i) => {
        const { opacity, blur } = LAYER_STYLE[c.layer];
        const commonStyle: CSSProperties = {
          left: `${c.left}%`,
          top: `${c.top}%`,
          width: `${c.size}vw`,
          height: "auto",
          transform: `translate(-50%, -50%) ${c.flip ? "scaleX(-1)" : ""}`,
          opacity,
          filter: blur > 0 ? `blur(${blur}px)` : c.layer === "front" ? "drop-shadow(0 6px 10px rgba(0,0,0,0.25))" : undefined,
        };
        if (images.length > 0) {
          // eslint-disable-next-line @next/next/no-img-element
          return <img key={i} src={images[c.imgIndex % images.length]} alt="" className="absolute" style={commonStyle} />;
        }
        return (
          <svg key={i} viewBox="0 0 640 512" className="absolute" style={commonStyle}>
            <path
              d={CLOUD_PATH}
              fill={c.layer === "back" ? "#9aa2ba" : c.layer === "mid" ? "#c7cde0" : "#ffffff"}
              stroke={c.layer === "front" ? "#11131c" : "none"}
              strokeWidth={c.layer === "front" ? 12 : 0}
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </>
  );
}

// De vrais nuages (PNG transparents si déposés dans /public/clouds/, sinon
// silhouette cartoon en repli) répartis sur deux rideaux — un à gauche, un à
// droite — qui recouvrent tout l'écran puis s'écartent chacun vers son
// propre côté, comme des portes qui s'ouvrent, pendant 3 à 4 secondes, à
// chaque chargement/actualisation du site. Un fond musical très doux joue en
// boucle ; l'autoplay avec son étant bloqué par la plupart des navigateurs
// tant que l'utilisateur n'a pas interagi, un bouton mute/unmute (icône
// seule, sans bulle) reste disponible en bas à droite, collé au bouton des
// avis.
const TARGET_VOLUME = 0.35;
const FADE_IN_MS = 2500;

export default function IntroReveal() {
  const [visible, setVisible] = useState(false);
  const [opening, setOpening] = useState(false);
  const [volume, setVolume] = useState(TARGET_VOLUME);
  const [showSlider, setShowSlider] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [cloudImages, setCloudImages] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeWrapperRef = useRef<HTMLDivElement | null>(null);
  const leftClouds = useMemo(() => generateClouds(34), []);
  const rightClouds = useMemo(() => generateClouds(34), []);
  const leftEdgeClouds = useMemo(() => generateEdgeClouds(9), []);
  const rightEdgeClouds = useMemo(() => generateEdgeClouds(9), []);
  const leftLobes = useMemo(() => generateEdgeLobes(7), []);
  const rightLobes = useMemo(() => generateEdgeLobes(7), []);

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
    setVisible(true);

    // Le ciel sombre reste fermé ~2 s (le temps que le site charge bien),
    // puis les deux rideaux de nuages s'écartent en 2 s.
    const openTimer = setTimeout(() => setOpening(true), 2000);
    const hideTimer = setTimeout(() => setVisible(false), 4400);

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

    let cancelled = false;
    Promise.all(
      CLOUD_IMAGE_CANDIDATES.map((src) =>
        fetch(src, { method: "HEAD" }).then((r) => (r.ok ? src : null)).catch(() => null)
      )
    ).then((results) => {
      if (!cancelled) setCloudImages(results.filter((r): r is string => !!r));
    });

    return () => {
      cancelled = true;
      clearTimeout(openTimer);
      clearTimeout(hideTimer);
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

      {visible && (
        <div className="fixed inset-0 z-[1000] pointer-events-none overflow-hidden">
          {/* Rideau gauche — fond sombre au bord intérieur découpé en nuage,
              recouvert de nuages. Il s'écarte vers la gauche : la découpe
              entre les deux rideaux suit les lobes, jamais une ligne droite. */}
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{ width: "62vw" }}
            initial={{ x: 0 }}
            animate={{ x: opening ? "-115vw" : 0 }}
            transition={{ duration: 2, ease: [0.76, 0, 0.24, 1] }}
          >
            <DarkCloudBackdrop lobes={leftLobes} />
            <CloudLayer clouds={leftClouds} images={cloudImages} />
            <CloudLayer clouds={leftEdgeClouds} images={cloudImages} />
          </motion.div>

          {/* Rideau droit — miroir du gauche, s'écarte vers la droite */}
          <motion.div
            className="absolute inset-y-0 right-0"
            style={{ width: "62vw" }}
            initial={{ x: 0 }}
            animate={{ x: opening ? "115vw" : 0 }}
            transition={{ duration: 2, ease: [0.76, 0, 0.24, 1] }}
          >
            <DarkCloudBackdrop lobes={rightLobes} mirrored />
            <CloudLayer clouds={rightClouds} images={cloudImages} />
            <CloudLayer
              clouds={rightEdgeClouds.map((c) => ({ ...c, left: 100 - c.left }))}
              images={cloudImages}
            />
          </motion.div>
        </div>
      )}

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
          aria-label="Régler le volume"
          className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          {volume === 0 || audioBlocked ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </>
  );
}
