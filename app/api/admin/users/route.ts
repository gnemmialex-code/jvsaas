import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase";

const ADMIN_EMAIL = "gnemmialex@gmail.com";

async function checkAdmin(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

// GET — liste tous les utilisateurs
export async function GET(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // La colonne de vérité est plan_id ('free' | 'plan_essentiel' | 'plan_pro' |
  // 'plan_ultra') — on en dérive le champ "plan" affiché par le back-office.
  const planFromId: Record<string, string> = {
    free:           "free",
    plan_essentiel: "essentiel",
    plan_pro:       "pro",
    plan_ultra:     "ultra",
  };
  const rows = (data ?? []).map((u: Record<string, unknown>) => ({
    ...u,
    plan: (u.plan as string | null) ?? planFromId[(u.plan_id as string) ?? "free"] ?? "free",
  }));
  return NextResponse.json(rows);
}

// POST — modifier un utilisateur (crédits, plan, notes, ban)
export async function POST(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json();
  const { userId, action, value } = body as {
    userId: string;
    action: "set_credits" | "add_credits" | "set_plan" | "set_notes" | "toggle_ban" | "delete_user";
    value: string | number | boolean;
  };

  const supabase = createSupabaseAdmin();

  if (action === "delete_user") {
    // Garde-fou : impossible de supprimer le compte administrateur lui-même
    if (userId === admin.id) {
      return NextResponse.json({ error: "Impossible de supprimer le compte admin" }, { status: 400 });
    }
    // Supprime les données liées avant le compte (même logique que la
    // suppression de compte par l'utilisateur lui-même).
    await supabase.from("credit_transactions").delete().eq("user_id", userId);
    await supabase.from("generations").delete().eq("user_id", userId);
    await supabase.from("users").delete().eq("id", userId);
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      return NextResponse.json({ error: "Erreur lors de la suppression de l'utilisateur" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (action === "set_credits") {
    const { error } = await supabase.from("users").update({ credits: Number(value) }).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (action === "add_credits") {
    const { data } = await supabase.from("users").select("credits").eq("id", userId).single();
    const newCredits = (data?.credits ?? 0) + Number(value);
    const { error } = await supabase.from("users").update({ credits: newCredits }).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (action === "set_plan") {
    // plan_id est LA colonne lue par toute l'app (génération, crédits, Snap
    // Rouge, floutage) — c'est elle qu'il faut poser, y compris pour 'free'.
    const planIdMap: Record<string, string> = {
      free:      "free",
      essentiel: "plan_essentiel",
      pro:       "plan_pro",
      ultra:     "plan_ultra",
    };
    const planCreditsMap: Record<string, number> = {
      free:      100,
      essentiel: 2500,
      pro:       10250,
      ultra:     999999,
    };
    const planKey = String(value);
    if (!(planKey in planIdMap)) {
      return NextResponse.json({ error: `Plan inconnu : ${planKey}` }, { status: 400 });
    }
    const { error } = await supabase.from("users").update({
      plan_id:    planIdMap[planKey],
      credits:    planCreditsMap[planKey],
      updated_at: new Date().toISOString(),
    }).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // Colonnes optionnelles (absentes du schéma de base) — best-effort séparé
    // pour ne jamais faire échouer le changement de plan lui-même.
    await supabase.from("users")
      .update({ plan: planKey, plan_started_at: new Date().toISOString() })
      .eq("id", userId)
      .then(() => {}, () => {});
  } else if (action === "set_notes") {
    const { error } = await supabase.from("users").update({ notes: String(value) }).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (action === "toggle_ban") {
    const { error } = await supabase.from("users").update({ is_banned: Boolean(value) }).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
