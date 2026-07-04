import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { CELEBRITY_DB } from "@/lib/celebrity-db";

const BUCKET = "celebrity-refs";
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif"]);

function isImageFile(name: string): boolean {
  return IMAGE_EXTENSIONS.has(name.split(".").pop()?.toLowerCase() ?? "");
}

// GET /api/admin/check-refs          → all celebrities
// GET /api/admin/check-refs?id=squeezie → one celebrity
export async function GET(req: NextRequest) {
  const admin   = createSupabaseAdmin();
  const idParam = new URL(req.url).searchParams.get("id");

  const targets = idParam
    ? CELEBRITY_DB.filter((c) => c.id === idParam)
    : CELEBRITY_DB;

  if (idParam && targets.length === 0) {
    return NextResponse.json({ error: `ID "${idParam}" not found in celebrity-db.ts` }, { status: 404 });
  }

  const results = await Promise.all(
    targets.map(async (celeb) => {
      const { data: files, error } = await admin.storage
        .from(BUCKET)
        .list(celeb.id, { limit: 20, sortBy: { column: "name", order: "asc" } });

      const imageFiles = (files ?? [])
        .filter((f) => isImageFile(f.name))
        .map((f) => {
          const { data } = admin.storage
            .from(BUCKET)
            .getPublicUrl(`${celeb.id}/${f.name}`);
          return { name: f.name, url: data?.publicUrl ?? "" };
        });

      return {
        id:          celeb.id,
        name:        celeb.name,
        folder:      `celebrity-refs/${celeb.id}/`,
        images_found: imageFiles.length,
        images:      imageFiles,
        status:      imageFiles.length > 0 ? "✅ OK" : "❌ Aucune image trouvée",
        error:       error?.message ?? null,
      };
    }),
  );

  const summary = {
    total:        results.length,
    with_images:  results.filter((r) => r.images_found > 0).length,
    missing:      results.filter((r) => r.images_found === 0).length,
  };

  return NextResponse.json({ summary, celebrities: results }, { status: 200 });
}
