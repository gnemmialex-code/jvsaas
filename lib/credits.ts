import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserCredits(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (error || !data) return 0;
  return data.credits ?? 0;
}

export async function hasEnoughCredits(supabase: SupabaseClient, userId: string, required = 1): Promise<boolean> {
  const credits = await getUserCredits(supabase, userId);
  return credits >= required;
}

export async function addCredits(supabase: SupabaseClient, userId: string, amount: number): Promise<void> {
  await supabase.rpc("add_credits", { user_id: userId, amount });
}
