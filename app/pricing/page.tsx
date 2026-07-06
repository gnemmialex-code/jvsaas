"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Zap, Loader2, Sparkles, Crown, Infinity as InfinityIcon, ShieldCheck, Plus } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const PLANS = [
  {
    id: "plan_essentiel",
    name: "Essentiel",
    icon: <Zap className="w-5 h-5" />,
    credits: "2 500",
    creditsRaw: 2500,
    priceMonthly: 9.90,
    color: "border-surface-border",
    badge: null,
    tagline: "Pour découvrir l'IA",
    highlights: [
      { label: "Qualité", value: "HD 1080p" },
      { label: "Vitesse", value: "~45-60 sec" },
      { label: "File d'attente", value: "Partagée" },
    ],
    features: [
      "Génération photo uniquement",
      "Qualité HD 1080p",
      "Génération par description (sans univers)",
      "Vitesse standard (~45-60 secondes)",
      "File d'attente partagée",
      "Historique limité (30 images)",
      "Sans watermark",
      "Support standard (réponse 48-72h)",
      "Téléchargement en 1080p",
    ],
  },
  {
    id: "plan_pro",
    name: "Pro",
    icon: <Sparkles className="w-5 h-5" />,
    credits: "10 250",
    creditsRaw: 10250,
    bonusCredits: 1000,
    priceMonthly: 19.90,
    color: "border-accent-violet",
    badge: "Populaire",
    tagline: "Pour créer plus & mieux",
    highlights: [
      { label: "Qualité", value: "Ultra 4K" },
      { label: "Vitesse", value: "~20-30 sec" },
      { label: "File d'attente", value: "Accélérée" },
    ],
    features: [
      "Photo + Vidéo jusqu'à 5 secondes",
      "Qualité Ultra 4K (upscale x4)",
      "🔥 Technique Snap Rouge incluse",
      "4 univers de personnages (GTA 5, Fortnite, Simpsons, Minecraft)",
      "Vitesse prioritaire (~20-30 secondes)",
      "File d'attente accélérée",
      "Historique illimité",
      "Support prioritaire (réponse sous 24h)",
      "Partage direct réseaux sociaux",
      "API basique (100 req/jour)",
      "Statistiques d'usage détaillées",
    ],
  },
  {
    id: "plan_ultra",
    name: "Elite",
    icon: <Crown className="w-5 h-5" />,
    credits: "Illimité",
    creditsRaw: null,
    priceMonthly: 39.90,
    color: "border-accent-neon/50",
    badge: "Meilleure valeur",
    tagline: "L'expérience sans compromis",
    highlights: [
      { label: "Qualité", value: "8K Photoréaliste" },
      { label: "Vitesse", value: "~10-15 sec" },
      { label: "File d'attente", value: "Priorité absolue" },
    ],
    features: [
      "Photo + Vidéo 4K jusqu'à 30 secondes",
      "Qualité Ultra 8K — Photoréalisme maximum",
      "🔥 Technique Snap Rouge incluse",
      "Tous les univers de personnages",
      "Vitesse ultra (~10-15 secondes)",
      "Priorité absolue — jamais d'attente",
      "Licence commerciale incluse",
      "API illimitée (sans restriction)",
      "Accès bêta en avant-première",
      "Manager de compte dédié",
      "Modèles personnalisés sur demande",
      "Support VIP dédié (réponse < 4h)",
    ],
  },
];

const CREDIT_PACKS = [
  {
    id:       "pack_800",
    credits:  800,
    price:    9.90,
    badge:    null,
    tagline:  "Idéal pour quelques générations supplémentaires",
    perImage: "~8 images",
  },
  {
    id:       "pack_2000",
    credits:  2000,
    price:    19.98,
    badge:    "Meilleur rapport",
    tagline:  "Le plus économique — 25% moins cher par crédit",
    perImage: "~20 images",
  },
];

const FAQ = [
  {
    q: "Combien vaut un crédit ?",
    a: "1 image générée = 100 crédits. Pour la vidéo, comptez 200 crédits par seconde de vidéo générée.",
  },
  {
    q: "Les crédits non utilisés sont-ils reportés ?",
    a: "Oui, les crédits mensuels non utilisés sont reportés au mois suivant tant que votre abonnement est actif.",
  },
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, vous pouvez upgrader ou downgrader votre plan à n'importe quel moment. Le changement prend effet immédiatement.",
  },
  {
    q: "Combien de temps dure une génération ?",
    a: "En moyenne 20 à 40 secondes selon la complexité du modèle. Les plans Pro et Ultra bénéficient d'une file d'attente prioritaire.",
  },
  {
    q: "Puis-je utiliser les images commercialement ?",
    a: "Les images sont pour usage personnel et créatif uniquement. L'usage commercial nécessite une licence spéciale — contactez-nous.",
  },
  {
    q: "Comment fonctionne le remboursement ?",
    a: "Nous offrons un remboursement intégral sous 48h si vous n'êtes pas satisfait de vos premières générations.",
  },
];

function formatPrice(price: number) {
  return price.toFixed(2).replace(".", ",") + "€";
}

export default function PricingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPack, setLoadingPack] = useState<string | null>(null);

  const handleTopup = async (packId: string) => {
    setLoadingPack(packId);
    try {
      const res = await fetch("/api/stripe/create-topup-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();

      if (res.status === 401) {
        toast("Connectez-vous pour acheter des crédits", { icon: "🔒" });
        router.push("/login?redirect=/pricing");
        return;
      }
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Erreur lors du paiement");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoadingPack(null);
    }
  };

  const handleSubscribe = async (plan: typeof PLANS[0]) => {
    setLoadingPlan(plan.id);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, billing }),
      });
      const data = await res.json();

      if (res.status === 401) {
        toast("Connectez-vous pour souscrire à un plan", { icon: "🔒" });
        router.push("/login?redirect=/pricing");
        return;
      }
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Erreur lors de la création de la session de paiement");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* ── Fond animé global ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent-violet/10 blur-[100px]"
          animate={{ x: [0, 60, -20, 0], y: [0, 40, -15, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-accent-neon/7 blur-[90px]"
          animate={{ x: [0, -50, 20, 0], y: [0, 60, -20, 0], scale: [1, 1.3, 0.95, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[360px] h-[360px] rounded-full bg-accent-violet/8 blur-[80px]"
          animate={{ x: [0, 40, -30, 0], y: [0, -40, 20, 0], scale: [1, 1.15, 0.92, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        {/* Particules flottantes */}
        {[
          { x: "10%",  y: "15%", r: 3, dur: 4.2, delay: 0   },
          { x: "88%",  y: "8%",  r: 2, dur: 5.1, delay: 1.3 },
          { x: "25%",  y: "60%", r: 4, dur: 3.8, delay: 0.6 },
          { x: "75%",  y: "45%", r: 2, dur: 6.0, delay: 2.1 },
          { x: "55%",  y: "80%", r: 3, dur: 4.6, delay: 0.9 },
          { x: "40%",  y: "25%", r: 2, dur: 5.5, delay: 1.7 },
        ].map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-accent-violet/60"
            style={{ left: p.x, top: p.y, width: p.r * 2, height: p.r * 2 }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          />
        ))}
      </div>

      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl sm:text-6xl font-black mb-4">
            Choisissez votre <span className="gradient-text">plan</span>
          </h1>
          <p className="text-white/50 text-xl max-w-xl mx-auto mb-8">
            Des crédits renouvelés chaque mois pour générer vos personnages et vidéos.
          </p>

          {/* Toggle mensuel / annuel */}
          <div className="inline-flex items-center gap-1 bg-surface border border-surface-border rounded-2xl p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                billing === "monthly"
                  ? "bg-accent-violet text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                billing === "yearly"
                  ? "bg-accent-violet text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Annuel
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-bold">
                −17%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan, i) => {
            const monthlyPrice = plan.priceMonthly;
            const yearlyTotal = +(monthlyPrice * 12 * 0.83).toFixed(2);
            const yearlyPerMonth = +(yearlyTotal / 12).toFixed(2);

            const displayPrice = billing === "monthly" ? monthlyPrice : yearlyPerMonth;
            const displayTotal = billing === "yearly" ? yearlyTotal : null;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative card border-2 ${plan.color} flex flex-col ${
                  plan.badge === "Populaire" ? "shadow-violet scale-[1.02]" : ""
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs px-4 py-1 rounded-full font-bold whitespace-nowrap ${
                    plan.badge === "Populaire" ? "bg-accent-violet" : "bg-gradient-violet-neon"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                {/* Nom & icône */}
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    plan.name === "Elite"
                      ? "bg-accent-neon/15 text-accent-neon"
                      : "bg-accent-violet/15 text-accent-violet"
                  }`}>
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>
                <p className="text-white/40 text-xs mb-5">{plan.tagline}</p>

                {/* Prix */}
                <div className="mb-2">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black">{formatPrice(displayPrice)}</span>
                    <span className="text-white/40 text-sm mb-1">/mois</span>
                  </div>
                  {displayTotal && (
                    <p className="text-white/30 text-xs mt-1">
                      soit {formatPrice(displayTotal)} facturés annuellement
                    </p>
                  )}
                </div>

                {/* Crédits */}
                <div className="text-center mb-4 py-4 bg-surface-hover rounded-xl relative overflow-hidden">
                  {plan.creditsRaw === null ? (
                    <div className="flex items-center justify-center gap-2">
                      <InfinityIcon className="w-8 h-8 text-accent-violet" />
                      <span className="text-2xl font-black gradient-text">Illimité</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-black gradient-text">{plan.credits}</span>
                  )}
                  <p className="text-white/50 text-sm mt-1">crédits / mois</p>

                  {/* Badge bonus — uniquement si le plan a des crédits offerts */}
                  {"bonusCredits" in plan && plan.bonusCredits && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-bold">
                      <span>🎁</span>
                      + {plan.bonusCredits.toLocaleString("fr-FR")} crédits offerts
                    </div>
                  )}
                </div>

                {/* High Like It — qualité / vitesse / file */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {plan.highlights.map((h) => (
                    <div key={h.label} className="bg-surface-hover rounded-lg px-2 py-2 text-center">
                      <p className="text-white/35 text-[10px] uppercase tracking-wide mb-0.5">{h.label}</p>
                      <p className={`text-xs font-bold leading-tight ${
                        plan.name === "Elite" ? "text-accent-neon" : "text-accent-violet"
                      }`}>{h.value}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-white/70">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        plan.name === "Elite" ? "text-accent-neon" : "text-accent-violet"
                      }`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={!!loadingPlan}
                  className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    plan.name === "Elite"
                      ? "bg-gradient-to-r from-accent-neon/80 to-accent-violet text-white hover:opacity-90"
                      : plan.badge === "Populaire"
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {plan.name === "Elite" ? <Crown className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                      {plan.name === "Elite" ? "Accès Elite" : "Commencer"}
                    </>
                  )}
                </button>

                {/* Garantie sous le bouton */}
                <p className="flex items-center justify-center gap-1.5 mt-3 text-green-400/80 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                  Satisfait ou remboursé sous 48h
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Recharge de crédits ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          {/* Titre de section */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-violet/10 border border-accent-violet/25 text-accent-violet text-sm font-semibold mb-4">
              <Plus className="w-3.5 h-3.5" />
              Recharge de crédits
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-2">
              Besoin de plus de crédits ?
            </h2>
            <p className="text-white/50 max-w-md mx-auto text-sm">
              Rechargez à la demande sans changer votre abonnement. Les crédits s&apos;ajoutent instantanément à votre solde.
            </p>
          </div>

          {/* Cards packs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {CREDIT_PACKS.map((pack, i) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative card flex flex-col gap-4 border-2 ${
                  pack.badge ? "border-accent-violet shadow-violet" : "border-surface-border"
                }`}
              >
                {pack.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-violet text-white text-xs px-4 py-1 rounded-full font-bold whitespace-nowrap">
                    {pack.badge}
                  </div>
                )}

                {/* Crédits & prix */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-black gradient-text">
                      {pack.credits.toLocaleString("fr-FR")}
                    </p>
                    <p className="text-white/45 text-sm">crédits</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black">
                      {pack.price.toFixed(2).replace(".", ",")}€
                    </p>
                    <p className="text-white/35 text-xs">paiement unique</p>
                  </div>
                </div>

                {/* Infos */}
                <div className="space-y-1.5 text-sm text-white/55">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent-violet flex-shrink-0" />
                    <span>{pack.perImage} générées</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent-violet flex-shrink-0" />
                    <span>Ajout immédiat à votre solde</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent-violet flex-shrink-0" />
                    <span className="text-white/40 text-xs italic">{pack.tagline}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleTopup(pack.id)}
                  disabled={!!loadingPack}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    pack.badge ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {loadingPack === pack.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Acheter {pack.credits.toLocaleString("fr-FR")} crédits
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Note abonnement requis */}
          <p className="text-center text-white/30 text-xs mt-4">
            Un compte High Like It est requis. Les crédits achetés ne sont pas remboursables.
          </p>
        </motion.div>

        {/* ── Bannière Satisfait ou remboursé ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="relative overflow-hidden rounded-2xl border border-green-500/30 bg-green-500/5 px-6 py-8 text-center">
            {/* Glow décoratif */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-32 bg-green-500/15 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-3">
              {/* Icône */}
              <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-green-400" />
              </div>

              {/* Titre */}
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Satisfait ou <span className="text-green-400">remboursé</span>
              </h2>

              {/* Sous-titre */}
              <p className="text-white/60 text-base max-w-md">
                Pas convaincu par vos premières générations ? Contactez-nous dans les{" "}
                <strong className="text-white/85">48 heures</strong> suivant votre souscription et nous vous remboursons intégralement — sans question.
              </p>

              {/* Pills de garantie */}
              <div className="flex flex-wrap justify-center gap-3 mt-1">
                {[
                  "Remboursement en 48h",
                  "Sans justificatif",
                  "100% intégral",
                ].map((label) => (
                  <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-sm font-medium">
                    <Check className="w-3.5 h-3.5 flex-shrink-0" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Explication crédits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16"
        >
          <div className="card border-accent-violet/20 bg-accent-violet/5 flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-violet/15 rounded-xl flex items-center justify-center text-accent-violet flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white">1 image générée</p>
              <p className="text-white/50 text-sm">= 100 crédits</p>
            </div>
          </div>
          <div className="card border-accent-neon/20 bg-accent-neon/5 flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-neon/10 rounded-xl flex items-center justify-center text-accent-neon flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white">1 seconde de vidéo</p>
              <p className="text-white/50 text-sm">= 200 crédits</p>
            </div>
          </div>
        </motion.div>

        {/* Démarrage gratuit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card border-accent-neon/20 bg-accent-neon/5 text-center mb-16"
        >
          <h3 className="text-2xl font-bold mb-2">Essayez gratuitement</h3>
          <p className="text-white/50 mb-4">
            Créez un compte et recevez 100 crédits offerts (soit 1 image gratuite). Aucune carte bancaire requise.
          </p>
          <a href="/register" className="btn-primary inline-flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Créer mon compte gratuit
          </a>
        </motion.div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Questions <span className="gradient-text">fréquentes</span>
          </h2>
          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card"
              >
                <h4 className="font-semibold mb-2">{item.q}</h4>
                <p className="text-white/50 text-sm leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
