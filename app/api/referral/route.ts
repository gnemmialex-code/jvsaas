import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase";

// GET → mon code parrain + statistiques (filleuls, crédits gagnés)
export async function GET() {
  const { userId, response } = await requireAuth();
  if (response) return response;

  const admin = createSupabaseAdmin();

  const { data: me, error } = await admin
    .from("users")
    .select("referral_code, referred_by")
    .eq("id", userId!)
    .single();

  if (error) {
    // Colonnes absentes → migration pas encore exécutée
    return NextResponse.json(
      { error: "Parrainage indisponible — exécutez la migration supabase/migration-parrainage-snap-rouge.sql" },
      { status: 503 }
    );
  }

  let code = me?.referral_code as string | null;

  // Génère un code si l'utilisateur n'en a pas encore (comptes créés avant la migration)
  if (!code) {
    for (let attempt = 0; attempt < 5 && !code; attempt++) {
      const candidate = Array.from({ length: 8 }, () =>
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
      ).join("");
      const { error: updErr } = await admin
        .from("users")
        .update({ referral_code: candidate })
        .eq("id", userId!)
        .is("referral_code", null);
      if (!updErr) code = candidate;
    }
    if (!code) {
      return NextResponse.json({ error: "Impossible de générer un code parrain" }, { status: 500 });
    }
  }

  const { count } = await admin
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("referred_by", userId!);

  const referrals = count ?? 0;

  return NextResponse.json({
    code,
    referrals,
    credits_earned: referrals * 200,
    already_referred: !!me?.referred_by,
  });
}

// POST { code } → applique un code parrain au compte connecté
// Parrain : +200 crédits / Filleul : +100 crédits
export async function POST(req: NextRequest) {
  const { userId, response } = await requireAuth();
  if (response) return response;

  let code: string | undefined;
  try {
    const body = await req.json();
    code = (body?.code as string | undefined)?.trim();
  } catch { /* body invalide */ }

  if (!code) {
    return NextResponse.json({ error: "Code de parrainage manquant" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  const { data, error } = await admin.rpc("apply_referral", {
    p_user_id: userId!,
    p_code: code,
  });

  if (error) {
    console.error("apply_referral error:", error);
    return NextResponse.json(
      { error: "Parrainage indisponible — exécutez la migration supabase/migration-parrainage-snap-rouge.sql" },
      { status: 503 }
    );
  }

  const result = data as { ok: boolean; error?: string };
  if (!result?.ok) {
    return NextResponse.json({ ok: false, error: result?.error ?? "Code invalide" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, bonus: 100 });
}
