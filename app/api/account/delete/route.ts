import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function DELETE() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();

  // Supprime les données liées avant le compte (au cas où les clés étrangères
  // ne seraient pas configurées en cascade côté base).
  await admin.from("credit_transactions").delete().eq("user_id", user.id);
  await admin.from("generations").delete().eq("user_id", user.id);
  await admin.from("users").delete().eq("id", user.id);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression du compte" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
