import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { stripe, SNAP_ROUGE_PRODUCT } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté pour acheter l'accès Snap Rouge." }, { status: 401 });
  }

  const origin = req.nextUrl.origin;

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name:        SNAP_ROUGE_PRODUCT.name,
              description: "Accès à vie à la technique complète Snap Rouge sur High Like It",
            },
            unit_amount: SNAP_ROUGE_PRODUCT.amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?view=snaprouge&payment=snap_success`,
      cancel_url:  `${origin}/dashboard?view=snaprouge&payment=cancelled`,
      metadata: {
        user_id: user.id,
        product: "snap_rouge",
      },
      customer_email: user.email,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur Stripe";
    console.error("[Stripe] Snap Rouge session error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
