"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Flame, ArrowLeft, Play, CheckCircle2, Lock, Lightbulb, AlertTriangle } from "lucide-react";

// La vidéo de la technique est servie par /api/snap-rouge/video :
// fichier stocké dans private-videos/tuto-snap-rouge.mp4 (hors de /public),
// accessible UNIQUEMENT aux acheteurs et abonnés Pro / Elite.
const TECHNIQUE_VIDEO_URL = "/api/snap-rouge/video";

// Étapes de la technique — personnalise librement les textes ci-dessous.
const TECHNIQUE_STEPS = [
  { title: "Préparez votre photo", desc: "Générez votre transformation IA sur High Like It et téléchargez le résultat en haute qualité sur votre téléphone." },
  { title: "Ouvrez Snapchat", desc: "Lancez Snapchat et accédez à l'appareil photo principal." },
  { title: "Appliquez la technique", desc: "Suivez précisément la vidéo ci-dessous pour envoyer votre image en Snap Rouge (et non en Snap violet)." },
  { title: "Envoyez votre Snap", desc: "Votre photo part comme un vrai Snap pris sur le moment — effet garanti." },
];

export default function SnapRougePage() {
  const router = useRouter();
  const [access, setAccess] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/snap-rouge/access")
      .then(res => res.json())
      .then(data => {
        if (data.access) setAccess(true);
        else router.replace("/dashboard?view=snaprouge");
      })
      .catch(() => router.replace("/dashboard?view=snaprouge"));
  }, [router]);

  if (access !== true) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-red-500/30 border-t-red-500"
        />
        <p className="text-white/40 text-sm flex items-center gap-2">
          <Lock className="w-4 h-4" /> Vérification de votre accès…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Fond ambiance rouge */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-red-500/10 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 w-[400px] h-[400px] rounded-full bg-accent-violet/10 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 relative z-10">

        {/* Retour */}
        <Link
          href="/dashboard?view=snaprouge"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au Dashboard
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Flame className="w-4 h-4" />
            Accès débloqué — Contenu exclusif
          </div>
          <h1 className="text-4xl sm:text-6xl font-black mb-4">
            La technique <span className="text-red-500">Snap Rouge</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Envoyez vos créations IA comme de vrais Snaps pris sur le moment.
            Suivez le guide étape par étape ci-dessous.
          </p>
        </motion.div>

        {/* Étapes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12"
        >
          {TECHNIQUE_STEPS.map((step, i) => (
            <div key={step.title} className="card flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 font-black flex-shrink-0">
                {i + 1}
              </div>
              <div>
                <p className="font-bold text-white mb-1">{step.title}</p>
                <p className="text-white/45 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Vidéo de la technique */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Play className="w-6 h-6 text-red-400" />
            La technique complète en vidéo
          </h2>
          <div className="rounded-3xl overflow-hidden border border-red-500/30 bg-surface shadow-lg shadow-red-500/10 max-w-3xl mx-auto">
            <video
              src={TECHNIQUE_VIDEO_URL}
              controls
              playsInline
              preload="metadata"
              controlsList="nodownload"
              onContextMenu={e => e.preventDefault()}
              className="w-full h-auto block"
            />
            <div className="px-5 py-4 flex items-center justify-between gap-3 border-t border-surface-border">
              <p className="font-semibold text-white text-sm">Tuto Snap Rouge — pas à pas</p>
              <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded-full flex-shrink-0">
                <Lock className="w-3 h-3" />
                Exclusif membres
              </span>
            </div>
          </div>
        </motion.div>

        {/* Conseils */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="card border-amber-400/20 bg-amber-400/5 flex items-start gap-4">
            <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-1">Conseil pro</p>
              <p className="text-white/50 text-sm leading-relaxed">
                Pour un rendu encore plus crédible, générez vos photos au format Portrait (9:16) —
                c&apos;est le format natif des Snaps.
              </p>
            </div>
          </div>
          <div className="card border-red-500/20 bg-red-500/5 flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-1">Rappel important</p>
              <p className="text-white/50 text-sm leading-relaxed">
                Cette technique est destinée à un usage créatif et humoristique entre amis.
                N&apos;utilisez jamais ce contenu pour tromper, harceler ou nuire à autrui.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA bas de page */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Créer ma transformation maintenant
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
