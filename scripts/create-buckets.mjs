// Crée les buckets Supabase Storage attendus par l'application s'ils manquent :
//   - celebswap-images (public) : photos d'origine + résultats de génération
//   - celebrity-refs   (public) : images de référence des célébrités
// Usage : node scripts/create-buckets.mjs   (depuis la racine du projet,
// nécessite NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local)
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: buckets, error: listErr } = await admin.storage.listBuckets();
if (listErr) { console.error("listBuckets:", listErr.message); process.exit(1); }
console.log("Buckets existants :", buckets.map((b) => `${b.name}${b.public ? " (public)" : " (privé)"}`).join(", ") || "(aucun)");

for (const name of ["celebswap-images", "celebrity-refs"]) {
  const existing = buckets.find((b) => b.name === name);
  if (existing) {
    if (!existing.public) {
      const { error } = await admin.storage.updateBucket(name, { public: true });
      console.log(error ? `❌ ${name} : ${error.message}` : `✅ ${name} passé en public`);
    } else {
      console.log(`✅ ${name} existe déjà (public)`);
    }
    continue;
  }
  const { error } = await admin.storage.createBucket(name, { public: true });
  console.log(error ? `❌ ${name} : ${error.message}` : `✅ Bucket ${name} créé (public)`);
}
