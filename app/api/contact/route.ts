import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { uploadToStorage } from "@/lib/storage";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const email     = (formData.get("email")      as string | null)?.trim();
  const firstName = (formData.get("first_name") as string | null)?.trim();
  const subject   = (formData.get("subject")    as string | null)?.trim();
  const message   = (formData.get("message")    as string | null)?.trim();
  const imageFile = formData.get("image") as File | null;

  if (!email || !firstName || !subject || !message) {
    return NextResponse.json({ error: "Tous les champs obligatoires doivent être remplis" }, { status: 400 });
  }

  // Get logged-in user id if any
  const supabaseAuth = await createSupabaseServer();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  // Upload optional image using admin client
  const admin = createSupabaseAdmin();
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    if (imageFile.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image trop lourde (max 5 Mo)" }, { status: 400 });
    }
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const ext    = imageFile.name.split(".").pop() ?? "jpg";
      const path   = `contact/${randomId()}.${ext}`;
      imageUrl = await uploadToStorage(admin, buffer, path, imageFile.type);
    } catch {
      // Image upload failed — continue without it
    }
  }

  const { error: dbError } = await admin.from("contact_messages").insert({
    email,
    first_name: firstName,
    subject,
    message,
    image_url:  imageUrl,
    user_id:    user?.id ?? null,
  });

  if (dbError) {
    console.error("[Contact] DB insert error:", dbError.message);
    return NextResponse.json({ error: "Erreur lors de l'envoi du message" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
