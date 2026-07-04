import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Use service role for webhook (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur webhook";
    console.error("Webhook signature verification failed:", msg);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // ── Achat unique Snap Rouge → débloque l'accès à vie ──
    if (session.metadata?.product === "snap_rouge") {
      const snapUserId = session.metadata?.user_id;
      if (!snapUserId) {
        console.error("Missing user_id in snap_rouge session:", session.id);
        return NextResponse.json({ error: "Metadata manquante" }, { status: 400 });
      }

      const { error: snapError } = await supabaseAdmin
        .from("users")
        .update({ snap_rouge_access: true, updated_at: new Date().toISOString() })
        .eq("id", snapUserId);

      if (snapError) {
        console.error("Error unlocking Snap Rouge:", snapError);
        return NextResponse.json({ error: "Erreur de déblocage Snap Rouge" }, { status: 500 });
      }

      await supabaseAdmin.from("credit_transactions").insert({
        user_id:           snapUserId,
        amount:            0,
        type:              "purchase",
        pack_id:           "snap_rouge",
        stripe_session_id: session.id,
      });

      console.log(`✅ Snap Rouge unlocked for user ${snapUserId}`);
      return NextResponse.json({ received: true });
    }

    const userId     = session.metadata?.user_id;
    const rawCredits = session.metadata?.credits ?? "0";
    const packId     = session.metadata?.pack_id;
    const planId     = session.metadata?.plan_id ?? packId ?? null;

    // Le plan Ultimate est "illimité" (credits = "unlimited" dans la metadata).
    // On lui attribue un très gros solde plutôt que d'échouer sur parseInt.
    const isUnlimited = rawCredits === "unlimited";
    const credits     = isUnlimited ? 1_000_000 : parseInt(rawCredits, 10);

    // ⚠️ On exige seulement user_id : même un plan sans crédits doit débloquer
    //    le rôle/accès. Sans ça, un client Ultimate paierait sans obtenir l'accès.
    if (!userId) {
      console.error("Missing user_id in checkout session:", session.id);
      return NextResponse.json({ error: "Metadata manquante" }, { status: 400 });
    }

    // Add credits (atomic increment) — seulement si le plan en accorde
    if (Number.isFinite(credits) && credits > 0) {
      const { error: rpcError } = await supabaseAdmin.rpc("add_credits", {
        user_id: userId,
        amount:  credits,
      });

      if (rpcError) {
        console.error("Error adding credits:", rpcError);
        return NextResponse.json({ error: "Erreur d'ajout de crédits" }, { status: 500 });
      }
    }

    // Save plan_id to users table → c'est CE CHAMP qui donne le rôle/accès.
    // (graceful — la colonne peut ne pas exister si la migration n'est pas passée)
    if (planId) {
      const { error: planErr } = await supabaseAdmin
        .from("users")
        .update({ plan_id: planId, updated_at: new Date().toISOString() })
        .eq("id", userId);
      if (planErr) {
        console.error("❌ Could not save plan_id (run the migration!):", planErr.message);
      }
    }

    // Log the transaction
    await supabaseAdmin.from("credit_transactions").insert({
      user_id:          userId,
      amount:           Number.isFinite(credits) ? credits : 0,
      type:             "purchase",
      pack_id:          packId,
      stripe_session_id: session.id,
    });

    console.log(`✅ Added ${credits} credits to user ${userId} (plan: ${planId ?? "n/a"})`);
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    console.error("❌ Payment failed:", intent.id);
  }

  return NextResponse.json({ received: true });
}
