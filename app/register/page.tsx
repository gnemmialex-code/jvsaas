"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Zap, Gift, Globe } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../components/Input";
import { supabase } from "@/lib/supabase";
import { LOCALES, useI18n } from "@/lib/i18n";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

// Même sélecteur de langue que la page de connexion (design dupliqué).
function LanguageMenu() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="fixed bottom-5 left-5 z-50"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-0 mb-2 w-32 flex flex-col rounded-xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-2xl overflow-hidden py-1"
          >
            {LOCALES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLocale(lang.code); setOpen(false); }}
                className={`px-4 py-2 text-left text-[13px] font-light transition-colors hover:bg-white/[0.06] ${
                  locale === lang.code ? "text-accent-orange font-semibold" : "text-white/75 hover:text-white"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black border border-white/10 text-white/70 cursor-pointer">
        <Globe className="w-[15px] h-[15px]" strokeWidth={1.25} />
      </span>
    </div>
  );
}


export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refCode, setRefCode] = useState<string | null>(null);

  // Capture le code parrain (?ref=CODE) — appliqué automatiquement à la 1re connexion
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      const code = ref.trim().toUpperCase();
      localStorage.setItem("astracrea_ref", code);
      setRefCode(code);
    } else {
      const stored = localStorage.getItem("astracrea_ref");
      if (stored) setRefCode(stored);
    }
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = "Email requis";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Email invalide";
    if (!password) errs.password = "Mot de passe requis";
    else if (password.length < 8) errs.password = "8 caractères minimum";
    if (password !== confirmPassword) errs.confirmPassword = "Les mots de passe ne correspondent pas";
    if (!acceptTerms) errs.terms = "Vous devez accepter les CGU";
    return errs;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      // Confirmation email désactivée côté Supabase → l'utilisateur reçoit
      // directement une session et est connecté immédiatement.
      if (data.session) {
        toast.success("Compte créé ! Bienvenue 🎉");
        // Redirection directe vers le dashboard, en navigation complète pour
        // que le cookie de session soit bien pris en compte partout.
        window.location.href = "/dashboard";
      } else {
        // Sécurité : si la confirmation email est encore activée côté Supabase,
        // on renvoie vers la connexion sans bloquer.
        toast.success("Compte créé ! Vous pouvez vous connecter.");
        router.push("/login");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'inscription";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google") => {
    setOauthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // URL sans query string : plus fiable pour le matching des
          // "Redirect URLs" Supabase. Le callback redirige vers /dashboard
          // par défaut.
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion";
      toast.error(msg);
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-accent-violet/15 rounded-full blur-3xl" />
      <LanguageMenu />

      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <p className="text-center text-4xl font-black italic tracking-wide gradient-text-orange-subtle mb-3">
          High Like It
        </p>

        <div className="text-center mb-5 space-y-2">
          <h1 className="text-xl font-bold text-white/90">Créer un compte</h1>
          <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-3 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5" />
            100 crédits offerts = 1 image gratuite
          </div>
          {refCode && (
            <div className="block">
              <div className="inline-flex items-center gap-1.5 bg-accent-violet/10 border border-accent-violet/30 text-accent-violet text-sm px-3 py-1.5 rounded-full">
                <Gift className="w-3.5 h-3.5" />
                Code parrain <strong>{refCode}</strong> — +100 crédits bonus
              </div>
            </div>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.015 }}
          transition={{ duration: 0.3 }}
          className="card !bg-black/90 !backdrop-blur-lg transition-shadow duration-300 hover:shadow-orange-lg"
        >
          <div className="flex flex-col gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium text-white disabled:opacity-50"
            >
              <GoogleIcon />
              {oauthLoading === "google" ? "Redirection..." : "Continuer avec Google"}
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-3 text-white/30 text-sm">ou</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />

            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                placeholder="8 caractères minimum"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={<Lock className="w-4 h-4" />}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Input
              label="Confirmer le mot de passe"
              type={showPassword ? "text" : "password"}
              placeholder="Répétez votre mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
            />

            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    acceptTerms ? "bg-accent-orange border-accent-orange" : "border-white/10"
                  }`}
                >
                  {acceptTerms && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
              <span className="text-white/60 text-sm leading-relaxed">
                J&apos;accepte les{" "}
                <Link href="/terms" className="text-accent-orange hover:underline">CGU</Link>{" "}
                et la{" "}
                <Link href="/privacy" className="text-accent-orange hover:underline">politique de confidentialité</Link>.
                Usage personnel uniquement.
              </span>
            </label>
            {errors.terms && (
              <p className="text-red-400 text-sm -mt-2">{errors.terms}</p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full bg-white text-black text-lg font-black px-8 py-3 flex items-center justify-center gap-2 rounded-2xl shadow-2xl disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer mon compte gratuit"}
            </motion.button>
          </form>
        </motion.div>

        <p className="text-xs text-white/40 text-center mt-5">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-accent-orange hover:underline">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
