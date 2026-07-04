import { createSupabaseAdmin } from "@/lib/supabase";

// État du script maître de génération (activable/désactivable par l'admin
// pour tester avec et sans). Persisté dans un petit fichier JSON du bucket
// Storage existant — aucune migration SQL nécessaire. Par défaut : ACTIVÉ.
const BUCKET = "celebswap-images";
const PATH   = "config/generation-settings.json";

// Cache mémoire 30 s : évite un appel Storage à chaque génération.
let cache: { value: boolean; at: number } | null = null;
const CACHE_TTL_MS = 30_000;

export async function isMasterScriptEnabled(): Promise<boolean> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;
  try {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin.storage.from(BUCKET).download(PATH);
    if (error || !data) {
      // Fichier absent (jamais togglé) → comportement par défaut : activé.
      cache = { value: true, at: Date.now() };
      return true;
    }
    const json = JSON.parse(await data.text()) as { master_script_enabled?: boolean };
    const value = json.master_script_enabled !== false;
    cache = { value, at: Date.now() };
    return value;
  } catch {
    return true; // en cas de doute, on garde la couche de fiabilité
  }
}

export async function setMasterScriptEnabled(enabled: boolean): Promise<void> {
  const admin = createSupabaseAdmin();
  const body = Buffer.from(
    JSON.stringify({ master_script_enabled: enabled, updated_at: new Date().toISOString() }),
  );
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(PATH, body, { upsert: true, contentType: "application/json" });
  if (error) throw new Error(error.message);
  cache = { value: enabled, at: Date.now() };
}
