// Audit: compare le bucket Supabase celebrity-refs avec lib/celebrity-db.ts
// Usage: node scripts/audit-celebrity-refs.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Charge .env.local
for (const line of readFileSync(resolve(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Variables Supabase manquantes dans .env.local"); process.exit(1); }

const admin = createClient(url, key);
const BUCKET = "celebrity-refs";
const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif"]);
const isImage = (n) => IMAGE_EXT.has(n.split(".").pop()?.toLowerCase() ?? "");

// Extrait les ids de CELEBRITY_DB depuis le fichier TS (regex sur `id: "..."`)
const dbSource = readFileSync(resolve(root, "lib", "celebrity-db.ts"), "utf8");
const celebIds = [...dbSource.matchAll(/^\s*id:\s*"([^"]+)"/gm)].map((m) => m[1]);
const celebIdSet = new Set(celebIds);
console.log(`celebrity-db.ts : ${celebIds.length} célébrités\n`);

// 1. Vérifie le nom exact du bucket
const { data: buckets, error: bErr } = await admin.storage.listBuckets();
if (bErr) { console.error("Erreur listBuckets:", bErr.message); process.exit(1); }
console.log("Buckets existants :", buckets.map((b) => `${b.name}${b.public ? " (public)" : " (privé)"}`).join(", "));
const exact = buckets.find((b) => b.name === BUCKET);
const caseVariant = buckets.find((b) => b.name.toLowerCase() === BUCKET && b.name !== BUCKET);
if (!exact && caseVariant) {
  console.log(`\n⚠️ PROBLÈME DE CASSE : le code utilise "${BUCKET}" mais le bucket s'appelle "${caseVariant.name}"`);
}
if (!exact && !caseVariant) { console.log(`\n❌ Aucun bucket nommé "${BUCKET}"`); process.exit(1); }
const bucketName = exact ? BUCKET : caseVariant.name;

// 2. Liste les dossiers racine du bucket (pagination)
const folders = [];
let offset = 0;
for (;;) {
  const { data, error } = await admin.storage.from(bucketName).list("", { limit: 100, offset });
  if (error) { console.error("Erreur list racine:", error.message); process.exit(1); }
  folders.push(...data);
  if (data.length < 100) break;
  offset += 100;
}
const folderNames = folders.filter((f) => f.id === null || f.metadata === null).map((f) => f.name);
const rootFiles = folders.filter((f) => f.metadata !== null).map((f) => f.name);
console.log(`\nBucket "${bucketName}" : ${folderNames.length} dossiers, ${rootFiles.length} fichiers à la racine`);
if (rootFiles.length) console.log("  Fichiers à la racine (jamais utilisés par le site) :", rootFiles.join(", "));

// 3. Compte les images de chaque dossier
const folderImages = new Map();
const queue = [...folderNames];
const CONCURRENCY = 10;
async function worker() {
  for (;;) {
    const name = queue.shift();
    if (name === undefined) return;
    const { data, error } = await admin.storage.from(bucketName).list(name, { limit: 100 });
    if (error) { folderImages.set(name, { error: error.message, images: 0, nonImages: [] }); continue; }
    const images = data.filter((f) => isImage(f.name));
    const nonImages = data.filter((f) => f.metadata !== null && !isImage(f.name)).map((f) => f.name);
    folderImages.set(name, { images: images.length, nonImages });
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

// 4. Rapports croisés
const orphans = folderNames.filter((n) => !celebIdSet.has(n));
const caseOrphans = orphans.filter((n) => celebIdSet.has(n.toLowerCase()) || celebIds.some((id) => id.toLowerCase() === n.toLowerCase()));
const trueOrphans = orphans.filter((n) => !caseOrphans.includes(n));
const missing = celebIds.filter((id) => !folderNames.includes(id));
const empty = folderNames.filter((n) => celebIdSet.has(n) && folderImages.get(n)?.images === 0);

console.log("\n──────── RÉSULTAT ────────");
console.log(`✅ Célébrités avec dossier + images : ${celebIds.filter((id) => (folderImages.get(id)?.images ?? 0) > 0).length}/${celebIds.length}`);

if (caseOrphans.length) {
  console.log(`\n⚠️ DOSSIERS AVEC MAUVAISE CASSE (le site ne les voit PAS — list() est sensible à la casse) : ${caseOrphans.length}`);
  for (const n of caseOrphans) console.log(`  - "${n}" → devrait être "${celebIds.find((id) => id.toLowerCase() === n.toLowerCase())}"`);
}
if (trueOrphans.length) {
  console.log(`\n⚠️ DOSSIERS ORPHELINS (aucun id correspondant dans celebrity-db.ts — photos jamais utilisées) : ${trueOrphans.length}`);
  for (const n of trueOrphans) console.log(`  - ${n} (${folderImages.get(n)?.images ?? 0} images)`);
}
if (empty.length) {
  console.log(`\n⚠️ DOSSIERS EXISTANTS MAIS SANS IMAGE VALIDE : ${empty.length}`);
  for (const n of empty) {
    const info = folderImages.get(n);
    console.log(`  - ${n}${info?.nonImages?.length ? ` (fichiers ignorés : ${info.nonImages.join(", ")})` : ""}`);
  }
}
if (missing.length) {
  console.log(`\n❌ CÉLÉBRITÉS SANS DOSSIER DANS LE BUCKET (génération basée uniquement sur la description texte) : ${missing.length}`);
  for (const id of missing) console.log(`  - ${id}`);
}

// Fichiers non-image dans des dossiers valides
const withJunk = folderNames.filter((n) => celebIdSet.has(n) && folderImages.get(n)?.nonImages?.length);
if (withJunk.length) {
  console.log(`\nℹ️ Fichiers non-image ignorés dans des dossiers valides :`);
  for (const n of withJunk) console.log(`  - ${n}: ${folderImages.get(n).nonImages.join(", ")}`);
}
