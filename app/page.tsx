"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ReviewsBubble, { PROFILES } from "./components/ReviewsBubble";
import TrustNotification from "./components/TrustNotification";
import BeforeAfterSlider from "./components/BeforeAfterSlider";
import { useI18n } from "@/lib/i18n";
import {
  Star,
  ChevronDown,
  ImageDown, User, Download,
} from "lucide-react";

// ─── DONNÉES ────────────────────────────────────────────────────────────────

// Icônes + clés de traduction — le texte affiché est résolu via t() dans StatsSection.
const STATS_META = [
  { icon: ImageDown, step: "01", titleKey: "stats.upload.title",    descKey: "stats.upload.desc"    },
  { icon: User,      step: "02", titleKey: "stats.customize.title", descKey: "stats.customize.desc" },
  { icon: Download,  step: "03", titleKey: "stats.download.title",  descKey: "stats.download.desc"  },
];

const REVIEWS = [
  { name: "Soph!_mtbl", city: "Paris", stars: 5, text: "Incroyable ! Le résultat est tellement réaliste, j'ai partagé sur Instagram et tout le monde pensait que c'était vrai." },
  { name: "Lucasss9378!", city: "Lyon", stars: 5, text: "La qualité 4K est bluffante. En 30 secondes j'avais mon photo en style Hollywood. Je recommande vivement !" },
  { name: "Chl0E.BRZH", city: "Bordeaux", stars: 5, text: "Parfait pour les photos de profil. Le style Vogue Editorial est mon préféré, le rendu est professionnel." },
  { name: "Em1.Rtbu", city: "Nantes", stars: 4, text: "Très bon service ! Seul petit bémol, parfois 40 secondes au lieu de 20 habituellement. Je pense que je vais passer à Ultra pour aller plus vite !" },
  { name: "Cam.sdr", city: "Strasbourg", stars: 5, text: "Le style Met Gala est trop bien. On dirait une vraie photo de gala. Mes amis n'en reviennent pas !" },
  { name: "FelixStrxu", city: "Nice", stars: 5, text: "Simple, rapide, bluffant. Je l'utilise pour mes contenus créatifs. Le pipeline IA est vraiment au top." },
  { name: "Saitawann.94", city: "Paris", stars: 5, text: "La vérité c'est rapide, qualité et le résultat est direct au rendez-vous !" },

];

// Pour les exemples : dépose les vraies photos GTA 5 (avant/après) dans
// /public/examples/ avec exactement ces noms de fichiers. Tant qu'un fichier
// n'existe pas encore, un joli placeholder s'affiche à sa place (aucune image
// cassée) — dès que le fichier est ajouté, il apparaît automatiquement.
const EXAMPLES_IMAGES = [
  { style: "Kylian Mbappé",     before: "/examples/mbappe-avant.jpg",     after: "/examples/mbappe-apres.jpg" },
  { style: "IShowSpeed",        before: "/examples/speed-avant.jpg",      after: "/examples/speed-apres.jpg" },
  { style: "Cristiano Ronaldo", before: "/examples/ronaldo-avant.jpg",    after: "/examples/ronaldo-apres.jpg" },
  { style: "Clavicular",        before: "/examples/clavicular-avant.jpg", after: "/examples/clavicular-apres.jpg" },
];

// Clés de traduction — le texte affiché est résolu via t() dans FaqAccordion.
const FAQ_ITEMS_META = [
  { qKey: "faq.q1", aKey: "faq.a1" },
  { qKey: "faq.q2", aKey: "faq.a2" },
  { qKey: "faq.q3", aKey: "faq.a3" },
  { qKey: "faq.q4", aKey: "faq.a4" },
  { qKey: "faq.q5", aKey: "faq.a5" },
  { qKey: "faq.q6", aKey: "faq.a6" },
];

// ─── COMPOSANTS INTERNES ────────────────────────────────────────────────────

// Enveloppe générique : anime intensément son contenu (montée + zoom + fondu)
// en fonction du scroll, sans jamais ajouter de hauteur artificielle — donc
// aucun risque de "trou" vide dans le scroll.
function ScrollIntense({
  children,
  className,
  intensity = 1,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const y       = useTransform(scrollYProgress, [0, 0.5, 1], [140 * intensity, 0, -90 * intensity]);
  const opacity = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], [0, 1, 1, 0.35]);
  const scale   = useTransform(scrollYProgress, [0, 0.5, 1], [0.82, 1, 0.94]);

  return (
    // "relative" requis : framer-motion a besoin d'un conteneur positionné pour
    // calculer correctement l'offset de scroll (sinon warning + calculs faux).
    <motion.div ref={ref} style={{ y, opacity, scale }} className={`relative ${className ?? ""}`}>
      {children}
    </motion.div>
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ReviewsMarquee() {
  // Ordre mélangé à chaque chargement de page (mais stable côté serveur pour
  // éviter un mismatch d'hydratation) : le vrai mélange n'a lieu qu'après le
  // montage, côté client.
  const [reviews, setReviews] = useState(REVIEWS);
  const [profiles, setProfiles] = useState(PROFILES);

  useEffect(() => {
    setReviews(shuffleArray(REVIEWS));
    setProfiles(shuffleArray(PROFILES));
  }, []);

  return (
    <div className="relative overflow-hidden py-4">
      {/* Fade gauche */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      {/* Fade droite */}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div
        className="flex gap-5 w-max"
        style={{ animation: "marquee 40s linear infinite" }}
      >
        {[...reviews, ...reviews].map((review, i) => {
          const profile = profiles[i % profiles.length];
          return (
            <div
              key={i}
              className="w-56 flex-shrink-0 card border border-surface-border p-3 rounded-2xl transition-transform duration-[400ms] ease-out hover:scale-[1.03]"
            >
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: review.stars }).map((_, s) => (
                  <Star key={s} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
                {Array.from({ length: 5 - review.stars }).map((_, s) => (
                  <Star key={s} className="w-3 h-3 text-white/20" />
                ))}
              </div>
              <p className="text-white/70 text-xs leading-relaxed mb-2.5 line-clamp-3">
                {review.text}
              </p>
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/avatars/${profile.avatar}.jpg`}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
                <p className="text-white font-medium text-xs leading-none">{profile.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function ExampleCard({ ex, i }: { ex: (typeof EXAMPLES_IMAGES)[number]; i: number }) {
  const [broken, setBroken] = useState(false);

  // Vérifie que les 2 fichiers existent vraiment avant d'afficher le slider —
  // se fier uniquement à l'évènement onError de <img> est peu fiable en local
  // (une 404 quasi instantanée peut arriver avant que React n'attache le
  // listener, laissant l'image "cassée" affichée sans jamais basculer sur le
  // placeholder).
  useEffect(() => {
    if (!ex.before || !ex.after) return;
    let cancelled = false;
    Promise.all(
      [ex.before, ex.after].map((src) =>
        fetch(src, { method: "HEAD" }).then((r) => r.ok).catch(() => false)
      )
    ).then((results) => {
      if (!cancelled && !results.every(Boolean)) setBroken(true);
    });
    return () => { cancelled = true; };
  }, [ex.before, ex.after]);

  const hasImages = ex.before && ex.after && !broken;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, transition: { duration: 0.4, ease: "easeOut" } }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.06 }}
      className="group relative rounded-2xl overflow-hidden border border-surface-border hover:border-accent-violet/50 transition-all duration-300" style={{ aspectRatio: "9/16" }}
    >
      {hasImages ? (
        <BeforeAfterSlider before={ex.before} after={ex.after} alt={ex.style} onError={() => setBroken(true)} />
      ) : (
        /* Placeholder jusqu'à avoir de vraies images GTA 5 dans /public/examples/ */
        <div className="w-full h-full bg-surface-hover flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full gradient-bg-orange-animated flex items-center justify-center text-white font-bold text-lg">
            {ex.style.charAt(0)}
          </div>
          <p className="text-white/30 text-xs text-center px-4">
            Image exemple<br />{ex.style}
          </p>
          <p className="text-white/15 text-xs">/public/examples/</p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
        <p className="text-white text-[9px] sm:text-sm font-medium truncate">{ex.style}</p>
      </div>
    </motion.div>
  );
}

function ExamplesGallery() {
  return (
    <div className="mx-auto max-w-5xl grid grid-cols-4 gap-1.5 sm:gap-3">
      {EXAMPLES_IMAGES.map((ex, i) => (
        <ExampleCard key={`${ex.style}-${i}`} ex={ex} i={i} />
      ))}
    </div>
  );
}

function FaqAccordion() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {FAQ_ITEMS_META.map((item, i) => {
        const isOpen = open === i;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.4, ease: "easeOut" } }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={`border rounded-2xl overflow-hidden transition-all duration-200 shadow-[0_15px_35px_-18px_rgba(0,0,0,0.75)] ${
              isOpen ? "border-accent-violet/50 bg-accent-violet/5" : "border-surface-border bg-surface/40 backdrop-blur-sm"
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left group"
            >
              <span className={`font-semibold transition-colors ${isOpen ? "text-white" : "text-white/80 group-hover:text-white"}`}>
                {t(item.qKey)}
              </span>
              <ChevronDown
                className={`w-5 h-5 flex-shrink-0 ml-4 transition-all duration-300 ${
                  isOpen ? "rotate-180 text-accent-violet" : "text-white/30 group-hover:text-white/60"
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <p className="px-6 pb-5 text-white/60 leading-relaxed text-sm">
                    {t(item.aKey)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── PAGE PRINCIPALE ────────────────────────────────────────────────────────

// Dépose tes photos dans /public/avatars/ nommées 1.jpg, 2.jpg ... jusqu'à AVATAR_COUNT.jpg
const AVATAR_COUNT = 15;

function MiniAvatar({ n, delay }: { n: number; delay: number }) {
  const [broken, setBroken] = useState(false);
  const src = `/avatars/${n}.jpg`;

  useEffect(() => {
    setBroken(false);
  }, [src]);

  return (
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 1.6 + delay * 0.3, repeat: Infinity, ease: "easeInOut", delay: delay * 0.2 }}
      className="relative w-4 h-4 rounded-full border border-background overflow-hidden bg-surface flex-shrink-0"
    >
      <AnimatePresence>
        {!broken && (
          // eslint-disable-next-line @next/next/no-img-element
          <motion.img
            key={src}
            src={src}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setBroken(true)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function pickDistinctAvatars(count: number): number[] {
  const result: number[] = [];
  while (result.length < count) {
    const n = Math.floor(Math.random() * AVATAR_COUNT) + 1;
    if (!result.includes(n)) result.push(n);
  }
  return result;
}

// Petit hash déterministe (0..1) à partir d'un nombre — sert de "graine du jour"
function seededFraction(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Calcule le compteur du jour à partir de l'heure actuelle uniquement (aucun stockage
// nécessaire) : il ne peut donc jamais redescendre tant que la journée n'est pas finie,
// et se réinitialise naturellement à minuit. 0 → 1 000 en 5h, puis 1 000 → objectif
// aléatoire du jour (entre 4 000 et 9 900) réparti sur les 19h restantes.
function computeDailyCount(): number {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daySeed = midnight.getTime() / 86_400_000;
  const elapsedH = (now.getTime() - midnight.getTime()) / 3_600_000;

  if (elapsedH <= 5) {
    return Math.floor(1000 * (elapsedH / 5));
  }

  const dayTarget = 4000 + Math.floor(seededFraction(daySeed) * 5900);
  const hoursLeft = 19;
  const totalGrowth = dayTarget - 1000;

  const weights: number[] = [];
  let sumWeights = 0;
  for (let i = 0; i < hoursLeft; i++) {
    const w = 0.5 + seededFraction(daySeed * 137 + i);
    weights.push(w);
    sumWeights += w;
  }

  const hourIndex = Math.min(hoursLeft - 1, Math.floor(elapsedH - 5));
  const hourFraction = elapsedH - 5 - hourIndex;

  let value = 1000;
  for (let i = 0; i < hourIndex; i++) {
    value += (weights[i] / sumWeights) * totalGrowth;
  }
  value += (weights[hourIndex] / sumWeights) * totalGrowth * hourFraction;

  return Math.min(9900, Math.floor(value));
}

function LiveGenerationsCounter() {
  const { t } = useI18n();
  // Valeurs initiales déterministes (identiques serveur/client) pour éviter tout
  // mismatch d'hydratation : le vrai compteur et les avatars aléatoires ne sont
  // calculés qu'après le montage, côté client.
  const [count, setCount] = useState(0);
  const [avatars, setAvatars] = useState<number[]>([1, 2, 3]);

  useEffect(() => {
    setCount((c) => Math.max(c, computeDailyCount()));
    setAvatars(pickDistinctAvatars(3));
  }, []);

  // Reste raccordé aux notifications "vient de générer" (bas gauche) : chaque
  // notification ajoute exactement son nombre d'images à ce compteur, en plus
  // de la progression naturelle de la journée.
  useEffect(() => {
    const onGenerated = (e: Event) => {
      const detail = (e as CustomEvent<{ count: number }>).detail;
      if (detail?.count) setCount((c) => c + detail.count);
    };
    window.addEventListener("highlights:generated", onGenerated);
    return () => window.removeEventListener("highlights:generated", onGenerated);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => Math.max(c, computeDailyCount()));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers = [0, 1, 2].map((slot) =>
      setInterval(() => {
        setAvatars((prev) => {
          const others = prev.filter((_, i) => i !== slot);
          let next: number;
          do {
            next = Math.floor(Math.random() * AVATAR_COUNT) + 1;
          } while (others.includes(next));
          const updated = [...prev];
          updated[slot] = next;
          return updated;
        });
      }, 2500 + slot * 400)
    );
    return () => timers.forEach(clearInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35 }}
      className="flex items-center justify-center -mt-1"
    >
      <div className="inline-flex items-center gap-1">
        <div className="flex -space-x-1.5 flex-shrink-0 scale-75">
          {avatars.map((n, i) => (
            <MiniAvatar key={i} n={n} delay={i} />
          ))}
        </div>
        <p className="text-[9px] text-white/60 whitespace-nowrap">
          <span className="font-bold text-white mr-1">{count.toLocaleString("fr-FR")}</span> {t("hero.liveCounter")}{" "}
          <span className="font-bold gradient-text-orange-subtle">High Like It</span>
        </p>
      </div>
    </motion.div>
  );
}

function HeroSection() {
  const { t } = useI18n();
  const brand = t("hero.title.brand");
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="relative mt-4">
            {/* Nuage d'ombre derrière le titre pour le faire ressortir */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[130%] bg-black/55 rounded-full blur-3xl pointer-events-none" />
            <div style={{ transform: "scaleY(1.05)" }}>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.4, ease: "easeOut" } }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative font-hero-title uppercase text-white/85 text-3xl sm:text-5xl lg:text-6xl leading-[0.8] tracking-[-0.04em] mb-3 cursor-pointer"
              >
                <Link href="/dashboard" className="contents">
                  {t("hero.title.line1")}{" "}
                  <span className="gradient-text-orange-subtle">{t("hero.title.line1Accent")}</span>{" "}
                  <span className="gradient-text-orange-subtle">{brand}</span>{" "}
                  <span className="gradient-text-orange-subtle">2.0</span>
                </Link>
              </motion.h1>
            </div>
            <div className="h-1" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="flex items-center justify-center mb-5"
          >
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }} className="badge-neon-rainbow">
              <span className="px-4 py-1.5">
                <span className="gradient-text-neon-rainbow text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap">
                  ✨ Nouvelle version 2.0
                </span>
              </span>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-base italic font-light tracking-wide text-white/75 max-w-2xl mx-auto mb-6"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center mb-4 mt-8"
          >
            <motion.div
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Link
                href="/dashboard"
                className="gradient-bg-orange-animated text-xl sm:text-3xl font-black text-white px-10 sm:px-14 py-5 sm:py-6 flex items-center gap-2 group border border-white/25 rounded-2xl shadow-[0_0_45px_-5px_rgba(255,122,0,0.75),0_25px_50px_-12px_rgba(0,0,0,0.8)]"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.45)" }}
              >
                {t("hero.cta")}
              </Link>
            </motion.div>
          </motion.div>

          <LiveGenerationsCounter />
      </div>
    </section>
  );
}

function StatsSection() {
  const { t } = useI18n();
  return (
    <section className="py-3 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto"
      >
        {STATS_META.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03, transition: { duration: 0.4, ease: "easeOut" } }}
            className="card relative bg-white/5 py-5 pl-2 pr-4 min-h-[100px] overflow-hidden text-left"
          >
            <span className="absolute top-1 right-2 text-5xl font-black gradient-text opacity-70 leading-none">
              {stat.step}
            </span>
            <div className="text-base sm:text-xl font-bold text-white whitespace-nowrap">{t(stat.titleKey)}</div>
            <p className="text-[10px] font-light text-white/60 mt-3 leading-snug">{t(stat.descKey)}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function GallerySection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.4"],
  });

  const scale   = useTransform(scrollYProgress, [0, 1], [0.62, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.05, 1]);
  const y       = useTransform(scrollYProgress, [0, 1], [120, 0]);
  const blur    = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const filter  = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <section id="examples" ref={ref} className="py-3 px-4 sm:px-6 relative overflow-hidden">
      {/* Fond teinté */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      {/* Orbe violet haut-gauche */}
      <motion.div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-accent-violet/12 blur-3xl pointer-events-none"
        animate={{ x: [0, 50, 0], y: [0, 35, 0], scale: [1, 1.25, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Orbe neon bas-droite */}
      <motion.div
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-accent-neon/8 blur-3xl pointer-events-none"
        animate={{ x: [0, -40, 0], y: [0, -25, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      {/* Orbe violet centre-haut */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full bg-accent-violet/8 blur-2xl pointer-events-none"
        animate={{ scaleX: [0.8, 1.4, 0.8], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div style={{ scale, opacity, y, filter }} className="max-w-7xl mx-auto relative z-10">
        {/* Titre de la section avant/après */}
        <div className="text-center mb-6 sm:mb-10 px-2">
          <h2 className="text-xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            Avant <span className="gradient-text-orange-subtle">/</span> Après notre IA
          </h2>
          <p className="text-white/50 text-[11px] sm:text-base mt-2">
            Glissez le curseur pour découvrir la transformation
          </p>
        </div>
        <ExamplesGallery />
      </motion.div>
    </section>
  );
}

export default function HomePage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen">
      {/* Léger film sombre par-dessus le fond qui défile (même traitement que le Dashboard) */}
      <div className="fixed inset-0 bg-background/35 pointer-events-none z-0" />

      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <HeroSection />

      {/* ══ STATS (volontairement sous la ligne de flottaison) ══════════════ */}
      <StatsSection />

      {/* ══ AVIS CLIENTS ══════════════════════════════════════════════════ */}
      <section id="avis" className="py-3 overflow-hidden">
        <ScrollIntense>
          <ReviewsMarquee />
        </ScrollIntense>
      </section>

      {/* ══ GALERIE EXEMPLES ══════════════════════════════════════════════ */}
      <GallerySection />

      {/* ══ FAQ ═══════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-3 px-4 sm:px-6 bg-black/15">
        <ScrollIntense className="max-w-3xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl sm:text-5xl font-black mb-4 gradient-text-orange-subtle">
              {t("faq.title")}
            </h2>
          </div>

          <FaqAccordion />
        </ScrollIntense>
      </section>

      <Footer />
      <ReviewsBubble />
      <TrustNotification />
    </div>
  );
}
