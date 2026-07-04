import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      userId: null,
      supabase,
      response: NextResponse.json({ error: "Non authentifié" }, { status: 401 }),
    };
  }

  return {
    user,
    userId: user.id,
    supabase,
    response: null,
  };
}
