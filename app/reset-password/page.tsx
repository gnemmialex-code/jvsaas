"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../components/Input";
import { supabase } from "@/lib/supabase";

// Page d'arrivée du lien "mot de passe oublié" : le lien de l'e-mail passe par
// /auth/callback qui ouvre une session de récupération, puis redirige ici pour
// choisir un nouveau mot de passe. Même design que la page de connexion.
export default function ResetPasswordPage() {
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // La session de récupération peut arriver un instant après le montage
    // (échange du code) : on écoute aussi les changements d'état d'auth.
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user);
      setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) { setHasSession(true); setChecking(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (password.length < 8) errs.password = "8 caractères minimum";
    if (password !== confirmPassword) errs.confirmPassword = "Les mots de passe ne correspondent pas";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(
          error.message.toLowerCase().includes("different")
            ? "Le nouveau mot de passe doit être différent de l'ancien"
            : "Impossible de modifier le mot de passe — le lien a peut-être expiré"
        );
        return;
      }
      toast.success("Mot de passe modifié ! Vous êtes connecté.");
      // Connecté → direction le dashboard
      window.location.href = "/dashboard";
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-accent-violet/15 rounded-full blur-3xl" />

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
          {checking ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-7 h-7 text-accent-orange animate-spin" />
            </div>
          ) : !hasSession ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-7 h-7 text-red-400" />
              </div>
              <h1 className="text-xl font-bold mb-2">Lien invalide ou expiré</h1>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Ce lien de réinitialisation n&apos;est plus valable. Demandez-en un nouveau,
                il ne faut que quelques secondes.
              </p>
              <Link href="/forgot-password" className="btn-primary-orange inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold">
                Recevoir un nouveau lien
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold mb-1 text-center">Nouveau mot de passe</h1>
              <p className="text-white/45 text-sm text-center mb-6 leading-relaxed">
                Choisissez votre nouveau mot de passe (8 caractères minimum).
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    label="Nouveau mot de passe"
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

                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="w-full bg-white text-black text-lg font-black px-8 py-3 flex items-center justify-center gap-2 rounded-2xl shadow-2xl disabled:opacity-50"
                >
                  {saving ? "Modification…" : "Valider le nouveau mot de passe"}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
