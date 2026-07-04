"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  Sparkles, Download, Trash2, Zap, LogOut,
  Film, Crown, Settings, History,
  Check, CheckCircle, Star, Replace, PlusCircle, AlertCircle, StopCircle, Lock, Eye, EyeOff,
  Gift, Copy, LogIn, UserPlus, Users, Loader2, ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isPaidPlan } from "@/lib/plan";
import { resizeImageFile } from "@/lib/resize-image";
import Navbar from "../components/Navbar";
import UploadBox from "../components/UploadBox";
import VideoUploadBox from "../components/VideoUploadBox";
import { STYLES, Style } from "../components/StyleSelector";
import PaywallModal from "../components/PaywallModal";
import TrustNotification from "../components/TrustNotification";

/* ─── Refinement options ─────────────────────────────────── */
interface OptionItem { id: string; label: string; prompt: string; }

const CLOTHING_OPTIONS: OptionItem[] = [
  { id: "casual",        label: "👕 Casual chic",    prompt: "casual chic outfit, relaxed stylish attire" },
  { id: "formal_suit",   label: "🤵 Costume formel", prompt: "wearing a formal suit, sharp elegant attire" },
  { id: "elegant_dress", label: "👗 Robe élégante",  prompt: "wearing an elegant evening dress, glamorous" },
  { id: "streetwear",    label: "🧢 Streetwear",     prompt: "streetwear urban fashion, trendy look" },
  { id: "haute_couture", label: "✨ Haute couture",  prompt: "haute couture designer fashion, luxury outfit" },
  { id: "sporty",        label: "⚡ Sportswear",     prompt: "athletic sportswear, dynamic sporty look" },
];

const MOOD_OPTIONS: OptionItem[] = [
  { id: "glamour",      label: "💫 Glamour",      prompt: "glamorous confident stunning expression" },
  { id: "edgy",         label: "🖤 Edgy",          prompt: "edgy rock aesthetic, intense bold look" },
  { id: "romantic",     label: "🌸 Romantique",    prompt: "romantic soft aesthetic, gentle warm expression" },
  { id: "professional", label: "💼 Pro",           prompt: "professional confident businesslike look" },
  { id: "mysterious",   label: "🌙 Mystérieux",    prompt: "mysterious alluring dark expression" },
  { id: "futuristic",   label: "🤖 Futuriste",     prompt: "futuristic cyberpunk aesthetic, neon vibes" },
];

const BACKGROUND_OPTIONS: OptionItem[] = [
  { id: "studio",     label: "⬜ Studio",     prompt: "clean professional studio background" },
  { id: "city_night", label: "🌃 Ville nuit", prompt: "nighttime cityscape background, bokeh lights" },
  { id: "nature",     label: "🌿 Nature",     prompt: "lush green nature outdoor background" },
  { id: "luxury",     label: "💎 Luxe",       prompt: "luxury opulent interior background" },
  { id: "beach",      label: "🏖️ Plage",      prompt: "golden hour tropical beach background" },
  { id: "abstract",   label: "🎨 Abstrait",   prompt: "abstract colorful artistic background" },
];

/* Fond de l'image : toujours gelé. Cette consigne est injectée d'office dans
   chaque génération (l'ancienne carte "Scène" a été retirée — le mode
   "Ne pas changer" est sélectionné de base, sans être visible). */
const KEEP_BACKGROUND_PROMPT =
  "STRICT BACKGROUND FREEZE: the background of the original photo must remain completely unchanged and untouched — same content, same layout, same colors, do not replace, repaint or restyle the background in any way; transform ONLY the person into the style";

const ACCESSORY_OPTIONS: OptionItem[] = [
  { id: "none",       label: "❌ Aucun",      prompt: "" },
  { id: "sunglasses", label: "🕶️ Lunettes",   prompt: "wearing stylish designer sunglasses" },
  { id: "jewelry",    label: "💍 Bijoux",     prompt: "wearing luxury gold jewelry and accessories" },
  { id: "hat",        label: "🎩 Chapeau",    prompt: "wearing a stylish fashionable hat" },
  { id: "scarf",      label: "🧣 Écharpe",    prompt: "wearing an elegant silk scarf" },
];

function planQualityBadge(plan?: string): { label: string; color: string } {
  if (plan?.includes("ultra")) return { label: "8K Elite ✨", color: "text-amber-400 border-amber-400/40 bg-amber-400/10" };
  if (plan?.includes("pro"))   return { label: "4K Pro ⚡",   color: "text-accent-orange border-accent-orange/40 bg-accent-orange/10" };
  return { label: "HD 1080p",                                  color: "text-white/40 border-surface-border bg-surface-hover" };
}

/* Cadenas + appel à l'action affichés par-dessus une image floutée (compte gratuit) */
function LockedOverlay({ onUnlock, compact = false }: { onUnlock: () => void; compact?: boolean }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 text-center p-3 bg-black/30">
      <div className={`rounded-2xl bg-accent-orange/20 border border-accent-orange/40 flex items-center justify-center ${compact ? "w-9 h-9" : "w-14 h-14"}`}>
        <Lock className={compact ? "w-4 h-4 text-accent-orange" : "w-7 h-7 text-accent-orange"} />
      </div>
      {!compact && (
        <>
          <p className="text-white font-bold text-sm max-w-[260px]">Aperçu flouté</p>
          <p className="text-white/70 text-xs max-w-[260px] leading-relaxed">
            Passez à une formule pour révéler votre image en haute définition.
          </p>
        </>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onUnlock(); }}
        className={`btn-primary-orange flex items-center justify-center gap-1.5 font-semibold ${compact ? "px-2.5 py-1 text-[11px]" : "px-4 py-2 text-sm mt-1"}`}
      >
        <Crown className={compact ? "w-3 h-3" : "w-4 h-4"} />
        Débloquer
      </button>
    </div>
  );
}

function userPlanTier(plan?: string): "essentiel" | "pro" | "elite" {
  if (!plan) return "essentiel";
  const p = plan.toLowerCase();
  if (p.includes("ultra") || p.includes("elite")) return "elite";
  if (p.includes("pro")) return "pro";
  return "essentiel";
}

/* ─── Qualité du rendu final selon l'abonnement ──────────────────────────
   Découverte (essentiel) → HD  •  Essentiel (pro) → 4K  •  Ultimate (elite) → Ultra */
type QualityLevel = "hd" | "4k" | "ultra";

const QUALITY_LEVELS: {
  id: QualityLevel; label: string; sub: string; minTier: "essentiel" | "pro" | "elite";
}[] = [
  { id: "hd",    label: "HD",    sub: "1080p",           minTier: "essentiel" },
  { id: "4k",    label: "4K",    sub: "Ultra net",       minTier: "pro"       },
  { id: "ultra", label: "Ultra", sub: "8K photoréaliste", minTier: "elite"    },
];

const TIER_RANK: Record<"essentiel" | "pro" | "elite", number> = { essentiel: 0, pro: 1, elite: 2 };

/** Qualité maximale débloquée par la formule de l'utilisateur. */
function maxQualityForTier(tier: "essentiel" | "pro" | "elite"): QualityLevel {
  if (tier === "elite") return "ultra";
  if (tier === "pro")   return "4k";
  return "hd";
}

/** Une qualité est-elle accessible avec la formule courante ? */
function isQualityUnlocked(q: QualityLevel, tier: "essentiel" | "pro" | "elite"): boolean {
  const level = QUALITY_LEVELS.find(l => l.id === q)!;
  return TIER_RANK[tier] >= TIER_RANK[level.minTier];
}

/* ─── Grosses spécificités débloquées par formule (affichées dans le panneau Créer)
   Chaque palier débloque des accès majeurs, bien visibles, exclusifs à la
   formule Essentiel ou à la formule Ultimate. */
const PLAN_PERKS: Record<"essentiel" | "pro" | "elite", { label: string; on: boolean }[]> = {
  essentiel: [
    { label: "Qualité HD 1080p",                          on: true  },
    { label: "1 image à la fois",                         on: true  },
    { label: "Sans filigrane",                            on: false },
    { label: "Génération vidéo IA (GTA VI)",              on: false },
    { label: "Jusqu'à 4 images d'un coup",                on: false },
    { label: "Description libre du rendu",                on: false },
    { label: "File prioritaire — rendu 2× plus rapide",   on: false },
  ],
  pro: [
    { label: "Qualité 4K ultra-nette",                    on: true  },
    { label: "Styles célébrités exclusifs",               on: true  },
    { label: "Sans filigrane",                            on: true  },
    { label: "Génération vidéo IA (GTA VI)",              on: true  },
    { label: "Jusqu'à 4 images d'un coup",                on: true  },
    { label: "Description libre du rendu",                on: false },
    { label: "File prioritaire — rendu 2× plus rapide",   on: false },
    { label: "Upscale 8K + accès anticipé aux nouveautés", on: false },
  ],
  elite: [
    { label: "Qualité Ultra 8K photoréaliste",            on: true  },
    { label: "Générations illimitées",                    on: true  },
    { label: "Description libre du rendu",                on: true  },
    { label: "Sans filigrane",                            on: true  },
    { label: "Vidéo IA + upscale 8K illimités",           on: true  },
    { label: "File prioritaire — rendu 2× plus rapide",   on: true  },
    { label: "Accès anticipé aux nouveautés (GTA VI)",    on: true  },
    { label: "Manager dédié + support VIP",               on: true  },
  ],
};

function buildEnrichedPrompt(
  style: Style | null,
  clothing: string | null,
  mood: string | null,
  bg: string | null,
  accessory: string | null,
): string {
  const parts: string[] = [];
  if (style) parts.push(style.prompt);
  const cp = CLOTHING_OPTIONS.find(o => o.id === clothing)?.prompt;
  if (cp) parts.push(cp);
  const mp = MOOD_OPTIONS.find(o => o.id === mood)?.prompt;
  if (mp) parts.push(mp);
  const bp = BACKGROUND_OPTIONS.find(o => o.id === bg)?.prompt;
  if (bp) parts.push(bp);
  const ap = ACCESSORY_OPTIONS.find(o => o.id === accessory)?.prompt;
  if (ap && accessory !== "none") parts.push(ap);
  return parts.join(", ");
}

/* ─── Types ─────────────────────────────────────────────── */
type NavView = "create" | "history" | "referral" | "subscription" | "settings";
type GenType = "create" | "video";
type ObjectOption = "addObject" | "fullGeneration" | "replaceObject";

interface Generation {
  id: string;
  output_image_url: string;
  input_image_url: string;
  style: string;
  created_at: string;
}
interface UserStats {
  credits: number;
  total_generations: number;
  image_generations: number;
  swapface_generations: number;
  video_generations: number;
  member_since: string;
  plan?: string;
  snap_rouge?: boolean;
}

interface ReferralInfo {
  code: string;
  referrals: number;
  credits_earned: number;
}

interface SubscriptionInfo {
  active: boolean;
  status?: string;
  started_at?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  billing_interval?: string | null;
}

interface AdminScript {
  enabled: boolean;
  model: string;
  master_prompt: string;
  gta5_style_boost?: string;
  negative_prompt: string;
  note?: string;
}

/* ─── Constants ─────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: "create"       as NavView, label: "Créer",        icon: Sparkles, desc: "Nouvelle génération"   },
  { id: "history"      as NavView, label: "Historique",   icon: History,  desc: "Mes images"            },
  { id: "referral"     as NavView, label: "Parrainage",   icon: Gift,     desc: "Gagne facilement"       },
  { id: "subscription" as NavView, label: "Abonnement",   icon: Crown,    desc: "Offre spéciale !"       },
  { id: "settings"     as NavView, label: "Paramètres",   icon: Settings, desc: "Mon compte"            },
];

const GEN_TABS: { id: GenType; label: string; icon: React.ElementType }[] = [
  { id: "create",   label: "Grand Theft Auto V",  icon: Sparkles },
  { id: "video",    label: "Grand Theft Auto VI", icon: Film     },
];

const PLANS_DATA = [
  {
    id: "essentiel", name: "Découverte", icon: Zap, priceMonthly: 4.90, originalPrice: "11,90", yearlyTotal: 49,
    credits: "2 500", creditsDesc: "Parfait pour explorer et tester vos idées",
    badge: null as null | "Best Value" | "Exclusif",
    tagline: "Pour essayer et s'amuser",
    features: [
      "Qualité HD 1080p",
      "1 génération à la fois",
      "Générateur photo uniquement (pas de vidéo)",
      "Léger filigrane sur les images",
      "File d'attente standard",
      "Historique limité à 20 images",
      "Support standard sous 48-72h",
    ],
  },
  {
    id: "pro", name: "Essentiel", icon: Star, priceMonthly: 9.90, originalPrice: "24,90", yearlyTotal: 99,
    credits: "10 250", creditsDesc: "Le meilleur choix pour les passionnés", bonus: "+2 500 crédits offerts",
    badge: "Best Value" as null | "Best Value" | "Exclusif",
    tagline: "Tout se débloque : vidéo, 4K, zéro filigrane",
    features: [
      "Qualité 4K ultra-nette (4× plus détaillée)",
      "Sans filigrane — images 100 % propres",
      "Génération vidéo IA débloquée (GTA VI)",
      "Jusqu'à 4 images générées d'un coup",
      "Styles célébrités exclusifs réservés aux abonnés",
      "Accès en avant-première aux nouveaux styles",
      "Historique 100 images",
      "Support prioritaire sous 24h",
    ],
  },
  {
    id: "elite", name: "Ultimate", icon: Crown, priceMonthly: 19.90, originalPrice: "49,90", yearlyTotal: 199,
    credits: "Illimités", creditsDesc: "Pour les créateurs sans limites",
    badge: "Exclusif" as null | "Best Value" | "Exclusif",
    tagline: "L'expérience VIP totale, sans aucune limite",
    features: [
      "Qualité Ultra 8K photoréaliste — le maximum",
      "Générations 100 % illimitées",
      "File prioritaire : vos rendus passent devant tout le monde",
      "Vidéo IA + upscale 8K illimités",
      "Tous les styles + exclusivités Ultimate",
      "Accès anticipé aux nouveautés (GTA VI en avant-première)",
      "Historique illimité",
      "Manager dédié + support VIP 24/7",
      "Accès API illimité",
    ],
  },
];

/* ─── Main page ──────────────────────────────────────────── */
export default function DashboardPage() {
  // useSearchParams impose une frontière Suspense au prérendu
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [navView, setNavView]   = useState<NavView>("create");
  const [genType, setGenType]   = useState<GenType>("create");
  const [planBilling, setPlanBilling] = useState<"monthly" | "yearly">("yearly");

  /* data */
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [stats,       setStats]       = useState<UserStats | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [userEmail,   setUserEmail]   = useState<string | null>(null);

  /* auth / mode aperçu */
  const [isAuthed,     setIsAuthed]     = useState<boolean | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);

  /* parrainage */
  const [referral,        setReferral]        = useState<ReferralInfo | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [copiedField,     setCopiedField]     = useState<"code" | "link" | null>(null);

  /* generation state – create (style + image fusionnés) */
  const [styleFile,     setStyleFile]     = useState<File | null>(null);
  const [stylePreview,  setStylePreview]  = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [clothing,      setClothing]      = useState<string | null>(null);
  const [mood,          setMood]          = useState<string | null>(null);
  const [styleBg,       setStyleBg]       = useState<string | null>(null);
  const [accessory,     setAccessory]     = useState<string | null>(null);
  const [details,       setDetails]       = useState(""); // description libre — Ultimate uniquement


  /* generation precision options */
  const [renderStyle,   setRenderStyle]   = useState<string | null>(null);
  const [intensity,     setIntensity]     = useState<string>("moderate");
  const [genFormat,     setGenFormat]     = useState<string>("portrait");
  const [preserveOutfit,setPreserveOutfit]= useState(false);
  const [quality,       setQuality]       = useState<QualityLevel>("hd");

  /* generation state – video */
  const [videoFile,         setVideoFile]         = useState<File | null>(null);
  const [videoPreview,      setVideoPreview]       = useState<string | null>(null);
  const [videoPrompt,       setVideoPrompt]        = useState("");
  const [videoObjectOptions,setVideoObjectOptions] = useState<Set<ObjectOption>>(new Set());

  /* common */
  const [consent,       setConsent]       = useState(false);
  const [isGenerating,  setIsGenerating]  = useState(false);
  const [genProgress,   setGenProgress]   = useState(0);
  const [error,         setError]         = useState<string | null>(null);
  const [showPaywall,   setShowPaywall]   = useState(false);
  const [resultUrl,     setResultUrl]     = useState<string | null>(null);
  const [resultStyle,   setResultStyle]   = useState<string>("");
  const [deletingId,       setDeletingId]       = useState<string | null>(null);
  const [deletingAll,      setDeletingAll]      = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [confirmCloseAccount, setConfirmCloseAccount] = useState(false);
  const [closingAccount,      setClosingAccount]      = useState(false);

  /* paramètres du compte */
  const [displayName,      setDisplayName]      = useState("");
  const [editingName,      setEditingName]      = useState(false);
  const [savingName,       setSavingName]       = useState(false);
  const [newPassword,        setNewPassword]        = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword,    setShowNewPassword]    = useState(false);
  const [savingPassword,     setSavingPassword]     = useState(false);
  const [subInfo,          setSubInfo]          = useState<SubscriptionInfo | null>(null);
  const [adminScript,      setAdminScript]      = useState<AdminScript | null>(null);
  const [togglingScript,   setTogglingScript]   = useState(false);
  const [subLoading,       setSubLoading]       = useState(false);
  const [confirmCancelSub, setConfirmCancelSub] = useState(false);
  const [cancellingSub,    setCancellingSub]    = useState(false);

  const cancelRef    = useRef(false);
  const activePredRef = useRef<{ jobId?: string; predId?: string }>({});

  useEffect(() => {
    // Vue initiale + retours de paiement via l'URL (?view=snaprouge, ?payment=snap_success)
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    if (view && NAV_ITEMS.some(n => n.id === view)) setNavView(view as NavView);
    const styleParam = params.get("style");
    if (styleParam) {
      const found = STYLES.find(s => s.id === styleParam);
      if (found) { setSelectedStyle(found); setNavView("create"); }
    }
    if (params.get("payment") === "snap_success") {
      toast.success("🔥 Paiement reçu ! Votre accès Snap Rouge s'active dans quelques secondes…", { duration: 6000 });
      setTimeout(() => fetchStats(), 4000);
    }
    // Retour d'un achat d'abonnement (Stripe redirige ici via success_url).
    // Le webhook attribue le rôle/crédits de façon asynchrone → on rafraîchit
    // les stats plusieurs fois pour afficher le nouvel accès sans refresh manuel.
    if (params.get("payment") === "success") {
      toast.success("✅ Paiement reçu ! Votre abonnement s'active dans quelques secondes…", { duration: 6000 });
      setNavView("create");
      [2000, 5000, 9000].forEach((ms) => setTimeout(() => fetchStats(), ms));
    }

    supabase.auth.getUser().then(async ({ data }) => {
      setUserEmail(data.user?.email ?? null);
      setIsAuthed(!!data.user);
      setDisplayName((data.user?.user_metadata?.display_name as string | undefined) ?? "");

      // Applique le code parrain mémorisé lors de l'inscription (?ref=CODE)
      if (data.user) {
        const refCode = localStorage.getItem("astracrea_ref");
        if (refCode) {
          localStorage.removeItem("astracrea_ref");
          try {
            const res = await fetch("/api/referral", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: refCode }),
            });
            const d = await res.json();
            if (res.ok && d.ok) {
              toast.success("🎁 Parrainage appliqué — +100 crédits bonus !", { duration: 6000 });
              fetchStats();
            }
          } catch { /* silent */ }
        }
      }
    });
    Promise.all([fetchGenerations(), fetchStats()]).finally(() => setLoading(false));
  }, []);

  /* Réagit aux changements d'URL (?view=settings depuis "Mon profil" de la
     Navbar, même quand on est déjà sur le Dashboard). */
  useEffect(() => {
    const view = searchParams.get("view");
    if (view && NAV_ITEMS.some(n => n.id === view)) setNavView(view as NavView);
  }, [searchParams]);

  /* Charge le script maître de génération (admin uniquement — l'API renvoie
     403 pour tout autre compte, rien n'est embarqué dans le bundle client). */
  useEffect(() => {
    if (navView !== "settings" || userEmail !== "gnemmialex@gmail.com" || adminScript) return;
    fetch("/api/admin/prompt")
      .then(res => res.json())
      .then(d => { if (d.master_prompt) setAdminScript(d); })
      .catch(() => { /* silent */ });
  }, [navView, userEmail, adminScript]);

  /* Charge les infos d'abonnement Stripe à l'ouverture des Paramètres */
  useEffect(() => {
    if (navView !== "settings" || !isAuthed || subInfo || subLoading) return;
    setSubLoading(true);
    fetch("/api/stripe/subscription")
      .then(res => res.json())
      .then(d => { if (!d.error) setSubInfo(d); })
      .catch(() => { /* silent */ })
      .finally(() => setSubLoading(false));
  }, [navView, isAuthed, subInfo, subLoading]);

  /* Charge les infos de parrainage à l'ouverture de l'onglet */
  useEffect(() => {
    if (navView !== "referral" || !isAuthed || referral || referralLoading) return;
    setReferralLoading(true);
    fetch("/api/referral")
      .then(res => res.json().then(d => ({ ok: res.ok, d })))
      .then(({ ok, d }) => {
        if (ok && d.code) setReferral({ code: d.code, referrals: d.referrals ?? 0, credits_earned: d.credits_earned ?? 0 });
        else if (d.error) toast.error(d.error);
      })
      .catch(() => toast.error("Impossible de charger le parrainage"))
      .finally(() => setReferralLoading(false));
  }, [navView, isAuthed, referral, referralLoading]);

  // Cale la qualité par défaut sur le maximum débloqué par la formule.
  useEffect(() => {
    setQuality(maxQualityForTier(userPlanTier(stats?.plan)));
  }, [stats?.plan]);

  const handleCopy = async (text: string, field: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(field === "code" ? "Code copié !" : "Lien copié !");
      setTimeout(() => setCopiedField(null), 2000);
    } catch { toast.error("Impossible de copier"); }
  };

  const fetchGenerations = async () => {
    try {
      const res  = await fetch("/api/generations");
      if (!res.ok) return;
      const data = await res.json();
      setGenerations(data.generations ?? []);
    } catch { /* silent */ }
  };

  const fetchStats = async () => {
    try {
      const res  = await fetch("/api/credits");
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/generations/${id}`, { method: "DELETE" });
      if (res.ok) { setGenerations(prev => prev.filter(g => g.id !== id)); toast.success("Supprimé"); }
    } finally { setDeletingId(null); }
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      const res = await fetch("/api/generations", { method: "DELETE" });
      if (res.ok) {
        setGenerations([]);
        setConfirmDeleteAll(false);
        toast.success("Historique supprimé");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setDeletingAll(false);
    }
  };

  const handleDownload = async (url: string, id: string) => {
    // Comptes gratuits : pas de téléchargement HD → renvoi vers les formules
    if (!isPaidPlan(stats?.plan)) { goToSubscription(); return; }
    try {
      const blob      = await (await fetch(url)).blob();
      const objectUrl = URL.createObjectURL(blob);
      const a         = document.createElement("a");
      a.href = objectUrl; a.download = `astracrea-${id}.png`; a.click();
      URL.revokeObjectURL(objectUrl);
    } catch { toast.error("Erreur de téléchargement"); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  /* Change le mot de passe du compte — la session active suffit : ni ancien
     mot de passe ni e-mail demandés, juste une double saisie identique. */
  const handleChangePassword = async () => {
    if (newPassword.length < 8) { toast.error("8 caractères minimum"); return; }
    if (newPassword !== confirmNewPassword) { toast.error("Les mots de passe ne correspondent pas"); return; }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(
          error.message.toLowerCase().includes("different")
            ? "Le nouveau mot de passe doit être différent de l'ancien"
            : "Impossible de modifier le mot de passe"
        );
      } else {
        toast.success("Mot de passe modifié !");
        setNewPassword("");
        setConfirmNewPassword("");
        setShowNewPassword(false);
      }
    } finally {
      setSavingPassword(false);
    }
  };

  /* Enregistre le nom d'affichage dans les métadonnées du compte */
  const handleSaveName = async () => {
    setSavingName(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { display_name: displayName.trim() } });
      if (error) toast.error("Impossible d'enregistrer le nom");
      else { toast.success("Nom enregistré"); setEditingName(false); }
    } finally {
      setSavingName(false);
    }
  };

  /* Active/désactive le script maître de génération (admin — test avec/sans) */
  const toggleMasterScript = async () => {
    if (!adminScript || togglingScript) return;
    const next = !adminScript.enabled;
    setTogglingScript(true);
    try {
      const res = await fetch("/api/admin/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) {
        setAdminScript({ ...adminScript, enabled: next });
        toast.success(next
          ? "Script de génération ACTIVÉ — les prochaines générations l'utilisent"
          : "Script de génération DÉSACTIVÉ — générations en mode brut pour comparer");
      } else {
        toast.error(d.error ?? "Impossible de changer le réglage");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setTogglingScript(false);
    }
  };

  /* Annule l'abonnement à la fin de la période payée (jamais immédiatement) */
  const handleCancelSubscription = async () => {
    setCancellingSub(true);
    try {
      const res = await fetch("/api/stripe/subscription", { method: "DELETE" });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) {
        const end = d.current_period_end
          ? new Date(d.current_period_end).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
          : "la fin de la période en cours";
        toast.success(`Abonnement annulé — il reste actif jusqu'au ${end}`, { duration: 7000 });
        setSubInfo(prev => prev ? { ...prev, cancel_at_period_end: true, current_period_end: d.current_period_end ?? prev.current_period_end } : prev);
        setConfirmCancelSub(false);
      } else {
        toast.error(d.error ?? "Erreur lors de l'annulation");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setCancellingSub(false);
    }
  };

  const handleCloseAccount = async () => {
    setClosingAccount(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (res.ok) {
        toast.success("Compte fermé");
        await supabase.auth.signOut();
        router.push("/");
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error ?? "Erreur lors de la fermeture du compte");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setClosingAccount(false);
    }
  };

  const toggleObjectOption = (
    options: Set<ObjectOption>,
    setOptions: (s: Set<ObjectOption>) => void,
    opt: ObjectOption,
  ) => {
    const next = new Set(options);
    if (next.has(opt)) { next.delete(opt); }
    else { if (opt === "fullGeneration") next.clear(); else next.delete("fullGeneration"); next.add(opt); }
    setOptions(next);
  };

  const simulateProgress = () => {
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 12 + 4;
      if (p >= 95) { clearInterval(iv); p = 95; }
      setGenProgress(Math.min(p, 95));
    }, 500);
    return iv;
  };

  const handleCancel = async () => {
    cancelRef.current = true;
    const { jobId, predId } = activePredRef.current;
    try {
      await fetch("/api/generate/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, prediction_id: predId }),
      });
    } catch { /* silent */ }
  };

  const handleGenerate = async () => {
    if (isAuthed === false) { setShowAuthGate(true); return; }
    setError(null);
    if (!consent) { setError("Veuillez accepter les conditions."); return; }

    const formData = new FormData();

    if (genType === "create") {
      if (!styleFile) { setError("Veuillez uploader une photo."); return; }
      // Toutes les générations partent en mode personnage GTA 5 : c'est ce qui
      // active le contexte de stylisation forte + le boost GTA 5 côté serveur
      // (l'ancienne description libre partait en simple retouche trop timide).
      const effStyle = selectedStyle ?? STYLES.find(s => s.id === "gta5") ?? null;
      // Description libre : réservée à la formule Ultimate (double garde côté envoi).
      const extraDetails = userPlanTier(stats?.plan) === "elite" ? details.trim() : "";
      // Le gel du fond est TOUJOURS appliqué (mode "Ne pas changer" par défaut).
      const customPrompt = [KEEP_BACKGROUND_PROMPT, extraDetails].filter(Boolean).join(", ");
      const enriched = buildEnrichedPrompt(effStyle, clothing, mood, styleBg, accessory);
      formData.append("image", await resizeImageFile(styleFile));
      if (effStyle) {
        formData.append("style_id",    effStyle.id);
        formData.append("style_label", effStyle.label);
      }
      if (enriched)             formData.append("style_prompt",    enriched);
      if (customPrompt)         formData.append("custom_prompt",   customPrompt);
      if (renderStyle)          formData.append("render_style",    renderStyle);
      formData.append("intensity",       intensity);
      formData.append("output_format",   genFormat);
      formData.append("preserve_outfit", preserveOutfit ? "1" : "0");
      formData.append("quality",         quality);
      formData.append("mode", "style");
    } else if (genType === "video") {
      if (!videoFile)   { setError("Veuillez uploader une vidéo."); return; }
      if (!videoPrompt) { setError("Veuillez entrer un prompt."); return; }
      formData.append("video",          videoFile);
      formData.append("prompt",         videoPrompt);
      formData.append("object_options", JSON.stringify([...videoObjectOptions]));
      formData.append("mode",           "video");
    }

    setIsGenerating(true);
    setGenProgress(0);
    cancelRef.current = false;
    activePredRef.current = {};
    const iv = simulateProgress();

    try {
      // ── POST: start job (returns immediately) ──────────────────────────────
      const res = await fetch("/api/generate", { method: "POST", body: formData });
      clearInterval(iv);

      if (res.status === 402) { setIsGenerating(false); setShowPaywall(true); return; }

      const rawText = await res.text();
      let startData: Record<string, unknown>;
      try { startData = JSON.parse(rawText); }
      catch { throw new Error(rawText || `Erreur serveur (${res.status})`); }
      if (!res.ok) throw new Error((startData.error as string) || `Erreur serveur (${res.status})`);

      const jobId        = startData.job_id        as string | undefined;
      const predictionId = startData.prediction_id as string | undefined;
      activePredRef.current = { jobId, predId: predictionId };

      // ── POLL until done ────────────────────────────────────────────────────
      const STEP_LABELS: Record<number, string> = {
        1: "Génération IA en cours…",
        2: "Finalisation Ultra 4K…",
      };

      let outputUrl: string | null = null;
      for (let attempt = 0; attempt < 180; attempt++) {
        await new Promise((r) => setTimeout(r, 3000));

        if (cancelRef.current) throw new Error("__CANCELED__");

        const pollUrl = jobId
          ? `/api/generate/poll?job_id=${jobId}`
          : `/api/generate/poll?prediction_id=${predictionId}`;

        const pollRes  = await fetch(pollUrl);
        const pollText = await pollRes.text();
        let poll: Record<string, unknown> = {};
        try { poll = JSON.parse(pollText); }
        catch { throw new Error(pollText || `Erreur serveur poll (${pollRes.status})`); }

        if (!pollRes.ok || poll.status === "error") {
          throw new Error((poll.error as string) || `Erreur serveur (${pollRes.status})`);
        }
        if (poll.status === "done" && poll.output_image_url) {
          outputUrl = poll.output_image_url as string;
          break;
        }

        // Update progress label based on current step
        const step = (poll.step as number) ?? 1;
        const label = STEP_LABELS[step] ?? "Génération en cours…";
        setGenProgress(Math.min(92, 15 + step * 26));
        if (attempt === 0) toast.loading(label, { id: "gen-progress" });
        else toast.loading(label, { id: "gen-progress" });
      }

      toast.dismiss("gen-progress");

      if (!outputUrl) throw new Error("Délai dépassé — réessayez");

      setGenProgress(100);
      setResultUrl(outputUrl);
      setResultStyle("");
      toast.success("Génération terminée !");
      await fetchGenerations();
      await fetchStats();

    } catch (err: unknown) {
      clearInterval(iv);
      toast.dismiss("gen-progress");
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      if (msg === "__CANCELED__") {
        toast("Génération annulée", { icon: "🛑" });
      } else {
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setIsGenerating(false);
      activePredRef.current = {};
    }
  };

  /* Compte payant ? Sinon les résultats sont floutés (aperçu). */
  const isPaid = isPaidPlan(stats?.plan);

  /* Renvoie l'utilisateur vers les formules pour débloquer la HD */
  const goToSubscription = () => {
    setResultUrl(null);
    setResultStyle("");
    setNavView("subscription");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const userInitial = userEmail?.[0]?.toUpperCase() ?? "?";

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Barre identique à la page d'accueil — le bouton final devient
          "Abonnements", et les onglets GTA VI/V du milieu deviennent des
          raccourcis internes au Dashboard (Générations / Historique /
          Parrainage), sans jamais quitter la page. */}
      <Navbar
        wide
        ctaLabel="Abonnement"
        ctaHref="/dashboard?view=subscription"
        onCtaClick={(e) => { e.preventDefault(); setNavView("subscription"); }}
        middleContent={
          <>
            <button
              onClick={() => setNavView("create")}
              className="text-[12px] font-medium tracking-wide gradient-text-orange-subtle hover:opacity-80 hover:scale-110 transition-all duration-300 whitespace-nowrap shrink-0 inline-block"
            >
              Générer
            </button>
            <button
              onClick={() => setNavView("history")}
              className="text-[13px] font-light tracking-wide text-white/75 hover:text-white hover:scale-110 transition-all duration-300 whitespace-nowrap shrink-0 inline-block"
            >
              Historique
            </button>
            <button
              onClick={() => setNavView("referral")}
              className="text-[13px] font-light tracking-wide text-white/75 hover:text-white hover:scale-110 transition-all duration-300 whitespace-nowrap shrink-0 inline-block"
            >
              Parrainage
            </button>
          </>
        }
      />

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <main className="min-h-screen flex flex-col relative">
        {/* Fond du Dashboard : identique à la page d'accueil (SiteBackground
            global) avec un léger film + flou, sauf pour Abonnement /
            Parrainage / Historique qui restent en noir uni, sans le fond qui
            défile ni le flou. */}
        {["subscription", "referral", "history"].includes(navView) ? (
          <div className="absolute inset-0 bg-black pointer-events-none z-0" />
        ) : (
          <div className="absolute inset-0 backdrop-blur-[3px] bg-background/25 pointer-events-none z-0" />
        )}

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto relative z-10 pt-24">
          <div className="px-6 lg:px-8">

            {/* ── Bannière mode aperçu (non connecté) — masquée sur l'onglet Abonnement ── */}
            {isAuthed === false && navView !== "subscription" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-accent-orange/10 border border-accent-orange/30 rounded-2xl px-5 py-4 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <Lock className="w-5 h-5 text-accent-orange flex-shrink-0 hidden sm:block" />
                  <div>
                    <p className="font-bold text-sm text-white">Vous explorez le Dashboard en mode aperçu</p>
                    <p className="text-white/50 text-xs mt-0.5">Connectez-vous ou créez un compte pour générer vos images — 100 crédits offerts à l&apos;inscription</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-accent-orange/40 text-accent-orange hover:bg-accent-orange/10 text-sm font-bold transition-all whitespace-nowrap">
                    <LogIn className="w-4 h-4" />
                    Connexion
                  </Link>
                  <Link href="/register" className="btn-primary-orange flex items-center gap-1.5 px-4 py-2 text-sm whitespace-nowrap">
                    <UserPlus className="w-4 h-4" />
                    Créer un compte
                  </Link>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">

              {/* ══ CREATE VIEW ══ */}
              {navView === "create" && (
                <motion.div key={`create-${genType}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>

                  {/* ── Gen type tabs — centred, avec espace au-dessus ── */}
                  <div className="pt-10 pb-6 flex justify-center">
                    <div className="flex gap-1.5 p-0.5 bg-surface/60 backdrop-blur-xl border border-surface-border rounded-xl">
                      {GEN_TABS.map(tab => {
                        const Icon    = tab.icon;
                        const active  = genType === tab.id;
                        const isVideoLocked = tab.id === "video" && userPlanTier(stats?.plan) === "essentiel";
                        return (
                          <motion.button
                            key={tab.id}
                            onClick={() => {
                              if (isVideoLocked) {
                                toast("La vidéo est disponible à partir du plan Pro ⚡", { icon: "🔒" });
                                return;
                              }
                              setGenType(tab.id); setError(null);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all overflow-hidden ${
                              isVideoLocked
                                ? "text-white/25 cursor-not-allowed"
                                : active
                                ? "bg-accent-orange text-white shadow-orange"
                                : "text-white/45 hover:text-white"
                            }`}
                          >
                            {active && !isVideoLocked && (
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                animate={{ x: ["-120%", "220%"] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
                              />
                            )}
                            {isVideoLocked ? (
                              <Lock className="w-3 h-3 relative z-10 flex-shrink-0" />
                            ) : (
                              <Icon className="w-3 h-3 relative z-10 flex-shrink-0" />
                            )}
                            <span className="relative z-10 hidden sm:inline whitespace-nowrap">{tab.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Forms — compacts, centrés, glass ── */}
                  <div className="max-w-4xl mx-auto pb-10 px-2">
                  <div className="grid grid-cols-1 gap-6">
                  {/* ── LEFT: forms — full width on desktop ── */}
                  <div className="space-y-4">

                  {/* ── CRÉER (Style IA + Image IA fusionnés) ── */}
                  {genType === "create" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Col gauche — upload */}
                      <div className="lg:col-span-1">
                        <AnimatedCard delay={0} className="bg-surface/70 backdrop-blur-xl border border-surface-border rounded-2xl p-4">
                          <h2 className="font-semibold text-sm mb-3 flex items-center justify-between">
                            <span>Votre photo</span>
                            <StepBadge n={1} />
                          </h2>
                          <UploadBox
                            onFileSelected={(f,p)=>{setStyleFile(f);setStylePreview(p);setError(null);}}
                            onClear={()=>{setStyleFile(null);setStylePreview(null);}}
                            preview={stylePreview}
                            label="Votre photo (visage bien visible)"
                          />
                        </AnimatedCard>
                      </div>

                      {/* Col droite — style + options + prompt + generate */}
                      <div className="lg:col-span-2 space-y-4">


                        {/* Description libre — exclusivité Ultimate.
                            (Le fond de la photo est toujours conservé tel quel :
                            consigne "Ne pas changer" appliquée d'office.) */}
                        <AnimatedCard delay={0.08} className="bg-surface/70 backdrop-blur-xl border border-surface-border rounded-2xl p-3">
                          <h2 className="font-semibold text-sm mb-1.5 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              Description
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                userPlanTier(stats?.plan) === "elite"
                                  ? "text-amber-400 border-amber-400/40 bg-amber-400/10"
                                  : "text-white/40 border-surface-border bg-surface-hover"
                              }`}>
                                {userPlanTier(stats?.plan) === "elite" ? "Ultimate ✨" : "Réservé Ultimate 🔒"}
                              </span>
                            </span>
                            <span className="text-white/30 text-[10px] font-normal">optionnel</span>
                          </h2>
                          {userPlanTier(stats?.plan) === "elite" ? (
                            <textarea
                              value={details}
                              onChange={e => setDetails(e.target.value)}
                              placeholder="Précisez des détails en plus de la scène : tenue, ambiance, objets, attitude…"
                              rows={2}
                              maxLength={300}
                              className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-400/60 resize-none"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                toast("La description personnalisée est réservée à la formule Ultimate 🔒", { icon: "👑" });
                                goToSubscription();
                              }}
                              className="w-full flex items-center gap-2 bg-surface/50 border border-dashed border-surface-border rounded-xl px-3 py-3 text-left hover:border-amber-400/40 transition-all"
                            >
                              <Lock className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                              <span className="text-white/30 text-xs">
                                Décrivez librement votre rendu (tenue, ambiance, objets…) — passez à Ultimate pour débloquer.
                              </span>
                            </button>
                          )}
                        </AnimatedCard>

                        <QualitySelector
                          value={quality}
                          onChange={setQuality}
                          tier={userPlanTier(stats?.plan)}
                          step={2}
                          onLockedClick={(q) => {
                            const name = q === "ultra" ? "Ultimate" : "Essentiel";
                            toast(`Qualité ${q.toUpperCase()} réservée à la formule ${name} 🔒`, { icon: "👑" });
                            goToSubscription();
                          }}
                        />

                        <GenerateCard
                          consent={consent}
                          setConsent={setConsent}
                          error={error}
                          onGenerate={handleGenerate}
                          onCancel={handleCancel}
                          isGenerating={isGenerating}
                          canGenerate={!!(styleFile && consent)}
                          credits={100}
                          step={3}
                          plan={stats?.plan}
                        />

                        <PlanPerksCard tier={userPlanTier(stats?.plan)} onUpgrade={goToSubscription} />

                      </div>
                    </div>
                  )}

                  {/* ── VIDEO IA ── */}
                  {genType === "video" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2 space-y-4">
                        <AnimatedCard delay={0} className="bg-surface/70 backdrop-blur-xl border border-surface-border rounded-2xl p-4">
                          <h2 className="font-semibold text-sm mb-3 flex items-center justify-between"><span>Votre vidéo</span><StepBadge n={1} /></h2>
                          <VideoUploadBox onFileSelected={(f,p)=>{setVideoFile(f);setVideoPreview(p);}} onClear={()=>{setVideoFile(null);setVideoPreview(null);}} preview={videoPreview} label="Vidéo à transformer" />
                        </AnimatedCard>
                        <AnimatedCard delay={0.08} className="bg-surface/70 backdrop-blur-xl border border-surface-border rounded-2xl p-4">
                          <h2 className="font-semibold text-sm mb-3 flex items-center justify-between"><span>Prompt</span><StepBadge n={2} /></h2>
                          <textarea value={videoPrompt} onChange={e=>setVideoPrompt(e.target.value)}
                            placeholder="Décrivez la transformation souhaitée…" rows={3}
                            className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent-orange/60 resize-none" />
                        </AnimatedCard>
                        <AnimatedCard delay={0.16} className="bg-surface/70 backdrop-blur-xl border border-surface-border rounded-2xl p-4">
                          <h2 className="font-semibold text-sm mb-3 flex items-center justify-between"><span className="flex items-center gap-2">Modifier un objet <span className="text-white/30 text-xs font-normal">(optionnel)</span></span><StepBadge n={3} /></h2>
                          <div className="space-y-2">
                            {([
                              {id:"addObject" as ObjectOption, icon:PlusCircle, label:"Ajouter un objet", desc:"Insère dans la vidéo"},
                              {id:"replaceObject" as ObjectOption, icon:Replace, label:"Remplacer un objet", desc:"Frame par frame"},
                            ]).map(({id,icon:Icon,label,desc})=>{
                              const checked = videoObjectOptions.has(id);
                              return (
                                <button key={id} onClick={()=>toggleObjectOption(videoObjectOptions,setVideoObjectOptions,id)}
                                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${checked?"bg-accent-orange/15 border-accent-orange":"border-surface-border hover:border-accent-orange/40 hover:bg-surface-hover"}`}>
                                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${checked?"bg-accent-orange border-accent-orange":"border-surface-border"}`}>
                                    {checked&&<span className="text-white text-[10px]">✓</span>}
                                  </div>
                                  <Icon className={`w-4 h-4 flex-shrink-0 ${checked?"text-accent-orange":"text-white/40"}`} />
                                  <div>
                                    <p className={`text-xs font-semibold ${checked?"text-white":"text-white/70"}`}>{label}</p>
                                    <p className="text-white/35 text-xs">{desc}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </AnimatedCard>
                      </div>
                      <div className="lg:col-span-1">
                        <GenerateCard consent={consent} setConsent={setConsent} error={error} onGenerate={handleGenerate} onCancel={handleCancel} isGenerating={isGenerating} canGenerate={!!(videoFile && videoPrompt && consent)} credits={150} step={4} />
                      </div>
                    </div>
                  )}

                  </div>{/* end forms col */}

                  {/* ── RIGHT: result panel — visible sur mobile/tablette, remplacé par overlay sur desktop ── */}
                  <div className="xl:hidden">
                    <div className="sticky top-6 max-h-[calc(100vh-3.5rem)] overflow-y-auto rounded-2xl">
                      <div className="bg-surface/70 backdrop-blur-xl border border-surface-border rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
                          <h3 className="font-semibold text-sm">Résultat</h3>
                          {resultUrl && (
                            <button
                              onClick={() => { setResultUrl(null); setResultStyle(""); }}
                              className="text-xs text-white/40 hover:text-white transition-colors"
                            >
                              Effacer
                            </button>
                          )}
                        </div>
                        {resultUrl ? (
                          <div>
                            <div className="relative aspect-square bg-surface-hover overflow-hidden">
                              <Image src={resultUrl} alt={resultStyle} fill className={`object-contain ${isPaid ? "" : "blur-2xl scale-110"}`} />
                              {!isPaid && <LockedOverlay onUnlock={goToSubscription} />}
                            </div>
                            <div className="p-4 space-y-3">
                              <p className="text-white/50 text-xs text-center">{resultStyle}</p>
                              {isPaid ? (
                                <button
                                  onClick={() => handleDownload(resultUrl, Date.now().toString())}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/80 text-white text-sm font-semibold transition-all"
                                >
                                  <Download className="w-4 h-4" />
                                  Télécharger
                                </button>
                              ) : (
                                <button
                                  onClick={goToSubscription}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/80 text-white text-sm font-semibold transition-all"
                                >
                                  <Crown className="w-4 h-4" />
                                  Débloquer en HD
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-square flex flex-col items-center justify-center gap-3 text-center p-6">
                            {isGenerating ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                  className="w-12 h-12 rounded-full border-2 border-accent-orange/30 border-t-accent-orange"
                                />
                                <p className="text-white/50 text-sm font-medium">Génération en cours…</p>
                                <div className="w-full h-1.5 bg-surface-hover rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full gradient-bg-orange-animated rounded-full"
                                    animate={{ width: `${genProgress}%` }}
                                    transition={{ ease: "easeOut", duration: 0.4 }}
                                  />
                                </div>
                                <p className="text-accent-orange text-xs font-bold">{Math.round(genProgress)}%</p>
                                <motion.button
                                  onClick={handleCancel}
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                  className="mt-1 flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-all"
                                >
                                  <StopCircle className="w-3.5 h-3.5" />
                                  Arrêter
                                </motion.button>
                              </>
                            ) : (
                              <>
                                <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center">
                                  <Sparkles className="w-7 h-7 text-white/20" />
                                </div>
                                <p className="text-white/40 text-sm">Votre résultat apparaîtra ici</p>
                                <p className="text-white/20 text-xs">Remplissez le formulaire et appuyez sur Générer</p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  </div>{/* end grid */}
                  </div>{/* end max-w-7xl */}

                  {/* ── Overlay desktop (xl+) : affiché pendant la génération OU quand résultat prêt ── */}
                  <AnimatePresence>
                    {(isGenerating || resultUrl) && (
                      <motion.div
                        key="desktop-result-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="hidden xl:flex fixed inset-0 z-[200] items-center justify-center p-10"
                      >
                        {/* Backdrop — clic ferme si résultat affiché */}
                        <div
                          className="absolute inset-0 bg-black/82 backdrop-blur-sm"
                          onClick={resultUrl && !isGenerating ? () => { setResultUrl(null); setResultStyle(""); } : undefined}
                        />

                        {/* Carte résultat */}
                        <motion.div
                          initial={{ scale: 0.9, y: 28 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.9, y: 28 }}
                          transition={{ type: "spring", stiffness: 280, damping: 26 }}
                          className="relative z-10 w-full max-w-2xl bg-surface border border-surface-border rounded-3xl overflow-hidden shadow-2xl"
                        >
                          {/* Header */}
                          <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
                            <h3 className="font-bold text-xl">
                              {isGenerating ? "Génération en cours…" : "Résultat"}
                            </h3>
                            {resultUrl && !isGenerating && (
                              <button
                                onClick={() => { setResultUrl(null); setResultStyle(""); }}
                                className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-white/40 hover:text-white transition-colors"
                              >✕</button>
                            )}
                          </div>

                          {/* Corps — résultat */}
                          {resultUrl && !isGenerating ? (
                            <div>
                              <div className="relative bg-surface-hover overflow-hidden" style={{ height: "60vh" }}>
                                <Image src={resultUrl} alt={resultStyle || "Résultat"} fill className={`object-contain ${isPaid ? "" : "blur-2xl scale-110"}`} />
                                {!isPaid && <LockedOverlay onUnlock={goToSubscription} />}
                              </div>
                              <div className="p-6 flex items-center gap-4">
                                <p className="text-white/50 text-sm flex-1 truncate">
                                  {isPaid ? resultStyle : "Aperçu flouté — débloquez la HD avec une formule"}
                                </p>
                                {isPaid ? (
                                  <button
                                    onClick={() => handleDownload(resultUrl, Date.now().toString())}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/80 text-white font-semibold transition-all text-sm whitespace-nowrap"
                                  >
                                    <Download className="w-4 h-4" />Télécharger
                                  </button>
                                ) : (
                                  <button
                                    onClick={goToSubscription}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/80 text-white font-semibold transition-all text-sm whitespace-nowrap"
                                  >
                                    <Crown className="w-4 h-4" />Débloquer en HD
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Corps — chargement */
                            <div className="flex flex-col items-center justify-center gap-6 py-16 px-8">
                              <div className="relative w-24 h-24">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                  className="absolute inset-0 rounded-full border-4 border-accent-orange/20 border-t-accent-orange"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Sparkles className="w-8 h-8 text-accent-orange/60" />
                                </div>
                              </div>
                              <div className="text-center space-y-1.5">
                                <p className="text-white/85 text-2xl font-black">Génération IA</p>
                                <p className="text-white/40 text-sm">Votre image est en cours de création…</p>
                              </div>
                              <div className="w-80 space-y-2">
                                <div className="h-2.5 bg-surface-hover rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full gradient-bg-orange-animated rounded-full"
                                    animate={{ width: `${genProgress}%` }}
                                    transition={{ ease: "easeOut", duration: 0.4 }}
                                  />
                                </div>
                                <p className="text-center text-accent-orange font-bold text-xl">{Math.round(genProgress)}%</p>
                              </div>
                              <motion.button
                                onClick={handleCancel}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 font-semibold transition-all"
                              >
                                <StopCircle className="w-4 h-4" />
                                Arrêter la génération
                              </motion.button>
                            </div>
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ══ HISTORY VIEW ══ */}
              {navView === "history" && (
                <motion.div key="history" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                  <div className="mb-7 pt-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-black mb-1">Historique</h1>
                        <p className="text-white/40">{generations.length} création{generations.length!==1?"s":""}</p>
                      </div>
                      {generations.length > 0 && !confirmDeleteAll && (
                        <button
                          onClick={() => setConfirmDeleteAll(true)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 border border-red-500 text-red-400 hover:bg-red-500/30 hover:text-white text-xs font-semibold transition-all mt-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Tout supprimer
                        </button>
                      )}
                      {confirmDeleteAll && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                          <p className="text-red-400 text-xs font-medium">Supprimer les {generations.length} images ?</p>
                          <button
                            onClick={handleDeleteAll}
                            disabled={deletingAll}
                            className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all disabled:opacity-50"
                          >
                            {deletingAll ? "…" : "Confirmer"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteAll(false)}
                            className="px-2.5 py-1 rounded-lg border border-surface-border text-white/50 hover:text-white text-xs transition-all"
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>
                    {userPlanTier(stats?.plan) === "essentiel" && (
                      <div className="mt-3 flex items-center gap-3 bg-accent-orange/8 border border-accent-orange/20 rounded-xl px-4 py-2.5">
                        <Lock className="w-3.5 h-3.5 text-accent-orange flex-shrink-0" />
                        <p className="text-white/50 text-xs">
                          Plan Essentiel — historique limité à <strong className="text-white/70">20 images</strong>.{" "}
                          <Link href="/pricing" className="text-accent-orange hover:underline">Passez à Pro</Link> pour 100 images ou à Elite pour l&apos;historique illimité.
                        </p>
                      </div>
                    )}
                    {userPlanTier(stats?.plan) === "pro" && (
                      <div className="mt-3 flex items-center gap-3 bg-accent-orange/8 border border-accent-orange/20 rounded-xl px-4 py-2.5">
                        <Sparkles className="w-3.5 h-3.5 text-accent-orange flex-shrink-0" />
                        <p className="text-white/50 text-xs">
                          Plan Pro — historique jusqu&apos;à <strong className="text-white/70">100 images</strong>.{" "}
                          <Link href="/pricing" className="text-accent-orange hover:underline">Passez à Elite</Link> pour un historique illimité.
                        </p>
                      </div>
                    )}
                  </div>
                  {generations.length === 0 ? (
                    <div className="text-center py-24 card">
                      <Sparkles className="w-10 h-10 text-white/20 mx-auto mb-4" />
                      <p className="text-white/50 font-semibold mb-2">Aucune création</p>
                      <p className="text-white/30 text-sm mb-5">Lance ta première génération</p>
                      <button onClick={()=>setNavView("create")} className="btn-primary-orange inline-flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />Créer maintenant
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {generations.map((gen,i)=>(
                        <motion.div key={gen.id}
                          initial={{ opacity: 0, scale: 0.88, y: 16 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          whileHover={{ scale: 1.045 }}
                          className="group relative rounded-xl overflow-hidden border border-surface-border hover:border-accent-orange/40 transition-all cursor-default">
                          <div className="aspect-square relative overflow-hidden">
                            <Image src={gen.output_image_url} alt={gen.style} fill className={`object-cover ${isPaid ? "" : "blur-xl scale-110"}`} />
                            {!isPaid && <LockedOverlay onUnlock={goToSubscription} compact />}
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 gap-2 z-30">
                            {isPaid && (
                              <Link href={`/result?id=${gen.id}`} className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/20">
                                <Sparkles className="w-3.5 h-3.5" />
                              </Link>
                            )}
                            <button onClick={()=>handleDownload(gen.output_image_url,gen.id)} className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/20">
                              {isPaid ? <Download className="w-3.5 h-3.5" /> : <Crown className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={()=>handleDelete(gen.id)} disabled={deletingId===gen.id} className="w-8 h-8 bg-red-500/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-red-500 hover:bg-red-500 transition-colors disabled:opacity-50">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                            <p className="text-white text-xs font-medium truncate">{gen.style}</p>
                            <p className="text-white/50 text-xs">{new Date(gen.created_at).toLocaleDateString("fr-FR")}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ══ REFERRAL VIEW ══ */}
              {navView === "referral" && (
                <motion.div key="referral" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                  <div className="mb-7 pt-8">
                    <h1 className="text-3xl font-black mb-1 flex items-center gap-3">
                      <Gift className="w-7 h-7 text-accent-orange" />
                      Parrainage
                    </h1>
                    <p className="text-white/40">Invitez vos amis et gagnez des crédits gratuits</p>
                  </div>

                  <div className="max-w-3xl space-y-5">

                    {/* Comment ça marche */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <AnimatedCard delay={0} className="card border-accent-orange/25 bg-accent-orange/5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-accent-orange/15 flex items-center justify-center text-accent-orange">
                            <Users className="w-5 h-5" />
                          </div>
                          <p className="text-2xl font-black text-accent-orange">+200</p>
                        </div>
                        <p className="font-bold text-white text-sm mb-1">crédits pour vous</p>
                        <p className="text-white/45 text-xs leading-relaxed">À chaque ami qui s&apos;inscrit avec votre lien de parrainage</p>
                      </AnimatedCard>
                      <AnimatedCard delay={0.08} className="card border-green-500/25 bg-green-500/5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center text-green-400">
                            <Gift className="w-5 h-5" />
                          </div>
                          <p className="text-2xl font-black text-green-400">+100</p>
                        </div>
                        <p className="font-bold text-white text-sm mb-1">crédits pour votre ami</p>
                        <p className="text-white/45 text-xs leading-relaxed">En plus des 100 crédits de bienvenue, soit 200 crédits au total</p>
                      </AnimatedCard>
                    </div>

                    {isAuthed === false ? (
                      /* Invité — incite à se connecter */
                      <div className="card text-center py-12">
                        <Lock className="w-10 h-10 text-white/20 mx-auto mb-4" />
                        <p className="font-bold text-white mb-2">Connectez-vous pour obtenir votre code parrain</p>
                        <p className="text-white/40 text-sm mb-6">Chaque compte dispose d&apos;un code personnalisé unique à partager</p>
                        <div className="flex items-center justify-center gap-3">
                          <Link href="/login" className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-accent-orange/40 text-accent-orange hover:bg-accent-orange/10 text-sm font-bold transition-all">
                            <LogIn className="w-4 h-4" />Se connecter
                          </Link>
                          <Link href="/register" className="btn-primary-orange flex items-center gap-1.5 px-5 py-2.5 text-sm">
                            <UserPlus className="w-4 h-4" />Créer un compte
                          </Link>
                        </div>
                      </div>
                    ) : referralLoading || !referral ? (
                      <div className="card flex items-center justify-center py-16">
                        <Loader2 className="w-7 h-7 text-accent-orange animate-spin" />
                      </div>
                    ) : (
                      <>
                        {/* Code + lien */}
                        <AnimatedCard className="card space-y-4">
                          <h2 className="font-bold flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent-orange" />
                            Votre code personnalisé
                          </h2>

                          {/* Code */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-surface-hover border border-accent-orange/30 rounded-xl px-4 py-3 font-mono font-black text-xl tracking-[0.25em] text-accent-orange text-center select-all">
                              {referral.code}
                            </div>
                            <button
                              onClick={() => handleCopy(referral.code, "code")}
                              className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-surface-border text-white/60 hover:text-white hover:border-accent-orange/40 text-sm font-semibold transition-all flex-shrink-0"
                            >
                              {copiedField === "code" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                              {copiedField === "code" ? "Copié" : "Copier"}
                            </button>
                          </div>

                          {/* Lien de partage */}
                          <div>
                            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Votre lien de parrainage</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-surface-hover border border-surface-border rounded-xl px-4 py-3 text-white/70 text-sm truncate select-all">
                                {`${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${referral.code}`}
                              </div>
                              <button
                                onClick={() => handleCopy(`${window.location.origin}/register?ref=${referral.code}`, "link")}
                                className="btn-primary-orange flex items-center gap-1.5 px-4 py-3 text-sm flex-shrink-0"
                              >
                                {copiedField === "link" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copiedField === "link" ? "Copié !" : "Copier le lien"}
                              </button>
                            </div>
                            <p className="text-white/30 text-xs mt-2">
                              💡 Partagez ce lien : dès qu&apos;un ami crée son compte avec, vous recevez automatiquement vos 200 crédits.
                            </p>
                          </div>
                        </AnimatedCard>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <AnimatedCard delay={0.08} className="card text-center">
                            <p className="text-3xl font-black gradient-text">{referral.referrals}</p>
                            <p className="text-white/40 text-sm mt-1">Filleul{referral.referrals !== 1 ? "s" : ""} inscrit{referral.referrals !== 1 ? "s" : ""}</p>
                          </AnimatedCard>
                          <AnimatedCard delay={0.16} className="card text-center">
                            <p className="text-3xl font-black text-green-400">+{referral.credits_earned}</p>
                            <p className="text-white/40 text-sm mt-1">Crédits gagnés</p>
                          </AnimatedCard>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}


              {/* ══ SUBSCRIPTION VIEW ══ */}
              {navView === "subscription" && (
                <motion.div key="subscription" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                  <div className="mb-7 pt-8 flex flex-col items-center text-center gap-4">
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-black mb-1 uppercase text-white">Choisissez vos avantages</h1>
                      <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mt-2">
                        Abonnement résiliable à tout moment dans les paramètres
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 mt-2">
                        <ShieldCheck className="w-3 h-3" />SATISFAIT OU REMBOURSÉ IMMÉDIATEMENT
                      </span>
                    </div>
                    {/* Toggle Mensuel / Annuel */}
                    <div className="inline-flex items-center gap-0.5 bg-surface-hover border border-surface-border rounded-lg p-0.5">
                      <button
                        onClick={() => setPlanBilling("monthly")}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${
                          planBilling === "monthly" ? "bg-accent-orange text-white" : "text-white/50 hover:text-white"
                        }`}
                      >
                        Mensuel
                      </button>
                      <button
                        onClick={() => setPlanBilling("yearly")}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${
                          planBilling === "yearly" ? "bg-accent-orange text-white" : "text-white/50 hover:text-white"
                        }`}
                      >
                        Annuel
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6 items-start max-w-3xl mx-auto">
                    {PLANS_DATA.map((plan,i)=>{
                      const isCurrent  = userPlanTier(stats?.plan) === plan.id;
                      const isBestValue = plan.badge === "Best Value";
                      const isExclusif  = plan.badge === "Exclusif";

                      // Le prix affiché est toujours le tarif mensuel du pack, que l'on
                      // soit en mode Mensuel ou Annuel — seul le montant facturé (la
                      // ligne "Facturé X€") change selon le cycle choisi.
                      const [priceInt, priceDec] = plan.priceMonthly.toFixed(2).split(".");

                      return (
                        <motion.div key={plan.id}
                          initial={{ opacity: 0, y: 34, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          whileHover={{ scale: 1.035, y: -4 }}
                          className="card !bg-black/85 border border-surface-border relative flex flex-col pt-6 mx-auto w-full max-w-[260px] transition-shadow duration-300 hover:shadow-orange-lg cursor-default">
                          {plan.badge && (
                            <span className={`absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                              isBestValue ? "bg-green-500 text-white" : "bg-amber-400 text-black"
                            }`}>
                              <Sparkles className="w-2.5 h-2.5" />{plan.badge}
                            </span>
                          )}

                          {/* Nom + accroche */}
                          <p className="font-bold text-xl mb-1">{plan.name}</p>
                          <p className={`text-[11px] font-semibold mb-3 ${
                            isExclusif ? "text-amber-400" : isBestValue ? "text-green-400" : "text-white/40"
                          }`}>{plan.tagline}</p>

                          {/* Prix */}
                          <p className="text-white/30 text-sm line-through mb-0.5">{plan.originalPrice}€</p>
                          <p className="mb-2 leading-none">
                            <span className="text-4xl font-black">{priceInt}</span>
                            <span className="text-lg font-black align-top">,{priceDec}</span>
                            <span className="text-white/40 text-sm">€ /mois</span>
                          </p>

                          {/* Garantie */}
                          <span className="inline-flex items-center gap-1.5 self-start text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 mb-1.5">
                            <ShieldCheck className="w-3 h-3" />SATISFAIT OU REMBOURSÉ IMMÉDIATEMENT
                          </span>
                          <p className={`text-white/25 text-[8px] uppercase tracking-wide mb-4 ${planBilling === "monthly" ? "invisible" : ""}`}>
                            {`Soit ${plan.yearlyTotal}€/an en annuel`}
                          </p>

                          {/* Forfait */}
                          <p className="text-white/40 text-[10px] font-bold uppercase tracking-wide mb-2">Votre forfait inclut :</p>
                          <div className={`text-center mb-4 py-4 px-3 rounded-xl border ${
                            isBestValue ? "border-green-500/30 bg-green-500/5" : isExclusif ? "border-amber-400/30 bg-amber-400/5" : "border-surface-border bg-surface-hover"
                          }`}>
                            <p className="text-3xl font-black gradient-text-orange-subtle">{plan.credits}<span className="text-sm text-white/50 font-semibold"> crédits/mois</span></p>
                            {"bonus" in plan && plan.bonus && (
                              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-[10px] font-bold">
                                🎁 {plan.bonus}
                              </div>
                            )}
                            <p className="text-white/35 text-[11px] mt-1.5">{plan.creditsDesc}</p>
                          </div>

                          <p className="text-white/40 text-[10px] font-bold uppercase tracking-wide mb-2">Inclus dans le plan :</p>
                          <ul className="space-y-2 mb-5 flex-1">
                            {plan.features.map(f=>(
                              <li key={f} className="flex items-start gap-2 text-xs text-white/60">
                                <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-accent-orange" />{f}
                              </li>
                            ))}
                          </ul>
                          {isCurrent ? (
                            <div className="w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-green-500/10 text-green-400 border border-green-500/20">Plan actif</div>
                          ) : (
                            <Link href="/pricing" className="btn-primary-orange text-center w-full text-sm py-2.5">Passer à {plan.name}</Link>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ══ SETTINGS VIEW ══ */}
              {navView === "settings" && (
                <motion.div key="settings" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                  <div className="mb-7 pt-8">
                    <h1 className="text-3xl font-black mb-1">Paramètres</h1>
                    <p className="text-white/40">Gérez votre compte et votre abonnement</p>
                  </div>
                  <div className="max-w-md space-y-4">
                    <div className="card space-y-4">
                      <h2 className="font-bold">Informations du compte</h2>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl gradient-bg-orange-animated flex items-center justify-center text-white text-xl font-black">{userInitial}</div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{displayName || userEmail || "—"}</p>
                          <p className="text-white/40 text-sm">
                            Membre depuis {stats?.member_since ? new Date(stats.member_since).toLocaleDateString("fr-FR",{month:"long",year:"numeric"}) : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Nom (optionnel, modifiable) */}
                      <div className="flex items-center justify-between gap-3 py-2 border-t border-surface-border">
                        <span className="text-white/50 text-sm flex-shrink-0">Nom</span>
                        {editingName ? (
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <input
                              type="text"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              placeholder="Votre nom"
                              maxLength={40}
                              className="bg-surface border border-surface-border rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent-orange/60 w-40"
                            />
                            <button
                              onClick={handleSaveName}
                              disabled={savingName}
                              className="px-2.5 py-1.5 rounded-lg bg-accent-orange hover:bg-accent-orange/80 text-white text-xs font-bold transition-all disabled:opacity-50"
                            >
                              {savingName ? "…" : "OK"}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingName(true)}
                            className="font-medium text-white/80 text-sm hover:text-accent-orange transition-colors truncate max-w-[200px]"
                          >
                            {displayName || <span className="text-white/35 italic">Ajouter un nom</span>}
                          </button>
                        )}
                      </div>

                      <div className="flex justify-between py-2 border-t border-surface-border">
                        <span className="text-white/50 text-sm">Adresse e-mail</span>
                        <span className="font-medium text-white/80 truncate max-w-[220px]">{userEmail ?? "—"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-surface-border">
                        <span className="text-white/50 text-sm">Crédits actuels</span>
                        <span className="font-bold text-accent-orange">{stats?.credits?.toLocaleString("fr-FR") ?? 0}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-surface-border">
                        <span className="text-white/50 text-sm">Date d&apos;inscription</span>
                        <span className="font-medium text-white/80">
                          {stats?.member_since ? new Date(stats.member_since).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}) : "—"}
                        </span>
                      </div>
                    </div>

                    {/* ── Mot de passe ── */}
                    <div className="card space-y-3">
                      <h2 className="font-bold flex items-center gap-2">
                        <Lock className="w-4 h-4 text-white/40" />
                        Mot de passe
                      </h2>
                      <p className="text-white/40 text-xs leading-relaxed">
                        Choisissez un nouveau mot de passe (8 caractères minimum). Aucune
                        vérification de l&apos;ancien mot de passe ni de l&apos;e-mail n&apos;est demandée.
                      </p>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Nouveau mot de passe"
                          autoComplete="new-password"
                          className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2.5 pr-10 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent-orange/60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirmer le nouveau mot de passe"
                        autoComplete="new-password"
                        className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent-orange/60"
                      />
                      {confirmNewPassword.length > 0 && newPassword !== confirmNewPassword && (
                        <p className="text-red-400 text-xs">Les mots de passe ne correspondent pas</p>
                      )}
                      <button
                        onClick={handleChangePassword}
                        disabled={
                          savingPassword ||
                          newPassword.length < 8 ||
                          newPassword !== confirmNewPassword
                        }
                        className="btn-primary-orange w-full py-2.5 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Lock className="w-4 h-4" />
                        {savingPassword ? "Modification…" : "Changer le mot de passe"}
                      </button>
                    </div>

                    {/* ── Abonnement ── */}
                    <div className="card space-y-3">
                      <h2 className="font-bold flex items-center gap-2">
                        <Crown className={`w-4 h-4 ${
                          userPlanTier(stats?.plan) === "elite" ? "text-amber-400" :
                          userPlanTier(stats?.plan) === "pro"   ? "text-accent-orange" : "text-white/40"
                        }`} />
                        Abonnement
                      </h2>
                      <div className="flex justify-between py-2 border-t border-surface-border">
                        <span className="text-white/50 text-sm">Formule actuelle</span>
                        <span className={`font-bold ${
                          userPlanTier(stats?.plan) === "elite" ? "text-amber-400" :
                          userPlanTier(stats?.plan) === "pro"   ? "text-accent-orange" : "text-white/70"
                        }`}>
                          {userPlanTier(stats?.plan) === "elite" ? "Ultimate" : userPlanTier(stats?.plan) === "pro" ? "Essentiel" : isPaid ? "Découverte" : "Gratuit"}
                        </span>
                      </div>
                      {subLoading ? (
                        <div className="flex items-center justify-center py-3">
                          <Loader2 className="w-5 h-5 text-accent-orange animate-spin" />
                        </div>
                      ) : subInfo?.active ? (
                        <>
                          <div className="flex justify-between py-2 border-t border-surface-border">
                            <span className="text-white/50 text-sm">Début de l&apos;abonnement</span>
                            <span className="font-medium text-white/80">
                              {subInfo.started_at ? new Date(subInfo.started_at).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}) : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-t border-surface-border">
                            <span className="text-white/50 text-sm">
                              {subInfo.cancel_at_period_end ? "Fin de l'abonnement" : "Prochain renouvellement"}
                            </span>
                            <span className={`font-medium ${subInfo.cancel_at_period_end ? "text-red-400" : "text-white/80"}`}>
                              {subInfo.current_period_end ? new Date(subInfo.current_period_end).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}) : "—"}
                            </span>
                          </div>

                          {subInfo.cancel_at_period_end ? (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                              <p className="text-red-400 text-xs font-medium leading-relaxed">
                                Abonnement annulé — vous conservez tous vos avantages jusqu&apos;à la fin de la période déjà payée, puis il ne sera pas renouvelé.
                              </p>
                            </div>
                          ) : !confirmCancelSub ? (
                            <button
                              onClick={() => setConfirmCancelSub(true)}
                              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-surface-border text-white/50 hover:text-red-400 hover:border-red-500/40 transition-all text-sm font-medium"
                            >
                              Annuler l&apos;abonnement
                            </button>
                          ) : (
                            <div className="space-y-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                              <p className="text-white/70 text-xs leading-relaxed">
                                L&apos;annulation prend effet <strong className="text-white">à la fin de la période en cours</strong>
                                {subInfo.current_period_end && (
                                  <> (le {new Date(subInfo.current_period_end).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})})</>
                                )} — vous gardez l&apos;accès complet jusque-là, rien n&apos;est coupé immédiatement.
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handleCancelSubscription}
                                  disabled={cancellingSub}
                                  className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all disabled:opacity-50"
                                >
                                  {cancellingSub ? "…" : "Confirmer l'annulation"}
                                </button>
                                <button
                                  onClick={() => setConfirmCancelSub(false)}
                                  disabled={cancellingSub}
                                  className="px-3 py-1.5 rounded-lg border border-surface-border text-white/50 hover:text-white text-xs transition-all"
                                >
                                  Garder mon abonnement
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="pt-1">
                          <p className="text-white/40 text-xs mb-3">Aucun abonnement actif — débloquez la 4K, la vidéo IA et bien plus.</p>
                          <button
                            onClick={goToSubscription}
                            className="btn-primary-orange w-full py-2.5 text-sm flex items-center justify-center gap-1.5"
                          >
                            <Crown className="w-4 h-4" />
                            Découvrir les formules
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="card space-y-3">
                      <h2 className="font-bold">Statistiques</h2>
                      <div className="flex justify-between py-2 border-b border-surface-border">
                        <span className="text-white/50 text-sm">Générations totales</span>
                        <span className="font-bold">{stats?.total_generations ?? generations.length}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-surface-border">
                        <span className="text-white/50 text-sm flex items-center gap-1.5">
                          <span>📸</span> Images IA générées
                        </span>
                        <span className="font-bold">{stats?.image_generations ?? 0}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-surface-border">
                        <span className="text-white/50 text-sm flex items-center gap-1.5">
                          <span>🔁</span> Swap visage générés
                        </span>
                        <span className="font-bold">{stats?.swapface_generations ?? 0}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-surface-border">
                        <span className="text-white/50 text-sm flex items-center gap-1.5">
                          <span>🎬</span> Vidéos générées
                        </span>
                        <span className="font-bold">{stats?.video_generations ?? 0}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-white/50 text-sm">Crédits restants</span>
                        <span className="font-bold text-accent-orange">{stats?.credits ?? 0}</span>
                      </div>
                    </div>
                    {/* Accès admin — réservé au compte administrateur */}
                    {userEmail === "gnemmialex@gmail.com" && (
                      <>
                        <Link
                          href="/admin"
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-amber-400/40 text-amber-400 hover:bg-amber-400/10 transition-all text-sm font-bold"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Accès Admin — gérer les utilisateurs
                        </Link>

                        {/* Script maître de génération — interne, admin uniquement */}
                        {adminScript && (
                          <div className="card border-amber-400/25 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <h2 className="font-bold flex items-center gap-2 text-amber-400">
                                <Settings className="w-4 h-4" />
                                Script de génération interne
                              </h2>
                              {/* Interrupteur ON/OFF — test avec / sans le script */}
                              <button
                                onClick={toggleMasterScript}
                                disabled={togglingScript}
                                aria-label={adminScript.enabled ? "Désactiver le script" : "Activer le script"}
                                className={`flex items-center gap-2 flex-shrink-0 rounded-full border px-1 py-1 pr-3 transition-all disabled:opacity-50 ${
                                  adminScript.enabled
                                    ? "bg-green-500/15 border-green-500/40 text-green-400 hover:bg-green-500/25"
                                    : "bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20"
                                }`}
                              >
                                <span
                                  className={`relative w-9 h-5 rounded-full transition-colors ${
                                    adminScript.enabled ? "bg-green-500" : "bg-white/15"
                                  }`}
                                >
                                  <span
                                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                                      adminScript.enabled ? "left-[18px]" : "left-0.5"
                                    }`}
                                  />
                                </span>
                                <span className="text-[11px] font-bold uppercase tracking-wide">
                                  {togglingScript ? "…" : adminScript.enabled ? "Activé" : "Désactivé"}
                                </span>
                              </button>
                            </div>
                            {!adminScript.enabled && (
                              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                                <p className="text-red-400 text-[11px] font-medium leading-relaxed">
                                  ⚠️ Script désactivé : les générations partent SANS les verrous fond /
                                  identité / qualité (mode brut, pour comparaison). Pensez à le réactiver.
                                </p>
                              </div>
                            )}
                            <p className="text-white/40 text-xs leading-relaxed">
                              Injecté dans chaque génération d&apos;image. Trois verrous : fond
                              d&apos;origine conservé, reproduction totale des traits de la personne
                              (visage, peau, cheveux, habits, accessoires), qualité maximale.
                              Visible uniquement par ce compte.
                            </p>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Modèle</p>
                              <p className="text-xs font-mono text-white/70 break-all bg-surface-hover border border-surface-border rounded-lg px-3 py-2">
                                {adminScript.model}
                              </p>
                            </div>
                            <details className="group">
                              <summary className="cursor-pointer text-xs font-bold text-white/70 hover:text-white transition-colors select-none">
                                ▸ Prompt de base ({adminScript.master_prompt.length.toLocaleString("fr-FR")} caractères)
                              </summary>
                              <pre className="mt-2 text-[11px] font-mono text-white/60 whitespace-pre-wrap leading-relaxed bg-surface-hover border border-surface-border rounded-lg px-3 py-2 max-h-72 overflow-y-auto">
                                {adminScript.master_prompt}
                              </pre>
                            </details>
                            {adminScript.gta5_style_boost && (
                              <details className="group">
                                <summary className="cursor-pointer text-xs font-bold text-accent-orange/90 hover:text-accent-orange transition-colors select-none">
                                  ▸ Boost style GTA 5 ({adminScript.gta5_style_boost.length.toLocaleString("fr-FR")} caractères)
                                </summary>
                                <pre className="mt-2 text-[11px] font-mono text-white/60 whitespace-pre-wrap leading-relaxed bg-surface-hover border border-accent-orange/20 rounded-lg px-3 py-2 max-h-72 overflow-y-auto">
                                  {adminScript.gta5_style_boost}
                                </pre>
                              </details>
                            )}
                            <details className="group">
                              <summary className="cursor-pointer text-xs font-bold text-red-400/80 hover:text-red-400 transition-colors select-none">
                                ▸ Negative prompt ({adminScript.negative_prompt.length.toLocaleString("fr-FR")} caractères)
                              </summary>
                              <pre className="mt-2 text-[11px] font-mono text-white/60 whitespace-pre-wrap leading-relaxed bg-surface-hover border border-red-500/20 rounded-lg px-3 py-2 max-h-72 overflow-y-auto">
                                {adminScript.negative_prompt}
                              </pre>
                            </details>
                            {adminScript.note && (
                              <p className="text-white/30 text-[11px] italic leading-relaxed">{adminScript.note}</p>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.98}} onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
                      <LogOut className="w-4 h-4" />Se déconnecter
                    </motion.button>

                    {!confirmCloseAccount ? (
                      <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.98}} onClick={() => setConfirmCloseAccount(true)}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
                        <Trash2 className="w-4 h-4" />Fermer le compte
                      </motion.button>
                    ) : (
                      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-3">
                        <p className="text-red-400 text-xs font-medium flex-1">Supprimer définitivement votre compte et toutes vos données ?</p>
                        <button
                          onClick={handleCloseAccount}
                          disabled={closingAccount}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all disabled:opacity-50 flex-shrink-0"
                        >
                          {closingAccount ? "…" : "Confirmer"}
                        </button>
                        <button
                          onClick={() => setConfirmCloseAccount(false)}
                          disabled={closingAccount}
                          className="px-2.5 py-1.5 rounded-lg border border-surface-border text-white/50 hover:text-white text-xs transition-all flex-shrink-0"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </main>

      <PaywallModal isOpen={showPaywall} onClose={()=>setShowPaywall(false)} reason="Crédits épuisés — Rechargez pour continuer" />
      <TrustNotification />
      <AnimatePresence>
        {showAuthGate && <AuthGateModal onClose={() => setShowAuthGate(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Auth gate modal (mode aperçu) ──────────────────────── */
function AuthGateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        className="relative bg-surface border border-surface-border rounded-2xl p-7 max-w-sm w-full shadow-2xl text-center"
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ duration: 0.18 }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white text-xl leading-none transition-colors">✕</button>

        <div className="w-14 h-14 rounded-2xl bg-accent-orange/15 border border-accent-orange/30 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-accent-orange" />
        </div>
        <h3 className="font-black text-xl mb-2">Créez un compte pour générer</h3>
        <p className="text-white/45 text-sm mb-2 leading-relaxed">
          Vous êtes en mode aperçu. Inscrivez-vous gratuitement pour lancer votre première génération.
        </p>
        <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
          <Zap className="w-3.5 h-3.5" />
          100 crédits offerts = 1 image gratuite
        </div>

        <Link
          href="/register"
          className="btn-primary-orange w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold mb-2"
        >
          <UserPlus className="w-4 h-4" />
          Créer mon compte gratuit
        </Link>
        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-accent-orange/40 text-accent-orange hover:bg-accent-orange/10 text-sm font-bold transition-all"
        >
          <LogIn className="w-4 h-4" />
          J&apos;ai déjà un compte
        </Link>
      </motion.div>
    </div>
  );
}

/* ─── Small helpers ─────────────────────────────────────── */

/** Carte réactive : légère apparition en mouvement + grossissement au survol,
    utilisée pour tous les blocs interactifs du Dashboard (Générer, Historique,
    Parrainage, Abonnements…). */
function AnimatedCard({
  children, className = "", delay = 0,
}: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -3 }}
      className={`transition-shadow duration-300 hover:shadow-orange-lg cursor-default ${className}`}
    >
      {children}
    </motion.div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="text-3xl sm:text-4xl font-black gradient-text leading-none flex-shrink-0 tracking-tighter">
      {n.toString().padStart(2, "0")}
    </span>
  );
}

/* ─── Sélecteur de qualité du rendu final (HD / 4K / Ultra) ──────────────── */
function QualitySelector({
  value, onChange, tier, onLockedClick, step,
}: {
  value: QualityLevel;
  onChange: (q: QualityLevel) => void;
  tier: "essentiel" | "pro" | "elite";
  onLockedClick: (q: QualityLevel) => void;
  step: number;
}) {
  return (
    <AnimatedCard delay={0.12} className="bg-surface/70 backdrop-blur-xl border border-surface-border rounded-2xl p-4">
      <h2 className="font-semibold text-sm mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2">
          Qualité du résultat
          <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
        </span>
        <StepBadge n={step} />
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {QUALITY_LEVELS.map((q) => {
          const unlocked = isQualityUnlocked(q.id, tier);
          const active   = value === q.id;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => (unlocked ? onChange(q.id) : onLockedClick(q.id))}
              className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-3 text-center transition-all ${
                active
                  ? "border-accent-orange bg-accent-orange/15 shadow-[0_0_18px_-4px_rgba(255,122,0,0.55)]"
                  : unlocked
                    ? "border-surface-border bg-surface hover:border-accent-orange/50"
                    : "border-surface-border bg-surface/40 opacity-60 hover:opacity-90"
              }`}
            >
              {!unlocked && (
                <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-white/40" />
              )}
              <span className={`font-black text-base leading-none ${active ? "gradient-text-orange-subtle" : "text-white"}`}>
                {q.label}
              </span>
              <span className="text-[9px] text-white/40 leading-tight">{q.sub}</span>
            </button>
          );
        })}
      </div>
      <p className="text-white/35 text-[11px] mt-2.5 leading-snug">
        {tier === "elite"
          ? "Formule Ultimate : qualité Ultra 8K débloquée. 🎉"
          : tier === "pro"
            ? "Formule Essentiel : jusqu'à la 4K. Passez à Ultimate pour l'Ultra 8K."
            : "Formule Découverte : HD 1080p. Passez à une formule supérieure pour la 4K / Ultra."}
      </p>
    </AnimatedCard>
  );
}

/* ─── Panneau récap des avantages de la formule active ───────────────────── */
function PlanPerksCard({ tier, onUpgrade }: { tier: "essentiel" | "pro" | "elite"; onUpgrade: () => void }) {
  const perks    = PLAN_PERKS[tier];
  const tierName = tier === "elite" ? "Ultimate" : tier === "pro" ? "Essentiel" : "Découverte";
  return (
    <AnimatedCard delay={0.2} className="bg-surface/70 backdrop-blur-xl border border-surface-border rounded-2xl p-4">
      <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <Crown className={`w-4 h-4 ${tier === "elite" ? "text-amber-400" : tier === "pro" ? "text-accent-orange" : "text-white/50"}`} />
        Votre formule <span className="text-white/50">— {tierName}</span>
      </h2>
      <ul className="space-y-1.5">
        {perks.map((p) => (
          <li key={p.label} className={`flex items-center gap-2 text-[13px] ${p.on ? "text-white/80" : "text-white/30"}`}>
            {p.on
              ? <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              : <Lock className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />}
            <span className={p.on ? "" : "line-through decoration-white/20"}>{p.label}</span>
          </li>
        ))}
      </ul>
      {tier !== "elite" && (
        <button
          onClick={onUpgrade}
          className="btn-primary-orange w-full mt-3.5 py-2 text-sm flex items-center justify-center gap-1.5"
        >
          <Crown className="w-4 h-4" />
          Débloquer plus de puissance
        </button>
      )}
    </AnimatedCard>
  );
}

function GenerateCard({
  consent, setConsent, error, onGenerate, onCancel, isGenerating, canGenerate, credits, step, plan,
}: {
  consent: boolean;
  setConsent: (v: boolean) => void;
  error: string | null;
  onGenerate: () => void;
  onCancel?: () => void;
  isGenerating?: boolean;
  canGenerate: boolean;
  credits: number;
  step: number;
  plan?: string;
}) {
  const qBadge = planQualityBadge(plan);
  return (
    <AnimatedCard delay={0.16} className="card">
      <h2 className="font-bold text-base mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          Générer
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${qBadge.color}`}>
            {qBadge.label}
          </span>
        </span>
        <StepBadge n={step} />
      </h2>

      <label className="flex items-start gap-3 cursor-pointer group mb-5">
        <div className="relative mt-0.5 flex-shrink-0">
          <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="sr-only" />
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${consent?"bg-accent-orange border-accent-orange":"border-surface-border group-hover:border-accent-orange/50"}`}>
            {consent && <span className="text-white text-xs">✓</span>}
          </div>
        </div>
        <span className="text-white/55 text-sm leading-relaxed">
          Je confirme avoir le droit d&apos;utiliser ces médias et j&apos;accepte les{" "}
          <a href="/terms" className="text-accent-orange hover:underline">conditions d&apos;utilisation</a>.
        </span>
      </label>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
        </div>
      )}

      {isGenerating ? (
        <motion.button
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 text-base flex items-center justify-center gap-2 rounded-2xl border border-red-500/40 text-red-400 hover:bg-red-500/10 font-semibold transition-all"
        >
          <StopCircle className="w-5 h-5" />
          Arrêter la génération
        </motion.button>
      ) : (
        <motion.button
          onClick={onGenerate}
          disabled={!canGenerate}
          whileHover={canGenerate ? { scale: 1.02 } : {}}
          whileTap={canGenerate ? { scale: 0.97 } : {}}
          className="btn-primary-orange w-full py-3.5 text-base flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {canGenerate && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
              animate={{ x: ["-120%", "220%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            />
          )}
          <Sparkles className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Générer {qBadge.label} — {credits} crédits</span>
        </motion.button>
      )}
    </AnimatedCard>
  );
}
