import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ credits: 0, authenticated: false });
  }

  const admin = createSupabaseAdmin();

  // Single query with plan_id — admin bypasses RLS
  const { data: userData, error } = await admin
    .from("users")
    .select("credits, created_at, plan_id, snap_rouge_access")
    .eq("id", user.id)
    .single();

  // Fallback if plan_id / snap_rouge_access columns don't exist yet
  let credits = 0;
  let createdAt = "";
  let planId = "free";
  let snapRouge = false;

  if (!error && userData) {
    credits   = userData.credits ?? 0;
    createdAt = userData.created_at ?? "";
    planId    = (userData as Record<string, unknown>).plan_id as string ?? "free";
    snapRouge = !!(userData as Record<string, unknown>).snap_rouge_access;
  } else {
    // snap_rouge_access column might not exist — retry with plan_id only
    const { data: withPlan, error: planErr } = await admin
      .from("users")
      .select("credits, created_at, plan_id")
      .eq("id", user.id)
      .single();
    if (!planErr && withPlan) {
      credits   = withPlan.credits ?? 0;
      createdAt = withPlan.created_at ?? "";
      planId    = (withPlan as Record<string, unknown>).plan_id as string ?? "free";
    } else {
      // plan_id column might not exist either — minimal select
      const { data: basic } = await admin
        .from("users")
        .select("credits, created_at")
        .eq("id", user.id)
        .single();
      if (basic) {
        credits   = basic.credits ?? 0;
        createdAt = basic.created_at ?? "";
      }
    }
  }

  const [
    { count: totalCount },
    { count: swapCount },
    { count: videoCount },
  ] = await Promise.all([
    admin.from("generations").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    admin.from("generations").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("style", "SwapFace"),
    admin.from("generations").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("style", "Vidéo IA"),
  ]);

  const total = totalCount ?? 0;
  const swap  = swapCount  ?? 0;
  const video = videoCount ?? 0;

  const p = planId.toLowerCase();
  const snapAccess = snapRouge || p.includes("pro") || p.includes("ultra") || p.includes("elite");

  return NextResponse.json({
    credits,
    plan:                 planId,
    snap_rouge:           snapAccess,
    authenticated:        true,
    total_generations:    total,
    image_generations:    total - swap - video,
    swapface_generations: swap,
    video_generations:    video,
    member_since:         createdAt,
  });
}
