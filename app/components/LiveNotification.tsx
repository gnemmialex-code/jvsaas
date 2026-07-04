"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const USERNAMES = [
  "darkwave.exe", "nxght_", "soleil.rx", "acidrain_", "cloudy.drxp",
  "velvet.era", "starfall.x", "moonkid.rx", "afterglow_", "crystal.fx",
  "noirbloom", "sakura.vx", "shimmer_", "ethereal.x", "zephyr.99",
  "aura.rx", "lxna_art", "voidcore", "neondrop", "flux.wave",
  "mistral.x", "aurora.vx", "dusk.mode", "glitch.exe", "phantom.rx",
  "echo.wav", "zenith_", "blvck.rose", "raven.fx", "lotus.xo",
  "nova.drxp", "hex.mode", "pixel.rx", "frost.wave", "ember.vx",
  "celest.ia", "neon.dusk", "mirror.rx", "haze.exe", "shadow.drxp",
  "lune.nxir", "kxsmos_", "pxrple.haze", "eclipse.vx", "drift.rx",
  "vxid_", "bloom.exe", "lunar.fx", "mirage_", "silk.rx",
];

const PLANS = [
  { name: "Essentiel", color: "text-white/70", badge: "bg-white/10" },
  { name: "Pro", color: "text-accent-orange", badge: "bg-accent-orange/20" },
  { name: "Elite", color: "text-amber-400", badge: "bg-amber-400/20" },
];

const ACTIONS = [
  "vient de se transformer en personnage GTA 5",
  "a créé son avatar Fortnite",
  "a utilisé le mode Vidéo IA",
  "vient de se transformer en personnage Simpsons",
  "a généré son avatar Minecraft en 4K",
  "vient de rejoindre",
  "a utilisé Image IA",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface NotifData {
  id: number;
  username: string;
  action: string;
  plan: (typeof PLANS)[number];
}

let counter = 0;

function buildNotif(): NotifData {
  return {
    id: ++counter,
    username: pickRandom(USERNAMES),
    action: pickRandom(ACTIONS),
    plan: pickRandom(PLANS),
  };
}

export default function LiveNotification() {
  const [notif, setNotif] = useState<NotifData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => {
      setNotif(buildNotif());
      setVisible(true);
      setTimeout(() => setVisible(false), 4500);
    };

    // First notification after 2.5s
    const first = setTimeout(show, 2500);
    // Then cycle every 8-12s
    let interval: ReturnType<typeof setInterval>;
    const startCycle = () => {
      interval = setInterval(() => {
        show();
      }, 8000 + Math.random() * 4000);
    };
    const cycleStart = setTimeout(startCycle, 3000);

    return () => {
      clearTimeout(first);
      clearTimeout(cycleStart);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
      <AnimatePresence>
        {visible && notif && (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex items-center gap-3 px-4 py-3 bg-surface/90 backdrop-blur-xl border border-surface-border rounded-2xl shadow-2xl max-w-xs"
          >
            {/* Avatar placeholder */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-orange to-accent-neon flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
              {notif.username[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                @{notif.username}
              </p>
              <p className="text-white/50 text-xs truncate">{notif.action}</p>
            </div>

            <span className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-lg ${notif.plan.badge} ${notif.plan.color}`}>
              {notif.plan.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
