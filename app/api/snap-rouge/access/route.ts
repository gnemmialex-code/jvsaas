import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase";

// L'accès Snap Rouge est débloqué par : achat unique OU abonnement Pro / Elite
export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ access: false, authenticated: false });
  }

  const admin = createSupabaseAdmin();

  const { data, error } = await admin
    .from("users")
    .select("plan_id, snap_rouge_access")
    .eq("id", user.id)
    .single();

  let planId = "plan_essentiel";
  let purchased = false;

  if (!error && data) {
    planId    = (data.plan_id as string) ?? "plan_essentiel";
    purchased = !!data.snap_rouge_access;
  } else {
    // Colonne snap_rouge_access absente — fallback sur plan_id seul
    const { data: basic } = await admin
      .from("users")
      .select("plan_id")
      .eq("id", user.id)
      .single();
    if (basic?.plan_id) planId = basic.plan_id as string;
  }

  const p = planId.toLowerCase();
  const planUnlocked = p.includes("pro") || p.includes("ultra") || p.includes("elite");

  return NextResponse.json({
    access:        purchased || planUnlocked,
    purchased,
    plan_unlocked: planUnlocked,
    authenticated: true,
  });
}
