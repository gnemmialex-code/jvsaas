import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { stripe, STRIPE_CREDIT_PACKS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté pour acheter des crédits." }, { status: 401 });
  }

  const body = await req.json();
  const { packId } = body as { packId: string };

  const pack = STRIPE_CREDIT_PACKS[packId];
  if (!pack) {
    return NextResponse.json({ error: "Pack invalide" }, { status: 400 });
  }

  if (!pack.priceId) {
    console.error(`[Stripe] Missing price ID for pack=${packId}`);
    return NextResponse.json({ error: "Configuration de prix manquante — contactez le support." }, { status: 500 });
  }

  const origin = req.nextUrl.origin;

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: pack.priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?payment=success&credits=${pack.credits}`,
      cancel_url:  `${origin}/pricing?payment=cancelled`,
      metadata: {
        user_id: user.id,
        credits: pack.credits.toString(),
        pack_id: packId,
      },
      customer_email: user.email,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur Stripe";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
