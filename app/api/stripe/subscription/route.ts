import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseServer } from "@/lib/supabase-server";
import { stripe } from "@/lib/stripe";

/* Récupère l'abonnement Stripe le plus récent (actif ou en cours) de
   l'utilisateur connecté, retrouvé via son adresse e-mail. */
async function findSubscription(email: string): Promise<Stripe.Subscription | null> {
  const customers = await stripe.customers.list({ email, limit: 10 });
  let best: Stripe.Subscription | null = null;
  for (const customer of customers.data) {
    const subs = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 10,
    });
    for (const sub of subs.data) {
      if (!["active", "trialing", "past_due"].includes(sub.status)) continue;
      if (!best || sub.created > best.created) best = sub;
    }
  }
  return best;
}

/* GET — infos d'abonnement pour la page Paramètres */
export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  try {
    const sub = await findSubscription(user.email);
    if (!sub) return NextResponse.json({ active: false });

    return NextResponse.json({
      active:               true,
      status:               sub.status,
      started_at:           new Date(sub.start_date * 1000).toISOString(),
      current_period_end:   new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      billing_interval:     sub.items.data[0]?.price?.recurring?.interval ?? null,
    });
  } catch (err) {
    console.error("[Stripe] subscription lookup error:", err);
    return NextResponse.json({ error: "Impossible de récupérer l'abonnement" }, { status: 500 });
  }
}

/* DELETE — annule l'abonnement à la fin de la période déjà payée.
   Aucune coupure immédiate : l'accès reste actif jusqu'à l'échéance
   (fin des 4 semaines / du cycle en cours), puis ne se renouvelle plus. */
export async function DELETE() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  try {
    const sub = await findSubscription(user.email);
    if (!sub) {
      return NextResponse.json({ error: "Aucun abonnement actif trouvé" }, { status: 404 });
    }
    if (sub.cancel_at_period_end) {
      return NextResponse.json({
        ok: true,
        already_cancelled: true,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      });
    }

    const updated = await stripe.subscriptions.update(sub.id, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({
      ok: true,
      current_period_end: new Date(updated.current_period_end * 1000).toISOString(),
    });
  } catch (err) {
    console.error("[Stripe] subscription cancel error:", err);
    return NextResponse.json({ error: "Impossible d'annuler l'abonnement" }, { status: 500 });
  }
}
