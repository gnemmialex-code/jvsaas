import { NextRequest, NextResponse } from "next/server";
import { getCommunityAccess } from "@/lib/community";
import { validateCreditGiftKey } from "@/lib/community-bots";

// POST /api/community/claim — { key } → réclame un cadeau « 200 crédits ».
// Réservé aux membres Ultimate connectés (même contrôle que la Communauté).
// Un même cadeau ne peut être réclamé qu'une seule fois par utilisateur.
export async function POST(req: NextRequest) {
  const gate = await getCommunityAccess();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { admin, user } = gate.access;

  let key: string | undefined;
  try {
    const body = await req.json();
    key = (body?.key as string | undefined)?.trim();
  } catch { /* corps invalide */ }

  if (!key) return NextResponse.json({ error: "Cadeau introuvable" }, { status: 400 });

  const gift = validateCreditGiftKey(key);
  if (!gift) {
    return NextResponse.json({ error: "Ce cadeau n'est plus disponible" }, { status: 400 });
  }

  // Enregistre la réclamation — la contrainte d'unicité (claim_key, user_id)
  // empêche toute double récupération.
  const { error: claimErr } = await admin
    .from("community_credit_claims")
    .insert({ claim_key: key, user_id: user.id, amount: gift.amount });

  if (claimErr) {
    // 23505 = violation d'unicité → déjà réclamé
    if ((claimErr as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "Vous avez déjà récupéré ce cadeau" }, { status: 409 });
    }
    // Table absente → migration non exécutée
    return NextResponse.json(
      { error: "Cadeaux indisponibles — exécutez la migration supabase/migration-communaute-cadeaux.sql" },
      { status: 503 }
    );
  }

  // Crédite le compte (+200)
  const { error: creditErr } = await admin.rpc("add_credits", {
    user_id: user.id,
    amount: gift.amount,
  });
  if (creditErr) {
    // Repli si la RPC n'existe pas : addition directe
    const { data: row } = await admin.from("users").select("credits").eq("id", user.id).single();
    const next = (row?.credits ?? 0) + gift.amount;
    await admin.from("users").update({ credits: next }).eq("id", user.id);
  }

  const { data: fresh } = await admin.from("users").select("credits").eq("id", user.id).single();

  return NextResponse.json({
    ok: true,
    amount: gift.amount,
    credits: fresh?.credits ?? null,
  });
}
