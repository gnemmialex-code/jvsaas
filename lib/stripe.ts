import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const STRIPE_CREDIT_PACKS: Record<string, { credits: number; priceId: string; name: string; amountCents: number }> = {
  pack_800: {
    credits:     800,
    priceId:     process.env.STRIPE_PRICE_CREDITS_800!,
    name:        "Recharge 800 crédits",
    amountCents: 990,
  },
  pack_2000: {
    credits:     2000,
    priceId:     process.env.STRIPE_PRICE_CREDITS_2000!,
    name:        "Recharge 2 000 crédits",
    amountCents: 1998,
  },
};

// Accès à vie à la technique Snap Rouge — paiement unique (inclus dans Pro & Elite)
export const SNAP_ROUGE_PRODUCT = {
  name:        "Technique Snap Rouge — Accès à vie",
  amountCents: 490, // 4,90 € — modifiable ici
};

export const STRIPE_PLANS: Record<string, { credits: number | null; monthly: string; yearly: string; name: string }> = {
  plan_essentiel: {
    credits: 2500,
    monthly: process.env.STRIPE_PRICE_ESSENTIEL_MONTHLY!,
    yearly:  process.env.STRIPE_PRICE_ESSENTIEL_YEARLY!,
    name: "Highlights Essentiel",
  },
  plan_pro: {
    credits: 11250, // 10 250 mensuel + 1 000 crédits offerts à la souscription
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    yearly:  process.env.STRIPE_PRICE_PRO_YEARLY!,
    name: "Highlights Pro",
  },
  plan_ultra: {
    credits: null,
    monthly: process.env.STRIPE_PRICE_ULTRA_MONTHLY!,
    yearly:  process.env.STRIPE_PRICE_ULTRA_YEARLY!,
    name: "Highlights Ultra",
  },
};
