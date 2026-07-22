"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageCircle, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";

// Chaque profil = un pseudo dont le genre correspond réellement à la photo associée.
// La photo 11 (couple homme+femme) est exclue car elle ne représente pas une seule personne.
// Exporté pour être réutilisé ailleurs (ex: avis qui défilent sur la page d'accueil)
// afin de garder les mêmes profils partout sur le site.
export const PROFILES = [
  { name: "thomasvibes92", avatar: 1 },  // homme
  { name: "nathan_07",     avatar: 2 },  // homme
  { name: "antoine_dlx44", avatar: 3 },  // homme
  { name: "kevin_lx",      avatar: 4 },  // homme
  { name: "maxime.wave21", avatar: 5 },  // homme
  { name: "raphael.k",     avatar: 6 },  // homme
  { name: "lina.martel19", avatar: 7 },  // femme
  { name: "emma.laurentx", avatar: 8 },  // femme
  { name: "jade.moreno33", avatar: 9 },  // femme
  { name: "camille.rosee", avatar: 10 }, // femme
  { name: "sarah.mln08",   avatar: 12 }, // femme
  { name: "clara.benett",  avatar: 13 }, // femme
  { name: "louane.sky77",  avatar: 14 }, // femme
  { name: "manon.lvy",     avatar: 15 }, // femme
];

const REVIEWS = [
  { stars: 5, text: "Très bonne idée, c'est rapide et le résultat est assez impressionnant" },
  { stars: 4, text: "Ça fait le travail." },
  { stars: 4, text: "Facile a utiliser et le résultat est meilleur que prévu" },
  { stars: 5, text: "Incroyable mdr j'ai envoyé ca a mes potes" },
  { stars: 5, text: "Simple, rapide, bluffant. Je l'utilise pour mes contenus créatifs. Le pipeline IA est vraiment au top." },
  { stars: 4, text: "Très sympa, juste un peu plus long que prévu." },
  { stars: 4, text: "Résultat propre, je recommande pour tester." },
  { stars: 3, text: "Pas mal, j'aurais aimé plus de choix" },
  { stars: 5, text: "La qualité 4K est bluffante. En 30 secondes j'avais mon photo en style Hollywood. Je recommande vivement !" },
  { stars: 5, text: "J'aime bien le côté réaliste avec le style gta, ça change des filtres classiques" },
  { stars: 5, text: "Simple, rapide, efficace." },
  { stars: 3, text: "L'idée est bonne, manque juste un peu plus de contrôle sur le résultat" },
  { stars: 5, text: "J'ai testé par curiosité, zéro déception." },
  { stars: 5, text: "J'adore le rendu." },
  { stars: 4, text: "La deuxième tentative était meilleure que la première." },
  { stars: 3, text: "Pas mauvais mais ca depend vraiment de la photo" },
  { stars: 5, text: "Incroyable ! Le résultat est tellement réaliste, j'ai partagé sur Instagram et tout le monde pensait que c'était vrai." },
  { stars: 5, text: "Le résultat est propre 👌" },
  { stars: 5, text: "Validé 🔥 ca ressemble vraiment a une image du jeu" },
  { stars: 3, text: "Ça marche bien mais le rendu dépend beaucoup de la qualité de la photo envoyée" },
  { stars: 5, text: "Franchement jpensais pas que ca allait marcher aussi bien 😭" },
  { stars: 5, text: "Franchement le rendu est lourd, surtout avec une bonne photo de départ" },
  { stars: 2, text: "Le rendu était pas mauvais mais cette fois les détails étaient moins précis" },
  { stars: 4, text: "J'aime bien le style, peut-être un peu long à générer." },
  { stars: 5, text: "Parfait pour les photos de profil. Le style Vogue Editorial est mon préféré, le rendu est professionnel." },
  { stars: 5, text: "Rapide et efficace." },
  { stars: 5, text: "Le résultat est assez réaliste tout en gardant le coté gta" },
  { stars: 4, text: "Ca sort des images vraiment propre, quelques petits defauts parfois" },
  { stars: 5, text: "Le rapport qualité/prix est intéressant vu le résultat obtenu" },
  { stars: 5, text: "Le rendu final est vraiment stylé, on dirait presque un personnage créé dans un jeu" },
  { stars: 5, text: "Franchement rien a redire c'est propre" },
  { stars: 5, text: "Le style gta est vraiment bien fait, ca donne envie d'en faire plein" },
  { stars: 4, text: "La génération est parfois un peu lente mais l'image finale vaut l'attente" },
  { stars: 4, text: "Franchement sympa, ya juste quelques details du visage" },
  { stars: 5, text: "Je pensais que ca allait etre un filtre basique mais pas du tout" },
  { stars: 5, text: "Le rendu est grave cool 🔥" },
  { stars: 5, text: "Très sympa comme idée, ça change des filtres habituels" },
  { stars: 5, text: "En moins d'une minute c'était prêt. Très satisfait du rendu." },
  { stars: 5, text: "Le style est super réussi." },
  { stars: 5, text: "La qualité est grave bonne, surtout les details" },
  { stars: 5, text: "Simple rapide et le rendu claque" },
  { stars: 5, text: "Franchement sympa, j'ai fait tester a des amis et ils ont tous aimé" },
  { stars: 4, text: "Bonne expérience, manque juste quelques options." },
  { stars: 5, text: "J'ai mis une photo vite fait et ca ma sorti un truc propre 😂" },
  { stars: 5, text: "Simple a utiliser et pas besoin de faire 50 réglages avant d'avoir une bonne image" },
  { stars: 4, text: "Facile à utiliser." },
  { stars: 4, text: "Bonne expérience dans l'ensemble, facile a utiliser même la première fois" },
  { stars: 5, text: "La transformation garde bien les traits du visage, c'est ce qui rend le résultat cool" },
  { stars: 5, text: "Vraiment stylé." },
  { stars: 4, text: "Le rendu est vraiment sympa. Quelques petits détails auraient pu être un peu plus précis." },
  { stars: 5, text: "Le rendu fait vraiment penser a un personnage de gta, c'est assez impressionnant" },
  { stars: 2, text: "Le résultat est correct mais cette fois le visage était un peu moins fidèle." },
  { stars: 5, text: "Le rendu dépasse mes attentes." },
  { stars: 4, text: "Très bon service ! Seul petit bémol, parfois 40 secondes au lieu de 20 habituellement." },
  { stars: 4, text: "Très sympa, juste la génération a pris un peu de temps" },
  { stars: 5, text: "Incroyable 😭 le style fait vraiment penser aux illustrations de GTA." },
  { stars: 4, text: "J'ai du refaire une fois mais apres c'etait mieux" },
  { stars: 2, text: "Cette fois le rendu etait moyen et ca a mis plus longtemps" },
  { stars: 5, text: "Le rendu final est vraiment stylé" },
  { stars: 5, text: "Très cool pour partager avec ses potes." },
  { stars: 5, text: "J'ai essayé avec plusieurs photos et celle avec le meilleur éclairage donne un super rendu" },
  { stars: 4, text: "Quelques petits détails à améliorer mais c'est déjà très bien." },
  { stars: 5, text: "Wow le résultat est beaucoup mieux que prévu 😮" },
  { stars: 4, text: "Bonne qualité, ca vaut le coup de tester" },
  { stars: 5, text: "J'ai testé plusieurs versions et celle ci rendait vraiment comme une image du jeu" },
  { stars: 5, text: "Simple a utiliser et le resultat est vraiment cool" },
  { stars: 5, text: "Testé vite fait et bah le resultat est grave bien 🔥" },
  { stars: 4, text: "Ça marche bien, interface simple." },
  { stars: 5, text: "La vérité c'est rapide, qualité et le résultat est direct au rendez-vous !" },
  { stars: 5, text: "La photo de base etait pas ouf mais ca la bien transformé" },
  { stars: 5, text: "Test rapide, image générée sans souci." },
  { stars: 5, text: "La transformation garde bien les détails du visage et le style est réussi" },
  { stars: 4, text: "Le resultat est cool mais ma premiere image etait pas la meilleure" },
  { stars: 4, text: "J'aime bien le style, peut être rajouter encore plus de variantes" },
  { stars: 5, text: "Le résultat ressemble beaucoup a une image de jeu, je pensais pas que ça allait autant marcher" },
  { stars: 4, text: "J'aime bien le style obtenu." },
  { stars: 5, text: "J'ai essayé avec une photo sombre et ça marche quand même bien." },
  { stars: 4, text: "Le rendu est vraiment bien mais la première photo marchait moins bien" },
  { stars: 5, text: "Ça rend trop bien 😍" },
  { stars: 3, text: "Pas mal mais je m'attendais à un rendu un peu différent." },
  { stars: 5, text: "Franchement surpris du résultat 😄 La qualité est propre et l'image est nette." },
  { stars: 4, text: "Très bonne qualité. J'aurais juste aimé pouvoir choisir entre plusieurs variantes." },
  { stars: 5, text: "Franchement le concept est original." },
  { stars: 3, text: "Le concept est cool, j'ai du refaire plusieurs fois" },
  { stars: 3, text: "Des fois le visage est un peu bizarre mais sinon ca va" },
  { stars: 5, text: "J'ai kiffé le resultat, ca fait vraiment perso de jeu" },
  { stars: 5, text: "Franchement incroyable." },
  { stars: 4, text: "Le resultat est bon mais certaines photos marchent mieux que d'autres" },
  { stars: 4, text: "Sympa ! L'image est fidèle à la photo de départ." },
  { stars: 4, text: "Quelques secondes d'attente mais au final l'image est réussi" },
  { stars: 5, text: "Très sympa pour transformer une photo." },
  { stars: 4, text: "Le style est réussi, il manque peut être quelques options supplémentaires" },
  { stars: 3, text: "Ca marche bien mais des fois le rendu est un peu bizarre" },
  { stars: 4, text: "Pas mal du tout, juste un petit peu long mais sinon rien a dire" },
  { stars: 4, text: "J'ai eu une première image moyenne mais la deuxième était beaucoup mieux" },
  { stars: 4, text: "Le résultat est très bon mais certaines photos donnent un meilleur rendu que d'autres" },
  { stars: 5, text: "Le côté GTA est bien réussi, j'aime beaucoup." },
  { stars: 4, text: "Simple à utiliser et le résultat est propre. Rien de compliqué." },
  { stars: 4, text: "La qualité est bonne, juste certains petits détails qui changent" },
  { stars: 5, text: "Le style est vraiment réussi, ça fait bien penser à un artwork GTA. Génération rapide." },
  { stars: 4, text: "Globalement satisfait." },
  { stars: 5, text: "Nickel, rien à dire." },
  { stars: 5, text: "C'est simple, tu upload ta photo et le résultat arrive rapidement" },
  { stars: 5, text: "Validé 😂 le style est vraiment propre" },
  { stars: 4, text: "Très bon résultat dans l'ensemble. J'aurais aimé un peu plus de choix pour les styles." },
  { stars: 4, text: "Le rendu est propre, juste un petit temps d'attente mais ça vaut le coup." },
  { stars: 4, text: "J'aime bien, peut etre ajouter plus de styles ca serait cool" },
  { stars: 5, text: "Le style ressemble vraiment à un personnage de jeu." },
  { stars: 5, text: "Je m'attendais a un truc basique mais au final la qualité est vraiment bonne" },
  { stars: 5, text: "Très simple à utiliser. En quelques clics j'avais mon image." },
  { stars: 3, text: "L'image est correcte mais certains détails du visage sont moins précis" },
  { stars: 5, text: "J'ai testé avec une photo prise au téléphone et le résultat est nickel." },
  { stars: 5, text: "J'ai juste mis une photo prise vite fait et le résultat est vraiment propre" },
  { stars: 5, text: "J'ai testé avec un selfie normal et le rendu est vraiment propre, surtout au niveau du style gta" },
  { stars: 4, text: "Le résultat est bon, juste quelques détails du visage pourraient être améliorés." },
  { stars: 5, text: "Le style Met Gala est trop bien. On dirait une vraie photo de gala. Mes amis n'en reviennent pas !" },
  { stars: 4, text: "Bonne surprise, juste l'attente un peu longue" },
  { stars: 5, text: "Bonne qualité d'image, ça fait son effet." },
  { stars: 5, text: "Bonne surprise, je pensais pas que ça allait être aussi propre" },
  { stars: 5, text: "J'aime bien le style ca change des filtres classiques" },
  { stars: 4, text: "Bonne idée et facile a comprendre" },
  { stars: 5, text: "Ca fait vraiment affiche gta c'est propre" },
  { stars: 5, text: "Je m'attendais pas à un résultat aussi propre, franchement ça rend super bien." },
  { stars: 5, text: "Franchement le rendu est lourd, je m'attendais pas a ca" },
  { stars: 5, text: "Le rendu est super, les couleurs sont top. Rien à redire." },
  { stars: 5, text: "Le rendu est vraiment propre, ça donne un style jeu vidéo direct." },
  { stars: 4, text: "Bonne surprise." },
  { stars: 5, text: "Trop marrant a faire avec les photos des potes" },
  { stars: 5, text: "Trop propre le rendu, on dirait vraiment un perso du jeu" },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface FeedItem {
  id: number;
  profile: { name: string; avatar: number };
  review: { stars: number; text: string };
  timestamp: number;
}

function timeAgo(ts: number, t: (k: string) => string): string {
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return t("reviews.now");
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return t("reviews.agoMin").replace("{n}", String(diffMin));
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return t("reviews.agoHour").replace("{n}", String(diffH));
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return t("reviews.agoDay").replace("{n}", String(diffD));
  const diffMo = Math.floor(diffD / 30);
  return t("reviews.agoMonth").replace("{n}", String(diffMo));
}

const STORAGE_KEY = "highlights_reviews_feed_v1";
const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

// Chaque avis est espacé d'au moins 40 minutes du suivant (jamais plus proche),
// en partant d'il y a 3 mois jusqu'à aujourd'hui.
const MIN_GAP_MS = 40 * 60 * 1000;
const MAX_GAP_MS = 1400 * 60 * 1000;

function buildHistory(): FeedItem[] {
  const count = 180;
  const items: FeedItem[] = [];
  let ts = Date.now() - THREE_MONTHS_MS;
  for (let i = 0; i < count; i++) {
    items.push({
      id: i + 1,
      profile: pickRandom(PROFILES),
      review: pickRandom(REVIEWS),
      timestamp: ts,
    });
    ts += MIN_GAP_MS + Math.floor(Math.random() * (MAX_GAP_MS - MIN_GAP_MS));
  }
  return items.sort((a, b) => a.timestamp - b.timestamp);
}

// Filet de sécurité : supprime les avis trop rapprochés (moins de 40 min de
// l'avis précédent conservé), quelle que soit la source (historique déjà
// généré, stocké en localStorage, ou nouvel avis en direct).
function enforceMinGap(items: FeedItem[]): FeedItem[] {
  const sorted = [...items].sort((a, b) => a.timestamp - b.timestamp);
  const kept: FeedItem[] = [];
  for (const item of sorted) {
    if (kept.length === 0 || item.timestamp - kept[kept.length - 1].timestamp >= MIN_GAP_MS) {
      kept.push(item);
    }
  }
  return kept;
}

let feedCounter = 0;

export default function ReviewsBubble() {
  const { t } = useI18n();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [open, setOpen] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [, forceTick] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myHoverRating, setMyHoverRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Charge l'historique persistant (ou en génère un remontant à 3 mois la première fois)
  useEffect(() => {
    let initial: FeedItem[];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      initial = stored ? (JSON.parse(stored) as FeedItem[]) : buildHistory();
    } catch {
      initial = buildHistory();
    }
    // Ordre chronologique garanti (plus récent en premier), quelle que soit la source,
    // et retire les avis trop rapprochés (moins de 40 min de l'avis précédent).
    initial = enforceMinGap(initial);
    feedCounter = initial.reduce((max, it) => Math.max(max, it.id), 0);
    setFeed(initial);
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  }, []);

  // Persiste à chaque changement, pour que l'historique survive fermeture/rechargement
  useEffect(() => {
    if (feed.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(feed.slice(-400)));
      } catch {
        /* quota dépassé, silencieux */
      }
    }
  }, [feed]);

  useEffect(() => {
    const addOne = () => {
      setFeed((prev) =>
        [
          { id: ++feedCounter, profile: pickRandom(PROFILES), review: pickRandom(REVIEWS), timestamp: Date.now() },
          ...prev,
        ]
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(-400)
      );
      setHasUnread(true);
      setBounce(true);
      setTimeout(() => setBounce(false), 800);
    };

    // Première apparition rapide pour montrer la fonctionnalité, puis rythme réel de 7 à 15 min
    const first = setTimeout(addOne, 8000);
    const interval = setInterval(addOne, 7 * 60_000 + Math.random() * 8 * 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  // Rafraîchit l'affichage des "il y a X min" pendant que le panneau reste ouvert
  useEffect(() => {
    const ticker = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(ticker);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  // À l'ouverture (et à chaque nouvel avis pendant que c'est ouvert), va direct au plus récent (en bas)
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, feed]);

  const toggleOpen = () => {
    setOpen((o) => {
      const next = !o;
      if (next) setHasUnread(false);
      return next;
    });
  };

  const submitMyReview = () => {
    if (myRating === 0 || !myComment.trim()) return;
    setFeed((prev) =>
      [
        ...prev,
        { id: ++feedCounter, profile: { name: "Vous", avatar: 0 }, review: { stars: myRating, text: myComment.trim() }, timestamp: Date.now() },
      ]
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-400)
    );
    setMyRating(0);
    setMyComment("");
  };

  return (
    <div className="fixed bottom-1 right-1 z-50">
      <motion.button
        onClick={toggleOpen}
        animate={bounce ? { y: [0, -18, 3, -8, 0], scale: [1, 1.15, 0.95, 1.05, 1] } : { y: 0, scale: 1 }}
        whileHover={{ scale: 1.03, transition: { duration: 0.4, ease: "easeOut" } }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-8 h-8 flex items-center justify-center text-white/80 hover:text-white transition-colors"
      >
        <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
        {hasUnread && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-10 right-0 w-80 h-[30rem] flex flex-col bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <p className="text-white/30 text-[10px] text-center py-2.5 uppercase tracking-wide border-b border-white/5 flex-shrink-0">
              {t("reviews.recent")}
            </p>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 no-scrollbar">
              {feed.length === 0 && (
                <p className="text-white/40 text-xs text-center py-6">{t("reviews.empty")}</p>
              )}
              <div className="space-y-2.5">
                <AnimatePresence initial={false}>
                  {feed.map((item) => {
                    const isMe = item.profile.name === "Vous";
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        className="flex items-end gap-2"
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-surface mb-1 flex items-center justify-center">
                          {isMe ? (
                            <span className="text-[9px] font-bold text-white/70">V</span>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={`/avatars/${item.profile.avatar}.jpg`} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2 mb-0.5 px-1">
                            <p className="text-white/50 text-[10px] font-medium truncate">
                              {isMe ? t("reviews.you") : `@${item.profile.name}`}
                            </p>
                            <span className="text-white/25 text-[9px] flex-shrink-0">{timeAgo(item.timestamp, t)}</span>
                          </div>
                          {/* Bulle façon iMessage (message reçu) */}
                          <div className={`rounded-2xl rounded-bl-md px-3 py-2 ${isMe ? "bg-accent-violet/20" : "bg-white/[0.08]"}`}>
                            <div className="flex items-center gap-0.5 mb-1">
                              {Array.from({ length: item.review.stars }).map((_, s) => (
                                <Star key={s} className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                              ))}
                              {Array.from({ length: 5 - item.review.stars }).map((_, s) => (
                                <Star key={s} className="w-2 h-2 text-white/20" />
                              ))}
                            </div>
                            <p className="text-white/80 text-[11px] leading-relaxed">
                              {item.review.text}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Mini formulaire pour laisser son propre avis */}
            <div className="flex-shrink-0 border-t border-white/10 p-2.5 space-y-1.5">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={!userEmail}
                    onMouseEnter={() => userEmail && setMyHoverRating(n)}
                    onMouseLeave={() => setMyHoverRating(0)}
                    onClick={() => userEmail && setMyRating(n)}
                    className="p-0.5 disabled:cursor-not-allowed"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        userEmail && n <= (myHoverRating || myRating) ? "fill-yellow-400 text-yellow-400" : "text-white/15"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {userEmail ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitMyReview()}
                    placeholder={t("reviews.placeholder")}
                    className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[11px] text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                  />
                  <button
                    type="button"
                    onClick={submitMyReview}
                    className="gradient-bg-orange-animated opacity-80 shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-125"
                  >
                    <Send className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-1.5 group">
                  <span className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[11px] text-white/30 cursor-not-allowed">
                    {t("reviews.loginToReview")}
                  </span>
                  <span className="gradient-bg-orange-animated opacity-80 shrink-0 w-7 h-7 rounded-full flex items-center justify-center group-hover:opacity-60 group-hover:scale-125 transition-all duration-300">
                    <Send className="w-3 h-3 text-white" />
                  </span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
