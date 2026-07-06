"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, MailCheck, ArrowLeft } from "lucide-react";
import Input from "../components/Input";
import { supabase } from "@/lib/supabase";

// Mot de passe oublié : l'utilisateur saisit son e-mail et reçoit un lien qui
// le ramène sur /reset-password (via /auth/callback) pour choisir un nouveau
// mot de passe. Même design que la page de connexion.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Email requis"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Email invalide"); return; }
    setError(null);
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch {
      // Message identique succès/échec : on ne révèle jamais si l'e-mail existe
      setSent(true);
    } finally {
      setLoading(false);
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
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <MailCheck className="w-7 h-7 text-green-400" />
              </div>
              <h1 className="text-xl font-bold mb-2">E-mail envoyé !</h1>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Si un compte existe avec l&apos;adresse <strong className="text-white/80">{email}</strong>,
                vous allez recevoir un e-mail avec un lien pour créer un nouveau mot de passe.
                Pensez à vérifier vos spams.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-accent-orange hover:underline text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold mb-1 text-center">Mot de passe oublié</h1>
              <p className="text-white/45 text-sm text-center mb-6 leading-relaxed">
                Entrez votre adresse e-mail : nous vous enverrons un lien pour créer un nouveau mot de passe.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error ?? undefined}
                  icon={<Mail className="w-4 h-4" />}
                  autoComplete="email"
                />

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="w-full bg-white text-black text-lg font-black px-8 py-3 flex items-center justify-center gap-2 rounded-2xl shadow-2xl disabled:opacity-50"
                >
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>

        {!sent && (
          <p className="text-xs text-white/40 text-center mt-5">
            Vous vous en souvenez finalement ?{" "}
            <Link href="/login" className="text-accent-orange hover:underline">
              Se connecter
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
