import { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "celebswap-images";

export async function uploadToStorage(
  supabase: SupabaseClient,
  buffer: Buffer,
  path: string,
  contentType: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: false,
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteFromStorage(
  supabase: SupabaseClient,
  paths: string[]
): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) {
    console.error("Storage delete failed:", error.message);
  }
}
