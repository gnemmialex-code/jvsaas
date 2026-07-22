"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const USERNAMES = [
  "darkwave.exe", "nxght_47", "soleil.rx", "acidrain_23", "cloudy.drxp",
  "velvet.era", "starfall.x88", "moonkid.rx", "afterglow_12", "crystal.fx",
  "noirbloom54", "sakura.vx", "shimmer_09", "ethereal.x", "zephyr.99",
  "aura.rx31", "lxna_art", "voidcore76", "neondrop", "flux.wave42",
  "lina.martel19", "thomasvibes92", "emma.laurentx", "nathan_07", "jade.moreno33",
  "lucas.bln65", "camille.rosee", "antoine_dlx44", "sarah.mln08", "maxime.wave21",
  "clara.benett", "hugo.vision87", "louane.sky77", "enzo.mrs15", "manon.lvy",
  "alexis.urban29", "chloe.martin", "yanis.off63", "mila.noir", "raphael.k38",
  "ines.blush", "theo.mood71", "zoe.arl05", "kevin_lx", "nina.vero56",
  "valentin.xo", "romane.ely90", "mathis.prv27", "lola.smn", "gabriel.nx14",
  "elisa.mr62", "paul.vision", "maelys.j83", "axel.dream", "alice.mnr49",
  "noah.lvn18", "eva.bloom", "adrien.kay35", "juliette.r", "samuel.wave07",
  "margot.ln94", "leo.mood", "victoria.mlx26", "damien.rv58", "romy.stars",
  "florian.ix41", "lena.msky", "arthur.night13", "amelie.vibe", "baptiste.one69",
  "maeva.cloud", "killian_rm24", "celia.moon80", "nolan_era", "oceane.lite52",
  "quentin.rz09", "pauline.joy", "julian.flo37", "helena.x", "matteo.skyy61",
  "anna.mls", "benjamin.vx45", "romy.laur", "victor.nox72", "ines.soleil16",
  "tristan.mr", "cloe.dream28", "loic.zen", "morgane.ln93", "enzo.ray08",
  "lilou.m", "sacha.mode51", "ambre.k", "nicolas.wave39", "elena.vr64",
  "corentin.l17", "iris.moon", "alex.mood82", "noemie.sky", "sebastien.x25",
  "cassie.mr70", "tommy.vibe", "alyssa.ln46", "romain.prv", "lou.martin11",
  "jules.era", "clara.nova59", "enzo_blv", "maely.m34", "dylan.rz",
  "nora.blu78", "adrien.mood", "lina.rose43", "kevin.nx", "jade.skyy20",
  "hugo.mlx", "eva.luna66", "nathan.riv", "chloe.vx91", "leo.urban",
];

// 1 et 3 reviennent plus souvent que 5 et 10 (poids via répétition)
const IMAGE_COUNTS = [1, 1, 1, 3, 3, 3, 5, 10];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let counter = 0;

// La notification démarre immédiatement au lancement du site, puis change
// toutes les 5 secondes.
const ROTATE_MS = 5_000;

export default function TrustNotification() {
  const { t } = useI18n();
  const [notif, setNotif] = useState<{ id: number; username: string; count: number } | null>(null);

  useEffect(() => {
    const show = () => {
      const count = pickRandom(IMAGE_COUNTS);
      setNotif({
        id: ++counter,
        username: pickRandom(USERNAMES),
        count,
      });
      window.dispatchEvent(new CustomEvent("highlights:generated", { detail: { count } }));
    };

    // Première notification dès l'arrivée sur le site, puis rotation.
    show();
    const intervalId = setInterval(show, ROTATE_MS);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50 pointer-events-none">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="cartGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#003d1a" />
            <stop offset="45%" stopColor="#00ff66" />
            <stop offset="100%" stopColor="#00e676" />
          </linearGradient>
        </defs>
      </svg>
      <AnimatePresence mode="wait">
        {notif && (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.4, ease: "easeOut" } }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="flex items-center gap-2.5 sm:gap-2 px-4 py-3.5 sm:px-3 sm:py-2.5 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl whitespace-nowrap pointer-events-auto"
          >
            {/* Légèrement plus grand sur téléphone uniquement — taille inchangée dès sm (tablette/ordinateur) */}
            <ShoppingCart className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" stroke="url(#cartGreenGradient)" strokeWidth={2.5} />
            <p className="text-white/80 text-sm sm:text-xs">
              <span className="font-semibold text-white">@{notif.username}</span>{" "}
              {t("trust.justGenerated")}{" "}
              <span className="gradient-text-neon-green font-bold">
                {notif.count} {t(notif.count > 1 ? "trust.imagesPlural" : "trust.imageSingular")}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
