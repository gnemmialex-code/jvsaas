"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import ResultCard from "../components/ResultCard";
import Loader from "../components/Loader";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { isPaidPlan } from "@/lib/plan";

interface Generation {
  id: string;
  input_image_url: string;
  output_image_url: string;
  style: string;
  created_at: string;
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const generationId = searchParams.get("id");

  const [generation, setGeneration] = useState<Generation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [locked, setLocked] = useState(true); // floutage par défaut tant que le plan n'est pas confirmé

  useEffect(() => {
    if (!generationId) {
      setError("ID de génération manquant");
      setLoading(false);
      return;
    }
    fetchGeneration(generationId);
    // Détermine si le compte est payant (sinon résultat flouté)
    fetch("/api/credits")
      .then((r) => r.json())
      .then((d) => setLocked(!isPaidPlan(d.plan)))
      .catch(() => setLocked(true));
  }, [generationId]);

  const fetchGeneration = async (id: string) => {
    try {
      const res = await fetch(`/api/generate?id=${id}`);
      if (!res.ok) throw new Error("Génération introuvable");
      const data = await res.json();
      setGeneration(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!generation) return;
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/generate/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generation_id: generation.id }),
      });
      if (res.status === 402) {
        toast.error("Crédits insuffisants");
        return;
      }
      if (!res.ok) throw new Error("Erreur de régénération");
      const data = await res.json();
      if (data.generation_id) {
        router.push(`/result?id=${data.generation_id}`);
      }
    } catch {
      toast.error("Erreur lors de la régénération");
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center pt-16">
        <Loader message="Chargement du résultat..." />
      </div>
    );
  }

  if (error || !generation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center pt-16 px-4 text-center">
        <p className="text-white/50 mb-6">{error ?? "Résultat introuvable"}</p>
        <Link href="/upload" className="btn-primary">
          Nouvelle génération
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Nouvelle génération
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black mb-1">
              Votre <span className="gradient-text">transformation</span>
            </h1>
            <p className="text-white/50">Style : {generation.style}</p>
          </div>
          <Link href="/dashboard" className="btn-secondary text-sm hidden sm:flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Voir l&apos;historique
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ResultCard
            outputUrl={generation.output_image_url}
            inputUrl={generation.input_image_url}
            style={generation.style}
            generatedAt={generation.created_at}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
            locked={locked}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="card">
            <h3 className="font-semibold mb-3">Détails de la génération</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: "Style", value: generation.style },
                { label: "Qualité", value: "4K Ultra HD" },
                { label: "Modèle", value: "Highlights v2" },
                { label: "Date", value: new Date(generation.created_at).toLocaleDateString("fr-FR") },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-white/40">{label}</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3">Créer une autre</h3>
            <p className="text-white/50 text-sm mb-4">
              Essayez un style différent ou uploadez une nouvelle photo.
            </p>
            <Link href="/upload" className="btn-primary w-full flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Nouvelle génération
            </Link>
          </div>

          <div className="card border-accent-violet/20 bg-accent-violet/5">
            <p className="text-sm text-white/60 leading-relaxed">
              🔒 <strong className="text-white">Confidentialité</strong> : votre photo originale est supprimée de nos serveurs après traitement. Seule l&apos;image générée est conservée dans votre historique.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Suspense fallback={<Loader message="Chargement..." />}>
        <ResultContent />
      </Suspense>
    </div>
  );
}
