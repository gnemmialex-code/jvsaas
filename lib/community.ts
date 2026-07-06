import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase";

// La Communauté est réservée à l'abonnement Ultimate (plan "ultra"/"elite").
// L'administrateur y a toujours accès et est le seul à pouvoir écrire dans
// les discussions marquées admin_only ("Mise à jour", "Cadeau").
export const COMMUNITY_ADMIN_EMAIL = "gnemmialex@gmail.com";

export interface CommunityAccess {
  user: User;
  isAdmin: boolean;
  authorName: string;
  admin: SupabaseClient;
}

/** Vérifie connexion + abonnement Ultimate. Renvoie un code d'erreur HTTP sinon. */
export async function getCommunityAccess(): Promise<
  { ok: true; access: CommunityAccess } | { ok: false; status: 401 | 403; error: string }
> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, status: 401, error: "Connectez-vous pour accéder à la Communauté" };
  }

  const admin = createSupabaseAdmin();
  const isAdmin = user.email === COMMUNITY_ADMIN_EMAIL;

  if (!isAdmin) {
    const { data } = await admin
      .from("users")
      .select("plan_id")
      .eq("id", user.id)
      .single();
    const plan = ((data?.plan_id as string | undefined) ?? "free").toLowerCase();
    const isUltimate = plan.includes("ultra") || plan.includes("elite");
    if (!isUltimate) {
      return { ok: false, status: 403, error: "La Communauté est réservée à l'abonnement Ultimate" };
    }
  }

  const authorName =
    (user.user_metadata?.display_name as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "Membre";

  return { ok: true, access: { user, isAdmin, authorName, admin } };
}

/* Les 3 discussions par défaut — recréées automatiquement si absentes, pour
   que la Communauté fonctionne même si le seed SQL n'a pas été exécuté. */
export const DEFAULT_TOPICS = [
  {
    title: "Général",
    description: "Discutez librement entre membres Ultimate : partagez vos créations, vos astuces et vos idées.",
    admin_only: false,
  },
  {
    title: "Mise à jour",
    description: "Les annonces officielles et les nouveautés du site. Seul l'administrateur peut écrire ici.",
    admin_only: true,
  },
  {
    title: "Cadeau",
    description: "Cadeaux, surprises et avantages exclusifs réservés aux membres Ultimate. Seul l'administrateur peut écrire ici.",
    admin_only: true,
  },
];

export async function ensureDefaultTopics(admin: SupabaseClient): Promise<void> {
  const { data: existing, error } = await admin
    .from("community_topics")
    .select("title")
    .eq("is_default", true);
  if (error) return; // table absente → la migration n'a pas été exécutée
  const titles = new Set((existing ?? []).map((t) => t.title));
  const missing = DEFAULT_TOPICS.filter((t) => !titles.has(t.title));
  if (missing.length === 0) return;
  await admin.from("community_topics").insert(
    missing.map((t) => ({ ...t, is_default: true, author_name: "High Like It" }))
  );
}
