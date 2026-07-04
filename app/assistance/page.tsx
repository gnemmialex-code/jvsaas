"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, X } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "@/lib/supabase";

function ContactForm() {
  const [email,       setEmail]       = useState("");
  const [emailLocked, setEmailLocked] = useState(false);
  const [firstName,   setFirstName]   = useState("");
  const [subject,     setSubject]     = useState("");
  const [message,     setMessage]     = useState("");
  const [imageFile,   setImageFile]   = useState<File | null>(null);
  const [imagePreview,setImagePreview]= useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail(data.user.email);
        setEmailLocked(true);
      }
    });
  }, []);

  const handleImage = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !firstName || !subject || !message) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("email",      email);
      fd.append("first_name", firstName);
      fd.append("subject",    subject);
      fd.append("message",    message);
      if (imageFile) fd.append("image", imageFile);

      const res = await fetch("/api/contact", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de l'envoi");
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center mb-5">
          <span className="text-3xl">✓</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">Message envoyé !</h3>
        <p className="text-white/50 max-w-sm">
          Merci {firstName}, nous avons bien reçu votre message et vous répondrons rapidement.
        </p>
        <button
          onClick={() => { setSuccess(false); setSubject(""); setMessage(""); setImageFile(null); setImagePreview(null); if (!emailLocked) setEmail(""); setFirstName(""); }}
          className="mt-6 text-accent-violet text-sm hover:underline"
        >
          Envoyer un autre message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email + Prénom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            readOnly={emailLocked}
            placeholder="votre@email.com"
            className={`w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent-violet/60 transition-colors ${emailLocked ? "opacity-60 cursor-not-allowed" : ""}`}
          />
          {emailLocked && <p className="text-white/30 text-[10px] mt-1">Pré-rempli depuis votre compte</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">
            Prénom <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="Votre prénom"
            className="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent-violet/60 transition-colors"
          />
        </div>
      </div>

      {/* Sujet */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">
          Motif / Sujet <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Ex : Question sur mon abonnement, Problème technique, Partenariat…"
          className="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent-violet/60 transition-colors"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Décrivez votre demande en détail…"
          rows={5}
          className="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent-violet/60 resize-none transition-colors"
        />
      </div>

      {/* Image optionnelle */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">
          Image / Capture d&apos;écran <span className="text-white/25 font-normal">(optionnel)</span>
        </label>
        {imagePreview ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="preview" className="h-24 rounded-xl object-cover border border-surface-border" />
            <button
              type="button"
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-surface-border text-white/40 hover:text-white hover:border-accent-violet/40 text-sm transition-colors"
          >
            <Paperclip className="w-4 h-4" />
            Joindre une image (JPG, PNG — max 5 Mo)
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleImage(f); }}
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-60"
      >
        {loading ? (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {loading ? "Envoi en cours…" : "Envoyer le message"}
      </button>
    </form>
  );
}

export default function AssistancePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 bg-accent-violet/10 border border-accent-violet/30 text-accent-violet text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Send className="w-3.5 h-3.5" />
            Assistance
          </span>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            Une question ?<br />
            <span className="gradient-text">Écrivez-nous</span>
          </h1>
          <p className="text-white/50 leading-relaxed">
            Support, partenariat, retour d&apos;expérience — on vous répond en général sous 24h.
          </p>
        </div>

        <div className="card">
          <ContactForm />
        </div>

        <div className="text-center mt-8 space-y-1 text-sm text-white/40">
          <p>📧 contact@riseandclose.co</p>
          <p>⏱️ Réponse sous 24h en moyenne</p>
          <p>🔒 Vos données restent confidentielles</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
