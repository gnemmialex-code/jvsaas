// Synchronise les nouvelles montres de luxe entre Supabase Storage, la table
// `celebrities` et lib/celebrity-db.ts (la seule source lue par le site).
//
//   node scripts/sync-supabase.mjs emit    → imprime le bloc TS à coller dans celebrity-db.ts
//   node scripts/sync-supabase.mjs folders → renomme les dossiers du bucket en ids kebab + nettoie la racine
//   node scripts/sync-supabase.mjs table   → reconstruit la table `celebrities` en miroir de CELEBRITY_DB
//   node scripts/sync-supabase.mjs all     → folders puis table
//
// Chaque dossier du bucket celebrity-refs est renommé vers kebab(folder) = l'id
// utilisé dans le fichier, pour que getCelebRefImages(id) retrouve les photos.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(resolve(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const BUCKET = "celebrity-refs";

const kebab = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/['".]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// folder      = nom EXACT du dossier dans le bucket (avant renommage)
// name        = nom d'affichage (corrigé des soucis d'encodage)
// brand / nat / desc
const WATCHES = [
  // ── AUDEMARS PIGUET (Suisse) ──
  ["Royal Oak Concept", "Royal Oak Concept", "Audemars Piguet", "ch",
    "Audemars Piguet Royal Oak Concept. Avant-garde sports watch, large ~44mm octagonal tonneau-influenced case in titanium, ceramic or carbon, exposed skeletonized tourbillon movement, openworked dial with 'AP' bridge, rubber strap. Futuristic and ultra-technical."],
  ["Royal Oak Frosted Gold", "Royal Oak Frosted Gold", "Audemars Piguet", "ch",
    "Audemars Piguet Royal Oak Frosted Gold ref 15454. 37 or 41mm 18k gold with hammered Florentine 'frosted' finish giving a sparkling diamond-dust texture, signature octagonal bezel with eight hexagonal screws, blue or silver 'Grande Tapisserie' dial, integrated gold bracelet."],
  ["Royal Oak Offshore Diver", "Royal Oak Offshore Diver", "Audemars Piguet", "ch",
    "Audemars Piguet Royal Oak Offshore Diver ref 15720. 42mm steel, oversized octagonal bezel, inner rotating diver's bezel set by a crown at 10, 'Méga Tapisserie' dial (blue, black or colored), rubber strap. Robust sporty diver, 300m."],
  ["Royal Oak Perpetual Calendar", "Royal Oak Perpetual Calendar", "Audemars Piguet", "ch",
    "Audemars Piguet Royal Oak Perpetual Calendar ref 26574. 41mm steel or gold, octagonal bezel with eight screws, blue 'Grande Tapisserie' dial with sub-dials for day, date, month, moonphase, leap-year and week, integrated bracelet. Grand complication in iconic Royal Oak form."],

  // ── CARTIER (France) ──
  ["Baignoire", "Baignoire", "Cartier", "fr",
    "Cartier Baignoire. Elongated oval 'bathtub'-shaped case in 18k gold, slim elegant dress watch, white lacquer dial with black Roman numerals, blue sword hands, leather strap. A 1912 design icon, pure curved minimalism."],
  ["Ballon Bleu Or Rose", "Ballon Bleu Or Rose", "Cartier", "fr",
    "Cartier Ballon Bleu in rose gold. Round domed case with a blue sapphire cabochon crown protected by an arc of metal, silver guilloché dial, Roman numerals, blue steel sword hands, rose-gold bracelet or strap. Soft balloon-like profile."],
  ["Cle de Cartier", "Clé de Cartier", "Cartier", "fr",
    "Cartier Clé de Cartier. Rounded case with a distinctive key-shaped winding crown set with a blue sapphire, silver flinqué dial, Roman numerals, blue sword hands, sleek polished case. Modern elegant unisex line."],
  ["Pasha Chronograph", "Pasha Chronograph", "Cartier", "fr",
    "Cartier Pasha de Cartier Chronograph. Round case with a prominent fluted screw-down crown cover on a chain, clous-de-Paris detailing, white dial with Arabic numerals and chronograph counters, steel bracelet. Bold distinctive design."],
  ["Ronde Louis Cartier", "Ronde Louis Cartier", "Cartier", "fr",
    "Cartier Ronde Louis Cartier. Slim round dress watch in 18k gold or steel, pure round case, white dial with black Roman numerals, railway minute track, blue sword hands, beaded crown with sapphire, leather strap. Understated elegance."],
  ["Santos Skeleton Noire", "Santos Skeleton Noire", "Cartier", "fr",
    "Cartier Santos de Cartier Skeleton 'Noire'. Square case with rounded corners, exposed skeletonized movement whose bridges form Roman numerals, black ADLC-coated steel, visible gears, integrated bracelet with SmartLink. Stealthy industrial-chic."],
  ["Santos-Dumont", "Santos-Dumont", "Cartier", "fr",
    "Cartier Santos-Dumont. Flat slim square case, thin bezel with eight exposed screws, white or champagne dial, black Roman numerals, blue sword hands, leather strap. The original 1904 aviator's watch, refined and very thin."],
  ["Tank AmEricaine XL", "Tank Américaine XL", "Cartier", "fr",
    "Cartier Tank Américaine XL. Elongated curved rectangular case in 18k gold or steel, vertical brancards, silver dial with black Roman numerals, secret signature, blue sword hands, leather strap. Larger, curvier Tank variant."],
  ["Tank Cintree", "Tank Cintrée", "Cartier", "fr",
    "Cartier Tank Cintrée. Long narrow curved rectangular case hugging the wrist, 18k gold, silvered dial with elongated Roman numerals, blue sword hands, leather strap. The most elegant and rare elongated Tank, a 1921 design."],
  ["Tank Francaise", "Tank Française", "Cartier", "fr",
    "Cartier Tank Française. Rectangular case with rounded brancards integrated into a links bracelet, steel or gold, silver dial with black Roman numerals, secret signature, blue sword hands. Sporty-chic integrated-bracelet Tank."],

  // ── HUBLOT (Suisse) ──
  ["Big Bang Ferrari", "Big Bang Ferrari", "Hublot", "ch",
    "Hublot Big Bang Ferrari. 45mm round case in titanium, King Gold or carbon, prominent exposed H-screws on the bezel, skeletonized dial with Ferrari-inspired flange, integrated chronograph, rubber strap. Bold sports-car aesthetic."],
  ["Big Bang Integral Ceramic", "Big Bang Integral Ceramic", "Hublot", "ch",
    "Hublot Big Bang Integral in ceramic. 42mm fully-ceramic case and integrated ceramic bracelet (black, blue or grey), signature porthole bezel with H-shaped titanium screws, skeletonized chronograph dial. Monochrome integrated-bracelet evolution."],
  ["Big Bang King Power", "Big Bang King Power", "Hublot", "ch",
    "Hublot Big Bang King Power. Oversized ~48mm bold case, thick bezel with six H-screws, carbon, ceramic or titanium, deeply skeletonized chronograph dial, rubber strap. Massive aggressive limited-edition chronograph."],
  ["Big Bang Meca?10", "Big Bang Meca-10", "Hublot", "ch",
    "Hublot Big Bang Meca-10. 45mm case in titanium, ceramic or Magic Gold, exposed rack-and-pinion manual movement inspired by Meccano toys, 10-day power-reserve indicator, skeletonized architectural dial, rubber strap."],
  ["Big Bang Tourbillon", "Big Bang Tourbillon", "Hublot", "ch",
    "Hublot Big Bang Tourbillon. 44mm case, sapphire or skeletonized dial revealing a flying tourbillon at 6, signature porthole bezel with H-screws, titanium, ceramic or sapphire, rubber strap. High-complication Big Bang."],
  ["Classic Fusion Blue Titanium", "Classic Fusion Blue Titanium", "Hublot", "ch",
    "Hublot Classic Fusion Titanium with blue dial. Slim 42-45mm round titanium case, polished porthole bezel with six H-screws, sunburst blue dial, applied indices, rubber strap. The most elegant, understated Hublot."],
  ["Classic Fusion Orlinski", "Classic Fusion Orlinski", "Hublot", "ch",
    "Hublot Classic Fusion Orlinski. Faceted sculpted angular case and bezel designed by artist Richard Orlinski, mirror-polished ceramic or titanium (often colorful), faceted dial, rubber strap. Sculptural art-object watch."],
  ["MP 07", "MP-07", "Hublot", "ch",
    "Hublot MP-07. Horizontal tonneau case under sapphire crystal, exposed elongated movement with 40-day power reserve, vertically displayed tourbillon and time, futuristic technical architecture, rubber strap. Avant-garde Masterpiece."],
  ["MP 09 Tourbillon Bi Axis", "MP-09 Tourbillon Bi-Axis", "Hublot", "ch",
    "Hublot MP-09 Tourbillon Bi-Axis. Tall domed sapphire crystal over a dramatic bi-axial tourbillon, titanium or King Gold case, openworked dial, exposed complex movement, rubber strap. Spectacular kinetic Masterpiece."],
  ["Spirit of Big Bang Sapphire", "Spirit of Big Bang Sapphire", "Hublot", "ch",
    "Hublot Spirit of Big Bang Sapphire. Tonneau (barrel) case machined entirely from transparent sapphire crystal, skeletonized chronograph movement fully visible floating inside, clear or tinted, rubber strap. Transparent see-through marvel."],

  // ── PATEK PHILIPPE (Suisse) ──
  ["Aquanaut Chronograph 5968A", "Aquanaut Chronograph 5968A", "Patek Philippe", "ch",
    "Patek Philippe Aquanaut Chronograph ref 5968A. 42.2mm steel, rounded-octagonal case, embossed black or 'tropical' colored dial with relief grid pattern, flyback chronograph, orange accents, integrated composite 'Tropical' rubber strap."],
  ["Calatrava Pilot 5524", "Calatrava Pilot 5524", "Patek Philippe", "ch",
    "Patek Philippe Calatrava Pilot Travel Time ref 5524. 42mm white or rose gold, vintage aviator style, blue lacquered dial with luminous Arabic numerals and syringe hands, dual time-zone pushers, day/night and date indicators, calfskin strap."],
  ["Golden Ellipse", "Golden Ellipse", "Patek Philippe", "ch",
    "Patek Philippe Golden Ellipse ref 5738. Elliptical case based on the golden ratio, 18k gold, ebony-black blue-gold sunburst dial, slim gold baton markers and hands, leather strap. A pure 1968 minimalist icon."],
  ["Grandmaster Chime", "Grandmaster Chime", "Patek Philippe", "ch",
    "Patek Philippe Grandmaster Chime ref 6300. Massive reversible double-face gold case, 20 complications including grande and petite sonnerie and minute repeater, two dials (time on one, calendar on the other). Patek's most complicated wristwatch."],
  ["World Time 5230", "World Time 5230", "Patek Philippe", "ch",
    "Patek Philippe World Time ref 5230. 38.5mm gold, hand-guilloché central dial, rotating 24-hour and city rings covering 24 time zones, blue or rose-gold tones, leather strap. The reference elegant world-timer."],

  // ── RICHARD MILLE (Suisse) ──
  ["RM 016", "RM 016", "Richard Mille", "ch",
    "Richard Mille RM 016. Ultra-thin rectangular tonneau case in titanium, gold or carbon, skeletonized automatic movement with variable-geometry rotor, exposed baseplate, rubber strap. Flat technical everyday RM."],
  ["RM 030", "RM 030", "Richard Mille", "ch",
    "Richard Mille RM 030. Tonneau case in titanium, gold or NTPT carbon, skeletonized automatic movement with a declutchable rotor (engage/disengage indicator), date, exposed grade-5 titanium baseplate, rubber strap."],
  ["RM 037", "RM 037", "Richard Mille", "ch",
    "Richard Mille RM 037. Feminine tonneau case, often diamond-set, in Carbon TPT, gold or colorful Quartz TPT, skeletonized automatic movement, signature push-button crown, rubber strap. Ladies' RM."],
  ["RM 07 02 Pink Lady", "RM 07-02 Pink Lady", "Richard Mille", "ch",
    "Richard Mille RM 07-02 'Pink Lady Sapphire'. Tonneau case carved from solid pink sapphire crystal, translucent rose tint, skeletonized automatic movement floating inside, gem-set, rubber strap. Spectacular translucent ladies' piece."],
  ["RM 11 05 GMT", "RM 11-05 GMT", "Richard Mille", "ch",
    "Richard Mille RM 11-05 GMT Flyback Chronograph. Tonneau case in grey Cermet and titanium, skeletonized flyback chronograph with GMT, annual calendar and 60-minute countdown, rubber strap. Racing-inspired automatic chronograph."],
  ["RM 33 02", "RM 33-02", "Richard Mille", "ch",
    "Richard Mille RM 33-02 Automatic. Round (not tonneau) ultra-thin case in gold or Carbon TPT and titanium, extra-flat skeletonized automatic movement, off-centered crown, leather or rubber strap. RM's dressier round model."],
  ["RM 50 03 McLaren", "RM 50-03 McLaren", "Richard Mille", "ch",
    "Richard Mille RM 50-03 McLaren F1. Ultralight tonneau case in Graph TPT (graphene) and Carbon TPT, split-seconds tourbillon chronograph, exposed movement, McLaren orange accents, rubber strap. Record-light hypercar watch under 40g."],
  ["RM 52 05 Pharrell", "RM 52-05 Pharrell", "Richard Mille", "ch",
    "Richard Mille RM 52-05 Tourbillon Pharrell Williams. Tonneau case, dial depicting an astronaut helmet against a Martian landscape in 3D, manual tourbillon, Cermet and titanium, rubber strap. Space-themed art collaboration."],
  ["RM 61 01 Yohan Blake", "RM 61-01 Yohan Blake", "Richard Mille", "ch",
    "Richard Mille RM 61-01 Yohan Blake. Tonneau case in green and black Quartz TPT and Carbon TPT, skeletonized automatic movement, sprinter-inspired green-and-yellow Jamaican accents, rubber strap. Athlete signature model."],
  ["RM 62 01", "RM 62-01", "Richard Mille", "ch",
    "Richard Mille RM 62-01 Tourbillon Vibrating Alarm ACJ. Complex tonneau case, tourbillon with a silent vibrating alarm for travelers, UTC second time zone, titanium, exposed movement, rubber strap. Co-developed with Airbus Corporate Jets."],

  // ── ROLEX (Suisse) ──
  ["Cellini Moonphase", "Cellini Moonphase", "Rolex", "ch",
    "Rolex Cellini Moonphase ref 50535. 39mm Everose gold, round dress case with double bezel, white lacquer dial, blue enamel moonphase disc at 6 with a meteorite full moon, date around the rim, leather strap. Rolex's most romantic dress watch."],
  ["Datejust 36 Palm", "Datejust 36 Palm", "Rolex", "ch",
    "Rolex Datejust 36 'Palm' ref 126234. 36mm steel with white-gold fluted bezel, olive-green dial with a tropical palm-leaf motif, date at 3 with cyclops, Jubilee or Oyster bracelet. Playful 2021 motif dial."],
  ["Day Date 40 Platine Ice Blue", "Day-Date 40 Platinum Ice Blue", "Rolex", "ch",
    "Rolex Day-Date 40 ref 228206 in 950 platinum with ice-blue dial. 40mm platinum, smooth or fluted bezel, the platinum-exclusive ice-blue dial, day spelled at 12 and date at 3, President bracelet. The ultimate prestige Day-Date."],
  ["Deepsea James Cameron", "Deepsea James Cameron", "Rolex", "ch",
    "Rolex Deepsea Sea-Dweller 'James Cameron' ref 126660. 44mm steel, D-blue gradient dial fading blue-to-black (Mariana Trench tribute), unidirectional black ceramic bezel, helium escape valve, Oyster bracelet. Water-resistant to 3900m."],
  ["Explorer I 36", "Explorer I 36", "Rolex", "ch",
    "Rolex Explorer ref 124270. 36mm stainless steel, smooth bezel, matte black dial with luminous 3-6-9 Arabic numerals and baton markers, no date, Oyster bracelet. The pure tool-watch born from Everest 1953."],
  ["GMT Master II Root Beer", "GMT-Master II Root Beer", "Rolex", "ch",
    "Rolex GMT-Master II 'Root Beer' ref 126711CHNR. 40mm Everose Rolesor (steel and rose gold), brown and black ceramic bezel, black dial, rose-gold 24h hand, date at 3, Jubilee or Oyster bracelet. Warm two-tone pilot's GMT."],
  ["Oyster Perpetual 41 Turquoise", "Oyster Perpetual 41 Turquoise", "Rolex", "ch",
    "Rolex Oyster Perpetual 41 ref 124300 with turquoise dial. 41mm steel, smooth polished bezel, vivid turquoise lacquer dial, no date, Oyster bracelet. The coveted candy-color OP."],
  ["Pearlmaster", "Pearlmaster", "Rolex", "ch",
    "Rolex Pearlmaster (Datejust Pearlmaster). 34-39mm 18k gold, often a gem-set diamond bezel, mother-of-pearl or pavé dial, date at 3, distinctive rounded five-piece-link Pearlmaster bracelet. Rolex's most jeweled line."],
  ["Sea Dweller Deepsea D?Blue", "Sea-Dweller Deepsea D-Blue", "Rolex", "ch",
    "Rolex Deepsea D-Blue ref 126660. 44mm steel, gradient blue-to-black 'D-blue' dial (Deepsea Challenge tribute), unidirectional black ceramic 60-minute bezel, helium escape valve at 9, Oyster bracelet. Professional saturation diver, 3900m."],
  ["Yacht Master II", "Yacht-Master II", "Rolex", "ch",
    "Rolex Yacht-Master II ref 116680. 44mm steel, white dial, blue Cerachrom rotating bezel, prominent programmable regatta countdown chronograph (1-10 min) with red triangle and blue arc, Oyster bracelet. Large nautical regatta timer."],
];

function entries() {
  return WATCHES.map(([folder, name, brand, nat, desc]) => {
    const id = kebab(folder);
    const nl = name.toLowerCase();
    const bl = brand.toLowerCase();
    const aliases = [...new Set([nl, `${bl} ${nl}`, bl + " " + nl.replace(/-/g, " ")])];
    return { folder, id, name, brand, nat, desc, aliases };
  });
}

function emit() {
  let out = "\n  // ──────────────────────────────────────────────────────────────────────────\n";
  out += "  // MONTRES DE LUXE — AJOUTS (variantes Storage celebrity-refs)\n";
  out += "  // ──────────────────────────────────────────────────────────────────────────\n\n";
  let brand = "";
  for (const e of entries()) {
    if (e.brand !== brand) { out += `  // ${e.brand.toUpperCase()}\n`; brand = e.brand; }
    out += "  {\n";
    out += `    id: ${JSON.stringify(e.id)},\n`;
    out += `    name: ${JSON.stringify(e.name)},\n`;
    out += `    aliases: ${JSON.stringify(e.aliases)},\n`;
    out += `    gender: "group",\n`;
    out += `    category: "luxury_watch",\n`;
    out += `    nationality: ${JSON.stringify(e.nat)},\n`;
    out += `    visual_description:\n      ${JSON.stringify(e.desc)},\n`;
    out += "  },\n";
  }
  process.stdout.write(out);
}

const IMG = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif"]);
async function renameFolders() {
  for (const e of entries()) {
    if (e.folder === e.id) { console.log(`= ${e.id} (déjà aligné)`); continue; }
    const { data: files, error } = await admin.storage.from(BUCKET).list(e.folder, { limit: 100 });
    if (error) { console.log(`✗ list "${e.folder}": ${error.message}`); continue; }
    const imgs = (files ?? []).filter((f) => f.metadata !== null);
    if (imgs.length === 0) { console.log(`✗ "${e.folder}" vide ou introuvable`); continue; }
    let moved = 0;
    for (const f of imgs) {
      const from = `${e.folder}/${f.name}`;
      const to = `${e.id}/${f.name}`;
      const { error: mErr } = await admin.storage.from(BUCKET).move(from, to);
      if (mErr) console.log(`  ✗ move ${from}: ${mErr.message}`);
      else moved++;
    }
    console.log(`✓ "${e.folder}" → ${e.id}/ (${moved}/${imgs.length} fichiers)`);
  }
  // Nettoyage des fichiers 0 octet à la racine
  const { data: rootList } = await admin.storage.from(BUCKET).list("", { limit: 300 });
  const junk = (rootList ?? []).filter((f) => f.metadata !== null).map((f) => f.name);
  if (junk.length) {
    const { error } = await admin.storage.from(BUCKET).remove(junk);
    console.log(error ? `✗ remove racine: ${error.message}` : `✓ supprimé ${junk.length} fichier(s) racine: ${junk.join(", ")}`);
  }
}

// Reconstruit la table `celebrities` comme miroir exact de CELEBRITY_DB.
async function mirrorTable() {
  const src = readFileSync(resolve(root, "lib", "celebrity-db.ts"), "utf8");
  // Parse chaque objet { id, name, aliases, gender, category, nationality, visual_description }
  const blockMatch = src.match(/export const CELEBRITY_DB[^=]*=\s*\[([\s\S]*?)\n\];/);
  if (!blockMatch) { console.error("Impossible de parser CELEBRITY_DB"); process.exit(1); }
  const objs = [...blockMatch[1].matchAll(/\{\s*id:\s*"([^"]+)",[\s\S]*?\}/g)];
  // Re-parse proprement champ par champ
  const rows = [];
  const re = /id:\s*"([^"]+)",\s*\n\s*name:\s*"((?:[^"\\]|\\.)*)",\s*\n\s*aliases:\s*(\[[^\]]*\]),\s*\n\s*gender:\s*"([^"]+)",\s*\n\s*category:\s*"([^"]+)",\s*\n\s*nationality:\s*"([^"]+)",\s*\n(?:(?!\s*id:\s*")[\s\S])*?visual_description:\s*\n?\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    rows.push({
      id: m[1],
      name: JSON.parse(`"${m[2]}"`),
      aliases: JSON.parse(m[3]),
      gender: m[4],
      category: m[5],
      nationality: m[6],
      visual_description: JSON.parse(`"${m[7]}"`),
      active: true,
    });
  }
  console.log(`Parsé ${rows.length} entrées depuis celebrity-db.ts`);
  const fileIds = new Set(rows.map((r) => r.id));

  // Upsert par lots
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error } = await admin.from("celebrities").upsert(batch, { onConflict: "id" });
    if (error) { console.error("✗ upsert:", error.message); process.exit(1); }
  }
  console.log(`✓ upsert ${rows.length} lignes`);

  // Supprime les lignes orphelines (doublons id nom-humain, parasites, encodage cassé)
  const { data: existing } = await admin.from("celebrities").select("id");
  const toDelete = (existing ?? []).map((r) => r.id).filter((id) => !fileIds.has(id));
  if (toDelete.length) {
    const { error } = await admin.from("celebrities").delete().in("id", toDelete);
    console.log(error ? `✗ delete: ${error.message}` : `✓ supprimé ${toDelete.length} ligne(s) orpheline(s)`);
  } else {
    console.log("Aucune ligne orpheline à supprimer");
  }
  const { count } = await admin.from("celebrities").select("*", { count: "exact", head: true });
  console.log(`Table finale : ${count} lignes (= ${rows.length} attendu)`);
}

const cmd = process.argv[2] ?? "emit";
if (cmd === "emit") emit();
else if (cmd === "folders") await renameFolders();
else if (cmd === "table") await mirrorTable();
else if (cmd === "all") { await renameFolders(); await mirrorTable(); }
else { console.error("commande inconnue:", cmd); process.exit(1); }
