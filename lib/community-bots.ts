// ═══════════════════════════════════════════════════════════════════════════
// Animation automatique de la Communauté (messages « bots »)
//
// Objectif : donner vie à la Communauté sans tâche planifiée ni stockage.
// Les messages fictifs sont générés de façon DÉTERMINISTE à la lecture, à
// partir d'un générateur pseudo-aléatoire ensemencé par le jour / la semaine.
// Conséquences :
//   • le flux est identique à chaque rafraîchissement (pas de clignotement) ;
//   • il grandit tout seul au fil du temps réel → de nouvelles « discussions »
//     apparaissent à des heures aléatoires, comme de vrais utilisateurs ;
//   • aucune ligne n'est écrite en base (rien à nettoyer).
//
// Trois espaces par défaut sont animés :
//   • « Général »     → des centaines de pseudos qui discutent (heures aléatoires)
//   • « Mise à jour »  → ~20 rappels de nouveautés par jour
//   • « Cadeau »       → partages du Parrainage + 5 cadeaux « 200 crédits » / semaine
// ═══════════════════════════════════════════════════════════════════════════

export type TextSize = "small" | "normal" | "large" | "title";

export interface VirtualMessage {
  id: string;
  topic_id: string;
  user_id: string | null;
  author_name: string;
  is_admin: boolean;
  content: string;
  image_url: string | null;
  text_size: TextSize;
  created_at: string;
  // Bouton d'action facultatif (ex. réclamer des crédits)
  action: "claim_credits" | null;
  action_key: string | null;
  action_amount: number | null;
  action_claimed: boolean;
}

const DAY = 86_400_000; // ms dans une journée

/* ── PRNG déterministe (hash FNV-1a + mulberry32) ─────────────────────────── */
function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Renvoie une fonction aléatoire [0,1) déterministe pour une graine texte. */
function rng(seed: string): () => number {
  return mulberry32(hashStr(seed));
}
function pick<T>(r: () => number, arr: readonly T[]): T {
  return arr[Math.floor(r() * arr.length)];
}

/* ── Pseudos (plusieurs centaines, stables et récurrents) ─────────────────── */
const NAME_A = [
  "Lucas", "Emma", "Nathan", "Léa", "Hugo", "Chloé", "Enzo", "Manon", "Louis",
  "Jade", "Gabriel", "Camille", "Raphaël", "Sarah", "Arthur", "Inès", "Théo",
  "Zoé", "Noah", "Lina", "Adam", "Louna", "Maxime", "Anaïs", "Ethan", "Eva",
  "Tom", "Clara", "Yanis", "Nina", "Mathis", "Ambre", "Sacha", "Rose", "Kylian",
  "Alice", "Rayan", "Juliette", "Nolan", "Lola", "Aaron", "Maya", "Evan",
  "Elena", "Malo", "Romane",
] as const;
const NAME_B = [
  "", "", "", "76", "92", "_off", "officiel", "_pro", "TV", "YT", "59", "13",
  "_gg", "x", "2k", "_fr", "prod", "_ok", "33", "06", "_hd", "gaming", "_snap",
  "31", "44", "_live", "world", "_xx",
] as const;
const SEPS = ["", "", "", "_", "."] as const;

/** ~360 pseudos déterministes (mélange stable). */
const PSEUDOS: string[] = (() => {
  const combos: string[] = [];
  for (let i = 0; i < NAME_A.length; i++) {
    for (let j = 0; j < NAME_B.length; j++) {
      const sep = NAME_B[j] ? SEPS[(i + j) % SEPS.length] : "";
      combos.push(`${NAME_A[i]}${sep}${NAME_B[j]}`);
    }
  }
  // Mélange déterministe (Fisher–Yates ensemencé) puis on garde ~360
  const r = rng("pseudo-pool-v1");
  for (let i = combos.length - 1; i > 0; i--) {
    const k = Math.floor(r() * (i + 1));
    [combos[i], combos[k]] = [combos[k], combos[i]];
  }
  // Déduplique en gardant l'ordre
  return Array.from(new Set(combos)).slice(0, 360);
})();

/* ── Contenus « Général » (discussions entre membres) ─────────────────────── */
const GENERAL_MSGS = [
  "Franchement le rendu en Ultra HD est ouf 🔥",
  "Quelqu'un a testé le style GTA 6 ? ça donne quoi",
  "Ma photo est passée nickel du premier coup 😎",
  "Trop bien cette commu, enfin un endroit entre membres Ultimate",
  "Vous mettez quoi comme photo pour un meilleur rendu ?",
  "Perso je prends toujours une photo bien éclairée, ça change tout",
  "Le mode Snap Rouge est incroyable jvous jure",
  "J'ai généré genre 20 images aujourd'hui, j'arrête plus mdr",
  "Ça marche aussi avec les photos de groupe ou pas ?",
  "Tips : évitez les photos floues, le résultat est bien meilleur",
  "Je viens de passer Ultimate, aucun regret 💯",
  "Vous préférez le style GTA 5 ou GTA 6 vous ?",
  "GTA 6 clairement, le rendu est plus réaliste",
  "Quelqu'un sait quand y'aura de nouveaux styles ?",
  "Le support a répondu en 10 min, respect",
  "Première image et déjà bluffé par la qualité",
  "On peut télécharger en haute résolution non ?",
  "Oui clique sur l'image et t'as le bouton télécharger HD",
  "Meilleur site pour ce genre de trucs, testé plein d'autres avant",
  "Ma copine a adoré son portrait version GTA 😂",
  "Petit conseil : recadrez bien le visage avant d'envoyer",
  "J'ai eu 200 crédits avec le parrainage, tranquille",
  "Vous partagez vos créations où ? insta ?",
  "Le rendu des cheveux est devenu beaucoup plus propre je trouve",
  "Ça tourne super vite maintenant, avant c'était plus long",
  "Comment on fait pour changer la langue du site ?",
  "En bas dans les réglages tu peux mettre anglais/espagnol/allemand",
  "Grosse maj visiblement, l'interface est plus fluide",
  "J'adore qu'on ait un espace privé rien que pour les Ultimate",
  "Franchement pour le prix ça vaut largement le coup",
  "Quelqu'un d'autre a remarqué que c'est plus rapide ce soir ?",
  "Trop hâte des prochains styles jsuis accro 😅",
  "Le résultat en portrait est meilleur qu'en photo entière je trouve",
  "Astuce : une photo de face marche mieux qu'un profil",
  "Je recommande à tous mes potes, ils sont tous bluffés",
  "On a des cadeaux réguliers ici c'est cool 🎁",
  "Première fois que je vois un rendu aussi net wow",
  "Vous faites quoi avec vos images une fois générées ?",
  "Moi je les mets en fond d'écran 😎",
  "Le contraste est parfait sur la dernière que j'ai faite",
  "Ça fait combien de crédits une image déjà ?",
  "Newbie ici, des conseils pour bien commencer ?",
  "Bienvenue ! commence avec une photo bien nette de face",
  "J'ai retenté avec une meilleure lumière, jour et nuit le résultat",
  "Le rendu nocturne façon GTA est juste parfait",
  "Enfin une commu active, ça fait plaisir",
  "Vous êtes plutôt team selfie ou photo pro ?",
  "Le style néon rend trop bien sur les photos de nuit",
  "Merci pour les tips les gars, ça aide vraiment",
  "Qualité au top comme d'hab 👌",
  "Jsuis là depuis le début, ça s'est vraiment amélioré",
  "La v2 est vraiment mieux que la v1, énorme boulot",
  "Un pote m'a parrainé, du coup on a eu les crédits tous les deux 🙌",
  "Ça rend ouf même avec une photo un peu ancienne",
  "Perso j'upload en 4K et le résultat est incroyable",
  "Vous avez vu le nouveau rendu des yeux ? beaucoup plus réaliste",
  "Hâte de voir ce qu'ils préparent pour la suite",
  "Le mode HD gratuit avec Ultimate c'est cadeau",
  "Franchement bravo à l'équipe, gros taf 👏",
  "Ça fait 3 mois que je l'utilise, toujours aussi satisfait",
] as const;

/* ── Contenus « Mise à jour » (nouveautés déjà faites, qui reviennent) ────── */
const UPDATES = [
  "🔄 Rappel : le rendu Ultra HD est activé sur toutes vos générations.",
  "✨ Le style GTA 6 est disponible pour tous les membres.",
  "⚡ Génération accélérée : vos images sont prêtes plus vite.",
  "🎨 Rendu des visages amélioré (yeux, cheveux, peau plus réalistes).",
  "🌙 Mode nocturne façon néon toujours disponible sur vos photos.",
  "🔒 Espace Communauté réservé aux membres Ultimate — profitez-en !",
  "🎁 Programme de parrainage : +200 crédits par ami invité.",
  "🖼️ Téléchargement en haute résolution activé sur chaque création.",
  "🌍 Le site est disponible en français, anglais, espagnol et allemand.",
  "📸 Support des photos jusqu'à 5 Mo pour un meilleur rendu.",
  "🔥 Snap Rouge : le mode exclusif est accessible aux membres Ultimate.",
  "💳 Recharge de crédits instantanée depuis votre tableau de bord.",
  "🚀 Interface du tableau de bord plus fluide et plus rapide.",
  "🛡️ Vos images restent privées : rien n'est partagé sans votre accord.",
  "🎯 Détection du visage améliorée pour un cadrage automatique.",
  "🆕 Nouveau moteur de génération : meilleure netteté sur les détails.",
  "📱 Site entièrement optimisé pour mobile.",
  "💬 Le support répond désormais plus rapidement à vos demandes.",
  "🎨 Contraste et colorimétrie retravaillés pour un rendu plus fidèle.",
  "⭐ Historique de vos générations conservé dans votre espace.",
  "🔁 Relance automatique en cas d'échec d'une génération.",
  "🖤 Thème sombre optimisé pour un meilleur confort visuel.",
  "🎬 Rendu vidéo en préparation — restez connectés.",
  "✅ Paiements 100% sécurisés via Stripe.",
  "🏆 Qualité d'image encore améliorée sur les portraits.",
] as const;

/* ── Contenus « Cadeau » — partages du Parrainage (mis en avant) ──────────── */
const REFERRAL_SHARES = [
  "🎁 Rappel : invitez un ami via l'onglet Parrainage et gagnez +200 crédits chacun !",
  "👥 Vous avez un code de parrainage personnel dans l'onglet « Parrainage » — partagez-le, c'est +200 crédits par inscription.",
  "💸 Astuce crédits gratuits : partagez votre lien de parrainage. Chaque ami inscrit = +200 crédits pour vous, +100 pour lui.",
  "🔗 Retrouvez votre lien de parrainage dans le menu « Parrainage » et cumulez les crédits gratuits sans limite.",
  "🚀 Plus vous parrainez, plus vous gagnez de crédits. Rendez-vous dans l'onglet Parrainage !",
  "📣 Partagez votre lien de parrainage sur vos réseaux : chaque inscription = +200 crédits offerts.",
  "🤝 Un ami tenté par High Like It ? Donnez-lui votre code parrain, vous gagnez 200 crédits chacun.",
  "💰 Envie de crédits gratuits ? L'onglet Parrainage est le moyen le plus rapide d'en cumuler.",
  "⭐ Le saviez-vous ? Il n'y a aucune limite au nombre d'amis que vous pouvez parrainer.",
  "🎯 Objectif crédits : 5 amis parrainés = 1000 crédits offerts. Direction l'onglet Parrainage !",
  "🔥 Votre code parrain vous attend dans « Parrainage » — partagez-le dès maintenant.",
  "🎉 Vos amis vous remercieront : ils reçoivent 100 crédits de bienvenue avec votre lien.",
] as const;

/* ── Contenus « Cadeau » — avantages, surprises et bons plans ─────────────── */
const CADEAU_MSGS = [
  "🎁 Avantage Ultimate : profitez du rendu Ultra HD offert sur toutes vos créations.",
  "✨ Surprise du jour : de nouveaux styles arrivent régulièrement, rien qu'à vous.",
  "💎 En tant que membre Ultimate, vous avez accès à l'espace Communauté en exclusivité.",
  "🎊 Petit bonus : le mode Snap Rouge est débloqué pour tous les membres Ultimate.",
  "🥳 Merci d'être membre Ultimate — voici encore plein d'avantages exclusifs à venir.",
  "🎈 Astuce : gardez un œil sur cet espace, des cadeaux crédits y tombent chaque semaine.",
  "💝 Cadeau de fidélité : votre historique de générations est conservé sans limite.",
  "🌟 Exclu Ultimate : téléchargez toutes vos images en haute résolution, gratuitement.",
  "🎀 Un petit plus pour vous : le support prioritaire répond en quelques minutes.",
  "🎁 Bon plan : combinez parrainage + cadeaux crédits pour ne jamais manquer de crédits.",
  "🍀 Coup de chance à saisir : les cadeaux crédits sont limités dans le temps chaque jour.",
  "🎇 Nouveauté offerte : le rendu façon GTA 6 est inclus dans votre abonnement Ultimate.",
  "💫 Rappel cadeau : pensez à récupérer vos crédits offerts avant la fin de la journée.",
  "🎉 Avantage membre : aucune publicité, une expérience 100% fluide et premium.",
  "🎁 Chaque semaine, 5 cadeaux « 200 crédits » sont déposés ici — soyez au rendez-vous !",
  "🌈 Surprise : partagez vos plus belles créations dans l'espace Général, on adore les voir.",
  "🎯 Petit rappel : vos crédits n'expirent pas, cumulez-les tranquillement.",
  "💐 Merci pour votre confiance — de nouvelles surprises se préparent pour les membres Ultimate.",
  "🎁 Offre permanente : parrainez, gagnez, recommencez. Les crédits gratuits sont illimités.",
  "✨ Bon à savoir : les cadeaux du jour apparaissent à des heures différentes, restez attentifs !",
] as const;

const CREDIT_GIFT_TEXT =
  "🎉 CADEAU DU JOUR — 200 crédits offerts !\n" +
  "Cliquez sur le bouton ci-dessous pour récupérer immédiatement vos 200 crédits (offre réservée aux membres Ultimate connectés).";

/* ── Fenêtre quotidienne d'activité ───────────────────────────────────────────
   Les messages ne paraissent qu'entre 7h et 23h (heure de Paris), pour les
   trois espaces. À 7h, une nouvelle « session du jour » démarre : on ne génère
   que cette session, donc les messages de la veille disparaissent d'eux-mêmes
   (aucun stockage → rien à effacer, pas d'accumulation ni de doublons). */
const TIMEZONE = "Europe/Paris";
const START_HOUR = 7;   // début de journée
const END_HOUR = 23;    // fin de journée
const HOUR = 3_600_000; // ms dans une heure

const _dtf = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIMEZONE,
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hour12: false,
});
interface Wall { y: number; mo: number; d: number; h: number; mi: number }
/** Heure murale (Europe/Paris) d'un instant donné. */
function wallParts(ms: number): Wall {
  const p: Record<string, string> = {};
  for (const part of _dtf.formatToParts(new Date(ms))) {
    if (part.type !== "literal") p[part.type] = part.value;
  }
  let h = parseInt(p.hour, 10);
  if (h === 24) h = 0; // certaines runtimes renvoient "24" à minuit
  return { y: +p.year, mo: +p.month, d: +p.day, h, mi: +p.minute };
}
/** Instant UTC (ms) correspondant à une heure murale Europe/Paris. */
function wallToUtc(y: number, mo: number, d: number, h: number, mi: number): number {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const w = wallParts(guess);
  const shown = Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi);
  return guess - (shown - guess); // corrige du décalage horaire (offset)
}

interface Session { dayIndex: number; startMs: number; endMs: number }
/** Session courante : la journée [7h,23h] en cours, ou celle de la veille avant 7h. */
function currentSession(nowMs: number): Session {
  let w = wallParts(nowMs);
  // Avant 7h → on reste sur la session de la veille (jusqu'à la réinit de 7h)
  if (w.h < START_HOUR) w = wallParts(nowMs - DAY);
  const dayIndex = Math.floor(Date.UTC(w.y, w.mo - 1, w.d) / DAY);
  const startMs = wallToUtc(w.y, w.mo, w.d, START_HOUR, 0);
  const endMs = wallToUtc(w.y, w.mo, w.d, END_HOUR, 0);
  return { dayIndex, startMs, endMs };
}

/** Vrai si ce jour fait partie des 5 jours « cadeau » de la semaine. */
function isGiftDay(dayIndex: number): boolean {
  const weekIndex = Math.floor(dayIndex / 7);
  const dow = ((dayIndex % 7) + 7) % 7;
  const wr = rng(`giftdays:${weekIndex}`);
  const days = [0, 1, 2, 3, 4, 5, 6];
  for (let i = days.length - 1; i > 0; i--) {
    const k = Math.floor(wr() * (i + 1));
    [days[i], days[k]] = [days[k], days[i]];
  }
  return new Set(days.slice(0, 5)).has(dow); // 5 jours / 7
}

/** Horodatage du cadeau crédits d'un jour (aléatoire dans la fenêtre 7h–23h). */
function giftTsForDay(dayIndex: number, startMs: number, endMs: number): number {
  const r = rng(`giftcred:${dayIndex}`);
  return startMs + Math.floor(r() * (endMs - startMs));
}

function makeMsg(
  id: string,
  topicId: string,
  author: string,
  isAdmin: boolean,
  content: string,
  tsMs: number,
  size: TextSize = "normal",
): VirtualMessage {
  return {
    id,
    topic_id: topicId,
    user_id: null,
    author_name: author,
    is_admin: isAdmin,
    content,
    image_url: null,
    text_size: size,
    created_at: new Date(tsMs).toISOString(),
    action: null,
    action_key: null,
    action_amount: null,
    action_claimed: false,
  };
}

/* ── « Général » : 20 à 40 messages PAR HEURE, entre 7h et 23h ────────────── */
function generateGeneral(topicId: string, nowMs: number): VirtualMessage[] {
  const out: VirtualMessage[] = [];
  const { dayIndex, startMs, endMs } = currentSession(nowMs);
  const nbHours = END_HOUR - START_HOUR; // 16 tranches horaires (7h→23h)
  for (let hb = 0; hb < nbHours; hb++) {
    const bucketStart = startMs + hb * HOUR;
    if (bucketStart > nowMs) break; // tranche horaire pas encore commencée
    const perHour = 20 + Math.floor(rng(`gen2:${dayIndex}:${hb}`)() * 21); // 20..40 / heure
    for (let j = 0; j < perHour; j++) {
      const r = rng(`gen2:${dayIndex}:${hb}:${j}`);
      const ts = bucketStart + Math.floor(r() * HOUR);
      if (ts > nowMs || ts > endMs) continue;
      out.push(makeMsg(`vg-${dayIndex}-${hb}-${j}`, topicId, pick(r, PSEUDOS), false, pick(r, GENERAL_MSGS), ts));
    }
  }
  return out;
}

/* ── « Mise à jour » : une bonne vingtaine de rappels par jour (7h–23h) ────── */
function generateUpdates(topicId: string, nowMs: number): VirtualMessage[] {
  const out: VirtualMessage[] = [];
  const { dayIndex, startMs, endMs } = currentSession(nowMs);
  const nb = 25 + Math.floor(rng(`updn:${dayIndex}`)() * 11); // 25..35 / jour
  for (let i = 0; i < nb; i++) {
    const r = rng(`upd2:${dayIndex}:${i}`);
    const ts = startMs + Math.floor(r() * (endMs - startMs));
    if (ts > nowMs) continue;
    out.push(makeMsg(`vu-${dayIndex}-${i}`, topicId, "High Like It", true, pick(r, UPDATES), ts));
  }
  return out;
}

/* ── « Cadeau » : une bonne vingtaine de messages/jour ─────────────────────
   Mélange de partages Parrainage (mis en avant) et de messages avantages /
   surprises, + le bouton cadeau « 200 crédits » les jours cadeau (5/semaine). */
function generateGifts(topicId: string, nowMs: number): VirtualMessage[] {
  const out: VirtualMessage[] = [];
  const { dayIndex, startMs, endMs } = currentSession(nowMs);

  const nb = 25 + Math.floor(rng(`giftn:${dayIndex}`)() * 11); // 25..35 / jour
  for (let i = 0; i < nb; i++) {
    const r = rng(`gift2:${dayIndex}:${i}`);
    const ts = startMs + Math.floor(r() * (endMs - startMs));
    if (ts > nowMs) continue;
    // ~40% de partages Parrainage, ~60% messages avantages/surprises
    const content = r() < 0.4 ? pick(r, REFERRAL_SHARES) : pick(r, CADEAU_MSGS);
    out.push(makeMsg(`gm-${dayIndex}-${i}`, topicId, "High Like It", true, content, ts, "large"));
  }

  // Cadeau « 200 crédits » avec bouton — les jours cadeau (5 par semaine)
  if (isGiftDay(dayIndex)) {
    const ts = giftTsForDay(dayIndex, startMs, endMs);
    if (ts <= nowMs) {
      const key = `giftcred:${dayIndex}`;
      const msg = makeMsg(`gc-${dayIndex}`, topicId, "High Like It", true, CREDIT_GIFT_TEXT, ts, "large");
      msg.action = "claim_credits";
      msg.action_key = key;
      msg.action_amount = 200;
      out.push(msg);
    }
  }
  return out;
}

/**
 * Messages fictifs pour une discussion par défaut, en fonction de son titre.
 * Renvoie [] pour toute autre discussion (créées par les membres).
 */
export function generateVirtualMessages(
  topicId: string,
  topicTitle: string,
  isDefault: boolean,
  nowMs: number = Date.now(),
): VirtualMessage[] {
  if (!isDefault) return [];
  switch (topicTitle) {
    case "Général":     return generateGeneral(topicId, nowMs);
    case "Mise à jour": return generateUpdates(topicId, nowMs);
    case "Cadeau":      return generateGifts(topicId, nowMs);
    default:            return [];
  }
}

/**
 * Valide une clé de cadeau crédits et renvoie le montant si elle est réclamable.
 * Un cadeau n'est réclamable que pendant SA session (le jour même, après 7h) :
 * dès la réinitialisation de 7h, l'ancien cadeau n'est plus valable. Sinon null.
 */
export function validateCreditGiftKey(
  key: string,
  nowMs: number = Date.now(),
): { amount: number; ts: number } | null {
  const m = /^giftcred:(-?\d+)$/.exec(key);
  if (!m) return null;
  const dayIndex = parseInt(m[1], 10);
  const session = currentSession(nowMs);
  if (dayIndex !== session.dayIndex) return null; // cadeau d'un autre jour → expiré
  if (!isGiftDay(dayIndex)) return null;          // pas un jour cadeau
  const ts = giftTsForDay(dayIndex, session.startMs, session.endMs);
  if (ts > nowMs) return null;                    // pas encore paru
  return { amount: 200, ts };
}
