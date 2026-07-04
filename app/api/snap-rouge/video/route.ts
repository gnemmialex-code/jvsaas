import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import { Readable } from "stream";
import path from "path";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase";

// Sert la vidéo de la technique Snap Rouge UNIQUEMENT aux acheteurs / abonnés Pro & Elite.
// Le fichier est stocké hors de /public (private-videos/) : impossible d'y accéder par URL directe.

const VIDEO_PATH = path.join(process.cwd(), "private-videos", "tuto-snap-rouge.mp4");

async function hasSnapRougeAccess(): Promise<boolean> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

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
    const { data: basic } = await admin
      .from("users")
      .select("plan_id")
      .eq("id", user.id)
      .single();
    if (basic?.plan_id) planId = basic.plan_id as string;
  }

  const p = planId.toLowerCase();
  return purchased || p.includes("pro") || p.includes("ultra") || p.includes("elite");
}

export async function GET(req: NextRequest) {
  if (!(await hasSnapRougeAccess())) {
    return NextResponse.json({ error: "Accès réservé — débloquez la technique Snap Rouge" }, { status: 403 });
  }

  let fileSize: number;
  try {
    fileSize = statSync(VIDEO_PATH).size;
  } catch {
    return NextResponse.json({ error: "Vidéo introuvable sur le serveur" }, { status: 404 });
  }

  const baseHeaders: Record<string, string> = {
    "Content-Type":  "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
  };

  // Support des requêtes Range (lecture progressive + navigation dans la vidéo)
  const range = req.headers.get("range");
  if (range) {
    const match = range.match(/bytes=(\d+)-(\d*)/);
    if (match) {
      const start = parseInt(match[1], 10);
      const end   = match[2] ? Math.min(parseInt(match[2], 10), fileSize - 1) : fileSize - 1;
      if (start >= fileSize || start > end) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        });
      }
      const stream = Readable.toWeb(createReadStream(VIDEO_PATH, { start, end })) as ReadableStream;
      return new Response(stream, {
        status: 206,
        headers: {
          ...baseHeaders,
          "Content-Range":  `bytes ${start}-${end}/${fileSize}`,
          "Content-Length": String(end - start + 1),
        },
      });
    }
  }

  const stream = Readable.toWeb(createReadStream(VIDEO_PATH)) as ReadableStream;
  return new Response(stream, {
    status: 200,
    headers: { ...baseHeaders, "Content-Length": String(fileSize) },
  });
}
