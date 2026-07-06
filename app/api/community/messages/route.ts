import { NextRequest, NextResponse } from "next/server";
import { getCommunityAccess } from "@/lib/community";
import { uploadToStorage } from "@/lib/storage";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 Mo
const TEXT_SIZES = ["small", "normal", "large", "title"] as const;

// GET /api/community/messages?topic_id=... — les messages d'une discussion (ordre chronologique)
export async function GET(req: NextRequest) {
  const gate = await getCommunityAccess();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { admin } = gate.access;

  const topicId = req.nextUrl.searchParams.get("topic_id");
  if (!topicId) return NextResponse.json({ error: "topic_id requis" }, { status: 400 });

  const { data, error } = await admin
    .from("community_messages")
    .select("id, topic_id, user_id, author_name, is_admin, content, image_url, text_size, created_at")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: true })
    .limit(500);

  if (error) return NextResponse.json({ error: "Impossible de charger les messages" }, { status: 500 });
  return NextResponse.json({ messages: data ?? [] });
}

// POST /api/community/messages — FormData { topic_id, content?, text_size?, image? }
export async function POST(req: NextRequest) {
  const gate = await getCommunityAccess();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { admin, user, isAdmin, authorName } = gate.access;

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const topicId = (form.get("topic_id") as string | null)?.trim();
  const content = ((form.get("content") as string | null) ?? "").trim();
  const image = form.get("image") as File | null;
  // Les tailles de texte sont réservées à l'admin ; un membre écrit toujours en "normal"
  const rawSize = (form.get("text_size") as string | null) ?? "normal";
  const textSize = isAdmin && (TEXT_SIZES as readonly string[]).includes(rawSize) ? rawSize : "normal";

  if (!topicId) return NextResponse.json({ error: "topic_id requis" }, { status: 400 });
  if (!content && !image) return NextResponse.json({ error: "Message vide" }, { status: 400 });
  if (content.length > 2000) return NextResponse.json({ error: "Message trop long (2000 caractères maximum)" }, { status: 400 });

  // La discussion existe-t-elle, et qui a le droit d'y écrire ?
  const { data: topic, error: topicErr } = await admin
    .from("community_topics")
    .select("id, admin_only")
    .eq("id", topicId)
    .single();
  if (topicErr || !topic) return NextResponse.json({ error: "Discussion introuvable" }, { status: 404 });
  if (topic.admin_only && !isAdmin) {
    return NextResponse.json({ error: "Seul l'administrateur peut écrire dans cette discussion" }, { status: 403 });
  }

  // Image jointe (optionnelle) — envoyée dans le bucket public existant
  let imageUrl: string | null = null;
  if (image) {
    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "Seules les images sont acceptées" }, { status: 400 });
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image trop lourde (5 Mo maximum)" }, { status: 400 });
    }
    const ext = image.type.split("/")[1]?.replace("jpeg", "jpg") || "png";
    const buffer = Buffer.from(await image.arrayBuffer());
    try {
      imageUrl = await uploadToStorage(
        admin,
        buffer,
        `community/${user.id}/${Date.now()}.${ext}`,
        image.type
      );
    } catch {
      return NextResponse.json({ error: "Échec de l'envoi de l'image" }, { status: 500 });
    }
  }

  const { data, error } = await admin
    .from("community_messages")
    .insert({
      topic_id: topicId,
      user_id: user.id,
      author_name: authorName,
      is_admin: isAdmin,
      content,
      image_url: imageUrl,
      text_size: textSize,
    })
    .select("id, topic_id, user_id, author_name, is_admin, content, image_url, text_size, created_at")
    .single();

  if (error) return NextResponse.json({ error: "Impossible d'envoyer le message" }, { status: 500 });
  return NextResponse.json({ message: data });
}
