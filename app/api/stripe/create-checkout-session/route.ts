import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté pour souscrire à un plan." }, { status: 401 });
  }

  const body = await req.json();
  const { planId, billing } = body as { planId: string; billing: "monthly" | "yearly" };

  const plan = STRIPE_PLANS[planId];
  if (!plan) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  const priceId = billing === "yearly" ? plan.yearly : plan.monthly;

  if (!priceId) {
    console.error(`[Stripe] Missing price ID for plan=${planId} billing=${billing}`);
    return NextResponse.json({ error: "Configuration de prix manquante — contactez le support." }, { status: 500 });
  }

  // Déduire l'URL de base depuis la requête pour éviter les erreurs localhost en prod
  const origin = req.nextUrl.origin;

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url:  `${origin}/pricing?payment=cancelled`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        billing,
        credits: plan.credits?.toString() ?? "unlimited",
      },
      customer_email: user.email,
    });

    console.log(`[Stripe] Checkout session created: ${checkoutSession.id} for user ${user.id} (${planId})`);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur Stripe inconnue";
    console.error(`[Stripe] Checkout session error for ${planId}:`, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
