import { NextRequest, NextResponse } from "next/server";
import { getCommunityAccess, ensureDefaultTopics } from "@/lib/community";

// GET /api/community/topics — liste des discussions (défauts épinglés en tête)
export async function GET() {
  const gate = await getCommunityAccess();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { admin, isAdmin } = gate.access;

  await ensureDefaultTopics(admin);

  const { data, error } = await admin
    .from("community_topics")
    .select("id, title, description, author_name, admin_only, is_default, created_at")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Communauté indisponible — la migration SQL n'a pas encore été exécutée" },
      { status: 500 }
    );
  }

  // Ordre fixe des 3 discussions par défaut : Général, Mise à jour, Cadeau
  const DEFAULT_ORDER = ["Général", "Mise à jour", "Cadeau"];
  const topics = [...(data ?? [])].sort((a, b) => {
    if (a.is_default && b.is_default) {
      return DEFAULT_ORDER.indexOf(a.title) - DEFAULT_ORDER.indexOf(b.title);
    }
    if (a.is_default !== b.is_default) return a.is_default ? -1 : 1;
    // Les discussions créées par les membres : plus récentes en premier
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return NextResponse.json({ topics, is_admin: isAdmin });
}

// POST /api/community/topics — créer une discussion { title, description }
export async function POST(req: NextRequest) {
  const gate = await getCommunityAccess();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { admin, user, authorName } = gate.access;

  let body: { title?: string; description?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Requête invalide" }, { status: 400 }); }

  const title = (body.title ?? "").trim();
  const description = (body.description ?? "").trim();

  if (title.length < 3)   return NextResponse.json({ error: "Titre trop court (3 caractères minimum)" }, { status: 400 });
  if (title.length > 80)  return NextResponse.json({ error: "Titre trop long (80 caractères maximum)" }, { status: 400 });
  if (description.length > 500) return NextResponse.json({ error: "Description trop longue (500 caractères maximum)" }, { status: 400 });

  const { data, error } = await admin
    .from("community_topics")
    .insert({
      title,
      description,
      created_by: user.id,
      author_name: authorName,
      admin_only: false,
      is_default: false,
    })
    .select("id, title, description, author_name, admin_only, is_default, created_at")
    .single();

  if (error) return NextResponse.json({ error: "Impossible de créer la discussion" }, { status: 500 });
  return NextResponse.json({ topic: data });
}
