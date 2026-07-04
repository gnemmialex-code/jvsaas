// Corrige les dossiers mal nommés du bucket celebrity-refs (déplace les fichiers vers le bon id)
// Usage: node scripts/fix-celebrity-refs.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(resolve(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = "celebrity-refs";

const RENAMES = {
  // Anciens correctifs
  "MASTU": "mastu",
  "eva-elfie": "eva-elfie-fr",
  "gaelle-garcie-diaz": "gaelle-garcia-diaz",
  "mayadorabme": "mayadorable",
  "violet-mayers": "violet-myers",

  // Dossiers existants en DB mais mal nommés (espaces/casse/typo)
  "pierre croce": "pierre-croce",
  "malenie-orl": "melanie-orl",

  // Acteurs cinéma français — display name → kebab-case id
  "Jean Dujardin": "jean-dujardin",
  "Jean Reno": "jean-reno",
  "Omar Sy": "omar-sy",
  "Dany Boon": "dany-boon",
  "Kad Merad": "kad-merad",
  "Guillaume Canet": "guillaume-canet",
  "Gilles Lellouche": "gilles-lellouche",
  "Francois Civil": "francois-civil",
  "Jonathan Cohen": "jonathan-cohen",
  "Tarek Boudali": "tarek-boudali",
  "Philippe Lacheau": "philippe-lacheau",
  "Pierre Niney": "pierre-niney",
  "Daniel Auteuil": "daniel-auteuil",
  "Andre Dussollier": "andre-dussollier",
  "Clovis Cornillac": "clovis-cornillac",
  "Edouard Baer": "edouard-baer",
  "Gerard Depardieu": "gerard-depardieu",
  "Alban Lennoir": "alban-lennoir",
  "Patrick Bruel": "patrick-bruel",

  // Acteurs Hollywood — display name → kebab-case id
  "Brad Pitt": "brad-pitt",
  "Ryan Gosling": "ryan-gosling",
  "Tom Cruise": "tom-cruise",
  "Keanu Reeves": "keanu-reeves",
  "Johnny Depp": "johnny-depp",
  "Will Smith": "will-smith",
  "Denzel Washington": "denzel-washington",
  "Morgan Freeman": "morgan-freeman",
  "Samuel L. Jackson": "samuel-l-jackson",
  "Robert De Niro": "robert-de-niro",
  "Al Pacino": "al-pacino",
  "Robert Downey Jr.": "robert-downey-jr",
  "Chris Evans": "chris-evans",
  "Chris Hemsworth": "chris-hemsworth",
  "Chris Pratt": "chris-pratt",
  "Chris Pine": "chris-pine",
  "Vin Diesel": "vin-diesel",
  "Tom Hardy": "tom-hardy",
  "Liam Neeson": "liam-neeson",
  "Sylvester Stallone": "sylvester-stallone",
  "Arnold Schwarzenegger": "arnold-schwarzenegger",
  "Mark Wahlberg": "mark-wahlberg",
  "Matt Damon": "matt-damon",
  "Ben Affleck": "ben-affleck",
  "George Clooney": "george-clooney",
  "Harrison Ford": "harrison-ford",
  "Ryan Reynolds": "ryan-reynolds",
  "Jake Gyllenhaal": "jake-gyllenhaal",
  "Joaquin Phoenix": "joaquin-phoenix",
  "Cillian Murphy": "cillian-murphy",
  "Christian Bale": "christian-bale",
  "Daniel Craig": "daniel-craig",
  "Hugh Jackman": "hugh-jackman",
  "Benedict Cumberbatch": "benedict-cumberbatch",
  "tom hiddleston": "tom-hiddleston",
  "Jeremy Renner": "jeremy-renner",
  "Idris Elba": "idris-elba",
  "Michael B. Jordan": "michael-b-jordan",
  "Gary Oldman": "gary-oldman",
  "Colin Farrell": "colin-farrell",
  "Adam Driver": "adam-driver",
  "Timothee Chalamet": "timothee-chalamet",
  "Robert Pattinson": "robert-pattinson",
  "Andrew Garfiled": "andrew-garfield",   // typo dans le dossier uploadé
  "Tobey Maguire": "tobey-maguire",
  "Daniel Radcliffe": "daniel-radcliffe",
  "Jackie Chan": "jackie-chan",
  "Willem Dafoe": "willem-dafoe",

  // Dossiers avec format partiellement correct mais à corriger
  "jason-statam": "jason-statham",         // typo
  "leonardo_dicaprio": "leonardo-dicaprio", // underscores → tirets

  // ── MONTRES DE LUXE — renommage display name → kebab-case id ──────────────
  // Cartier
  "Ballon Bleu":          "ballon-bleu",
  "Panthere":             "panthere",
  "Santos":               "santos",
  "Tank":                 "tank",
  // IWC
  "Big Pilot":            "big-pilot",
  "Portugieser Chrono":   "portugieser-chrono",
  // TAG Heuer
  "Carrera":              "carrera",
  "Monaco":               "monaco",
  // Tudor
  "Black Bay 58":         "black-bay-58",
  // Omega
  "Speedmaster Moonwatch":  "speedmaster-moonwatch",
  "Seamaster Diver 300M":   "seamaster-diver-300m",
  "Seamaster Planet Ocean": "seamaster-planet-ocean",
  "Constellation":          "constellation",
  "De Ville Tresor":        "de-ville-tresor",
  // Rolex
  "Air-King":             "air-king",
  "Cosmograph Daytona":   "cosmograph-daytona",
  "Datejust 41":          "datejust-41",
  "Day-Date President":   "day-date-president",
  "Explorer II":          "explorer-ii",
  "GMT-Master II Batman": "gmt-master-ii-batman",
  "GMT-Master II Pepsi":  "gmt-master-ii-pepsi",
  "Milgauss":             "milgauss",
  "Oyster Perpetual":     "oyster-perpetual",
  "Sea-Dweller":          "sea-dweller",
  "Submariner Date":      "submariner-date",
  "Submariner Hulk":      "submariner-hulk",
  "Yacht-Master 40":      "yacht-master-40",
  // Audemars Piguet
  "Code 11.59 Chrono":    "code-1159-chrono",
  "Royal Oak Jumbo":      "royal-oak-jumbo",
  "Royal Oak":            "royal-oak",
  // Hublot
  "Big Bang Unico":       "big-bang-unico",
  "Big Bang":             "big-bang",
  "Classic Fusion":       "classic-fusion",
  "Spirit of Big Bang":   "spirit-of-big-bang",
  // Patek Philippe
  "Aquanaut":                    "aquanaut",
  "Calatrava":                   "calatrava",
  "Nautilus Chrono":             "nautilus-chrono",
  "Nautilus":                    "nautilus",
  "Quantieme Perpetuel Chrono":  "quantieme-perpetuel-chrono",
  "Twenty 4":                    "twenty-4",
  // Richard Mille
  "MP-05 LaFerrari":       "mp-05-laferrari",
  "RM 011 Felipe Massa":   "rm-011-felipe-massa",
  "RM 027 Tourbillon Nadal": "rm-027-tourbillon-nadal",
  "RM 035 Rafael Nadal":   "rm-035-rafael-nadal",
  "RM 055 Bubba Watson":   "rm-055-bubba-watson",
  "RM 67-01 Extra Flat":   "rm-67-01-extra-flat",
};

let renamed = 0;
let skipped = 0;
let errors = 0;

for (const [from, to] of Object.entries(RENAMES)) {
  const { data: files, error } = await admin.storage.from(BUCKET).list(from, { limit: 100 });
  if (error) { console.error(`❌ list "${from}":`, error.message); errors++; continue; }
  if (!files || !files.length) { console.log(`⏭  "${from}" — dossier absent ou vide`); skipped++; continue; }

  const imageFiles = files.filter((f) => f.metadata !== null);
  if (!imageFiles.length) { console.log(`⏭  "${from}" — aucun fichier à déplacer`); skipped++; continue; }

  console.log(`\n🔄 "${from}" → "${to}" (${imageFiles.length} fichiers)`);
  for (const f of imageFiles) {
    const { error: mvErr } = await admin.storage.from(BUCKET).move(`${from}/${f.name}`, `${to}/${f.name}`);
    if (mvErr) { console.error(`  ❌ ${f.name}: ${mvErr.message}`); errors++; }
    else { console.log(`  ✅ ${f.name}`); renamed++; }
  }
}

console.log(`\n──────── TERMINÉ ────────`);
console.log(`✅ ${renamed} fichier(s) déplacé(s)`);
if (skipped) console.log(`⏭  ${skipped} dossier(s) ignoré(s) (absent ou déjà correct)`);
if (errors)  console.log(`❌ ${errors} erreur(s) — relancez pour réessayer`);
console.log(`\nRelancez scripts/audit-celebrity-refs.mjs pour vérifier.`);
