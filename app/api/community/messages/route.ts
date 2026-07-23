import { NextRequest, NextResponse } from "next/server";
import { getCommunityAccess } from "@/lib/community";
import { uploadToStorage } from "@/lib/storage";
import { generateVirtualMessages, type VirtualMessage } from "@/lib/community-bots";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 Mo
const TEXT_SIZES = ["small", "normal", "large", "title"] as const;

// GET /api/community/messages?topic_id=... — les messages d'une discussion (ordre chronologique)
export async function GET(req: NextRequest) {
  const gate = await getCommunityAccess();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { admin, user } = gate.access;

  const topicId = req.nextUrl.searchParams.get("topic_id");
  if (!topicId) return NextResponse.json({ error: "topic_id requis" }, { status: 400 });

  // Titre + type de la discussion (pour l'animation automatique des espaces par défaut)
  const { data: topic } = await admin
    .from("community_topics")
    .select("title, is_default")
    .eq("id", topicId)
    .single();

  const { data, error } = await admin
    .from("community_messages")
    .select("id, topic_id, user_id, author_name, is_admin, content, image_url, text_size, created_at")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: true })
    .limit(500);

  if (error) return NextResponse.json({ error: "Impossible de charger les messages" }, { status: 500 });

  // Messages réels (base) → on complète avec les champs d'action (absents en base)
  const real: VirtualMessage[] = (data ?? []).map((m) => ({
    ...m,
    text_size: (m.text_size ?? "normal") as VirtualMessage["text_size"],
    action: null,
    action_key: null,
    action_amount: null,
    action_claimed: false,
  }));

  // Messages fictifs générés à la volée pour les espaces par défaut
  const virtual = topic
    ? generateVirtualMessages(topicId, topic.title as string, !!topic.is_default)
    : [];

  // Marque les cadeaux crédits déjà récupérés par ce membre (bouton désactivé)
  const giftKeys = virtual
    .filter((m) => m.action === "claim_credits" && m.action_key)
    .map((m) => m.action_key as string);
  if (giftKeys.length) {
    const { data: claims } = await admin
      .from("community_credit_claims")
      .select("claim_key")
      .eq("user_id", user.id)
      .in("claim_key", giftKeys);
    const claimed = new Set((claims ?? []).map((c) => c.claim_key as string));
    for (const m of virtual) {
      if (m.action_key && claimed.has(m.action_key)) m.action_claimed = true;
    }
  }

  const merged = [...virtual, ...real].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  // On garde les 500 derniers (les plus récents) en ordre chronologique
  const messages = merged.slice(-500);

  return NextResponse.json({ messages });
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
