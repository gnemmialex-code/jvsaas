"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

const PACKS = [
  {
    id: "pack_50",
    credits: 50,
    price: "4,99€",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_50 ?? "",
    perCredit: "0,10€/crédit",
    popular: false,
  },
  {
    id: "pack_150",
    credits: 150,
    price: "9,99€",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_150 ?? "",
    perCredit: "0,07€/crédit",
    popular: true,
    savings: "Économisez 30%",
  },
  {
    id: "pack_400",
    credits: 400,
    price: "19,99€",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_400 ?? "",
    perCredit: "0,05€/crédit",
    popular: false,
    savings: "Économisez 50%",
  },
];

export default function PaywallModal({ isOpen, onClose, reason }: PaywallModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (pack: typeof PACKS[0]) => {
    setLoading(pack.id);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: pack.id, priceId: pack.priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Erreur lors de la création de la session");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 max-w-lg w-full relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-accent-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-accent-orange" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {reason ?? "Crédits insuffisants"}
              </h2>
              <p className="text-white/50">
                Rechargez pour continuer à générer des images Ultra HD
              </p>
            </div>

            <div className="space-y-3">
              {PACKS.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => handlePurchase(pack)}
                  disabled={!!loading}
                  className={`
                    w-full p-4 rounded-2xl border text-left transition-all duration-200 group relative
                    ${pack.popular
                      ? "border-accent-orange bg-accent-orange/10 hover:bg-accent-orange/20"
                      : "border-surface-border hover:border-accent-orange/40 hover:bg-surface-hover"
                    }
                  `}
                >
                  {pack.popular && (
                    <span className="absolute -top-2 left-4 bg-accent-orange text-white text-xs px-3 py-0.5 rounded-full font-semibold">
                      Populaire
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {loading === pack.id ? (
                        <Loader2 className="w-5 h-5 text-accent-orange animate-spin" />
                      ) : (
                        <div className="w-10 h-10 bg-accent-orange/10 rounded-xl flex items-center justify-center text-accent-orange font-bold text-sm">
                          {pack.credits}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{pack.credits} crédits</p>
                        <p className="text-white/40 text-sm">{pack.perCredit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{pack.price}</p>
                      {pack.savings && (
                        <p className="text-green-400 text-xs">{pack.savings}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-white/30 text-xs">
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                Paiement sécurisé
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                Sans abonnement
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                Crédits sans expiry
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
