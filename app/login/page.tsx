"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Globe } from "lucide-react";
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


export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Listen for SIGNED_IN event — fires after session cookie is fully set
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        window.location.href = "/dashboard";
      }
    });
    return () => subscription.unsubscribe();
  }, []);;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = t("login.errorEmailRequired");
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = t("login.errorEmailInvalid");
    if (!password) errs.password = t("login.errorPasswordRequired");
    return errs;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success(t("login.success"));
      // redirect handled by onAuthStateChange above
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("login.errorGeneric");
      toast.error(msg === "Invalid login credentials" ? t("login.errorBadCredentials") : msg);
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
      const msg = err instanceof Error ? err.message : t("login.errorGeneric");
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
        <p className="text-center text-4xl font-black italic tracking-wide gradient-text-orange-subtle mb-5">
          High Like It
        </p>

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
              {oauthLoading === "google" ? t("register.redirecting") : t("register.continueGoogle")}
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-3 text-white/30 text-sm">{t("register.or")}</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label={t("login.email")}
              type="email"
              placeholder={t("login.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />

            <div className="relative">
              <Input
                label={t("login.password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-white/40 hover:text-white transition-colors">
                {t("login.forgotPassword")}
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full bg-white text-black text-lg font-black px-8 py-3 flex items-center justify-center gap-2 rounded-2xl shadow-2xl disabled:opacity-50"
            >
              {loading ? t("login.submitting") : t("login.submit")}
            </motion.button>
          </form>
        </motion.div>

        <p className="text-xs text-white/40 text-center mt-5">
          {t("login.noAccount")}{" "}
          <Link href="/register" className="text-accent-orange hover:underline">
            {t("login.signupFree")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
