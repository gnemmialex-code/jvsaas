"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LOCALES, useI18n } from "@/lib/i18n";

interface NavbarProps {
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: (e: React.MouseEvent) => void;
  /** Remplace le bloc "Grand Theft Auto VI / V" (ex. onglets internes du Dashboard). */
  middleContent?: React.ReactNode;
  /** Barre un peu plus large (plus de gap / padding), ex. Dashboard avec plus d'onglets. */
  wide?: boolean;
}

export default function Navbar({
  ctaLabel,
  ctaHref = "/dashboard?view=create",
  onCtaClick,
  middleContent,
  wide = false,
}: NavbarProps) {
  const { locale, setLocale, t } = useI18n();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [langCoords, setLangCoords] = useState({ top: 0, right: 0 });
  const globeRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const STYLE_TABS = [{ label: t("nav.gta5"), href: "/#examples" }];

  // Sur le Dashboard mobile : le globe de langue disparaît de la barre et un
  // logo "HL" y prend sa place pour revenir à l'accueil d'un tap.
  const onDashboard = pathname?.startsWith("/dashboard") ?? false;

  const openLangMenu = () => {
    const rect = globeRef.current?.getBoundingClientRect();
    if (rect) setLangCoords({ top: rect.bottom, right: window.innerWidth - rect.right });
    setLangOpen(true);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Connecté → la page Paramètres du compte (email, crédits, abonnement…)
  const accountHref = userEmail ? "/dashboard?view=settings" : "/login";

  const tabClass =
    "text-[11px] sm:text-[13px] font-light tracking-wide text-white/75 hover:text-white hover:scale-110 transition-all duration-300 whitespace-nowrap shrink-0 inline-block";

  // Logo HG : ramène en haut de la page d'accueil, sans jamais ouvrir une autre page inutilement.
  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Onglet "Grand Theft Auto V" : va directement à la section avant/après de
  // la page d'accueil, jamais vers une page séparée.
  const handleGtaClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      document.getElementById("examples")?.scrollIntoView({ behavior: "smooth" });
    } else {
      e.preventDefault();
      router.push("/#examples");
    }
  };

  return (
    <>
      {/* Logo HL — détaché de la barre, en haut à gauche de l'écran.
          Sur mobile Dashboard il est remplacé par le HL intégré à la barre. */}
      <Link
        href="/"
        onClick={handleLogoClick}
        className={`fixed top-5 left-5 z-50 select-none ${onDashboard ? "hidden sm:block" : ""}`}
      >
        <motion.span
          whileHover={{ scale: 1.05, transition: { duration: 0.4, ease: "easeOut" } }}
          className="block text-4xl sm:text-5xl italic font-black tracking-wide gradient-text-orange-subtle"
        >
          HL
        </motion.span>
      </Link>

      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-[95vw]">
      <motion.div
        className={`flex items-center bg-black border border-white/10 rounded-full overflow-x-auto no-scrollbar shadow-2xl ${
          wide ? "gap-3 px-4 py-2 sm:gap-6 sm:px-7 sm:py-3" : "gap-3 px-4 py-2 sm:gap-5 sm:px-6 sm:py-3"
        }`}
      >
        {/* Logo HL dans la barre — mobile Dashboard uniquement : retour accueil */}
        {onDashboard && (
          <Link
            href="/"
            className="sm:hidden shrink-0 text-base italic font-black tracking-wide gradient-text-orange-subtle leading-none"
          >
            HL
          </Link>
        )}

        {/* Langue — icône globe, menu déroulant au survol (rendu en portail pour ne pas être coupé).
            Masqué sur mobile dans le Dashboard pour alléger la barre. */}
        <motion.span
          ref={globeRef}
          whileHover={{ scale: 1.03, transition: { duration: 0.4, ease: "easeOut" } }}
          className={`shrink-0 items-center justify-center w-4 h-4 text-white/70 cursor-pointer ${
            onDashboard ? "hidden sm:flex" : "flex"
          }`}
          onMouseEnter={openLangMenu}
          onMouseLeave={() => setLangOpen(false)}
        >
          <Globe className="w-[15px] h-[15px]" strokeWidth={1.25} />
        </motion.span>

        {typeof document !== "undefined" && createPortal(
          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onMouseEnter={openLangMenu}
                onMouseLeave={() => setLangOpen(false)}
                style={{ position: "fixed", top: langCoords.top, right: langCoords.right }}
                className="w-32 flex flex-col rounded-xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-2xl overflow-hidden py-1 z-[100]"
              >
                {LOCALES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLocale(lang.code); setLangOpen(false); }}
                    className={`px-4 py-2 text-left text-[13px] font-light transition-colors hover:bg-white/[0.06] ${
                      locale === lang.code ? "text-accent-orange font-semibold" : "text-white/75 hover:text-white"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {middleContent ?? (
          /* Onglets GTA masqués sur mobile : la barre se réduit à
             "Compte" + "Commencer Maintenant", sans défilement horizontal. */
          <div className="hidden sm:flex items-center gap-5 shrink-0">
            {/* Grand Theft Auto VI — indisponible */}
            <div className="flex flex-col items-center justify-center gap-0.5 shrink-0 cursor-default select-none">
              <span className="text-[13px] font-light tracking-wide text-white/25 whitespace-nowrap leading-none">
                {t("nav.gta6.label")}
              </span>
              <span className="text-[8px] italic font-semibold text-white/30 whitespace-nowrap leading-none mt-[1px]">
                {t("nav.gta6.soon")}
              </span>
            </div>

            {STYLE_TABS.map((tab) => (
              <Link key={tab.label} href={tab.href} onClick={handleGtaClick} className={tabClass}>
                {tab.label}
              </Link>
            ))}
          </div>
        )}

        <Link href={accountHref} className={tabClass}>
          {userEmail ? t("nav.profile") : t("nav.login")}
        </Link>

        <Link
          href={ctaHref}
          onClick={onCtaClick}
          className="text-[11px] sm:text-[12px] font-medium tracking-wide gradient-text-orange-subtle hover:opacity-80 hover:scale-110 transition-all duration-300 whitespace-nowrap shrink-0 inline-block"
        >
          {ctaLabel ?? t("nav.cta")}
        </Link>
      </motion.div>
      </div>
    </>
  );
}
