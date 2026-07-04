"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";

// Images réelles présentes dans /public/hero-gallery/ (noms d'origine conservés).
const HERO_GALLERY_FILES = [
  "1343619.png",
  "1725875952-5592-card.jpg",
  "HD-wallpaper-gta-6-vice-city-fan-art.jpg",
  "b3c84f0fb852eb9c6f42b2403f03682ae2e8aeb286445266.jpg.avif",
  "capture-decran-2023-12-05-a-10-01-33.jpg",
  "gta-6-cover-art-and-pre-order-reveal-comes-with-a-fresh-look_ngrc.jpg",
  "gta-6-mont-kalaga.avif",
  "gta-6-release-date.jpg",
  "gta_6_ambrosiajpg_3_-1024x576.jpg.webp",
  "image.jpg",
  "mapbigger.webp",
  "screenshots-in-hdr-in-4k-v0-ktnhnrevu7ze1.jpg.webp",
  "wp14444798.jpg",
  "wykaf2lsbtze1.png",
].map((name) => `/hero-gallery/${name}`);

// Images ajoutées ensuite dans /public/hero-gallery-new/ (artworks GTA V).
const HERO_GALLERY_NEW_FILES = [
  "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg",
  "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg",
  "30.jpg", "39.jpg", "46.jpg", "50.jpg", "55.jpg",
  "61.jpg", "63.jpg", "65.jpg", "66.jpg",
  "74.jpg", "75.jpg", "76.jpg", "79.jpg", "80.jpg", "81.jpg", "82.jpg", "88.jpg",
  "91.jpg", "95.jpg", "96.jpg", "97.jpg", "98.jpg",
  "100.jpg", "101.jpg", "102.jpg", "103.jpg",
].map((name) => `/hero-gallery-new/${name}`);

// Pool complet des images de fond, réparti sur toutes les rangées.
const ALL_BACKGROUND_IMAGES = [...HERO_GALLERY_FILES, ...HERO_GALLERY_NEW_FILES];

// Défilement très lent sur toutes les pages.
const SCROLL_DURATION_SEC = 480;

// Mélange aléatoire (Fisher-Yates).
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Répartit le pool en N groupes DISJOINTS (aucun fichier commun entre deux
// groupes) : chaque rangée ne pioche que dans son propre groupe, donc la même
// image ne peut jamais apparaître dans deux rangées en même temps.
function splitIntoGroups<T>(arr: T[], n: number): T[][] {
  const groups: T[][] = Array.from({ length: n }, () => []);
  arr.forEach((item, i) => groups[i % n].push(item));
  return groups;
}

const [DEFAULT_ROW1, DEFAULT_ROW2, DEFAULT_ROW3] = splitIntoGroups(ALL_BACKGROUND_IMAGES, 3);

// Une rangée qui défile, avec un espace entre chaque image.
function ImageRow({
  images,
  direction,
  durationSec,
}: {
  images: string[];
  direction: "left" | "right";
  durationSec?: number;
}) {
  // Dupliquer les images pour boucle seamless
  const doubled = [...images, ...images];

  return (
    <div className="overflow-hidden w-full">
      <div className={direction === "left" ? "animate-scroll-left" : "animate-scroll-right"}
        style={{ display: "flex", gap: "16px", width: "max-content", animationDuration: durationSec ? `${durationSec}s` : undefined, willChange: "transform" }}
      >
        {doubled.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 rounded-2xl overflow-hidden"
            style={{ width: 320, height: 420 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Cache la cellule si l'image n'existe pas encore
                (e.currentTarget.parentElement as HTMLElement).style.display = "none";
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Fond persistant : les images défilent derrière TOUTES les pages du site
// (fixed, plein écran, du haut jusqu'en bas), pas seulement derrière le hero.
// Une rangée en haut qui défile dans un sens, une autre en bas dans l'autre
// sens, avec un espace entre chaque image.
//
// L'assombrissement/flou progressif lié au scroll de la fenêtre n'est activé
// que sur la page d'accueil, qui scrolle réellement le document. Sur les
// pages qui scrollent dans un conteneur interne (ex. Dashboard), le scroll de
// la fenêtre reste bloqué à son maximum : laisser cet effet actif partout
// assombrirait ces pages à 100 % en permanence.
export default function SiteBackground() {
  const pathname = usePathname();
  const enableScrollDarken = pathname === "/";
  // Page "Se connecter" : fond opaque et flouté, défilement bien plus lent.
  const isLogin = pathname === "/login";
  const [row1, setRow1] = useState(DEFAULT_ROW1);
  const [row2, setRow2] = useState(DEFAULT_ROW2);
  const [row3, setRow3] = useState(DEFAULT_ROW3);

  // Réordonne aléatoirement à chaque chargement de page (après le rendu
  // serveur, pour ne jamais désynchroniser le HTML serveur/client). Chaque
  // rangée ne mélange que son propre groupe disjoint, donc une image ne peut
  // jamais se retrouver dans deux rangées à la fois.
  useEffect(() => {
    setRow1(shuffle(DEFAULT_ROW1));
    setRow2(shuffle(DEFAULT_ROW2));
    setRow3(shuffle(DEFAULT_ROW3));
  }, []);

  // Plus on descend dans la page, plus le fond devient flou et sombre —
  // au plus bas (ex. la FAQ), il est totalement flouté et assombri.
  // Flou plafonné à 8px : un blur plein écran est très coûteux en GPU (surtout
  // sur mobile) et l'assombrissement progressif fait déjà l'essentiel du travail.
  const { scrollYProgress } = useScroll();
  const blurPx  = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const filter  = useTransform(blurPx, (v) => (enableScrollDarken ? `blur(${v}px)` : isLogin ? "blur(8px)" : "none"));
  const darkOpacity = useTransform(scrollYProgress, [0, 1], [0, enableScrollDarken ? 0.85 : 0]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden select-none pointer-events-none">
      {/* Fond noir de base */}
      <div className="absolute inset-0 bg-background" />

      {/* Les 3 rangées, empilées avec exactement le même espace (16px) que
          celui qui sépare les images entre elles dans une rangée. */}
      <motion.div className="absolute inset-0 flex flex-col gap-4" style={{ opacity: 0.65, filter }}>
        <ImageRow images={row1} direction="left" durationSec={SCROLL_DURATION_SEC} />
        <ImageRow images={row2} direction="right" durationSec={SCROLL_DURATION_SEC} />
        <ImageRow images={row3} direction="left" durationSec={SCROLL_DURATION_SEC} />
      </motion.div>

      {/* ── Ombre marquée pour la lisibilité du texte partout sur le site ── */}
      <div className={`absolute inset-0 ${isLogin ? "bg-background/70" : "bg-background/58"}`} />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      {/* Blocs d'ombre verticaux noirs sur les 2 côtés, tout le long du site */}
      <div className="absolute top-0 bottom-0 left-0 w-40 bg-gradient-to-r from-black/60 from-20% to-transparent" />
      <div className="absolute top-0 bottom-0 right-0 w-40 bg-gradient-to-l from-black/60 from-20% to-transparent" />

      {/* ── Dégradé d'assombrissement progressif lié au scroll (accueil uniquement) ── */}
      {enableScrollDarken && (
        <motion.div className="absolute inset-0 bg-black" style={{ opacity: darkOpacity }} />
      )}
    </div>
  );
}
