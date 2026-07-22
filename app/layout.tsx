import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import SiteBackground from "./components/SiteBackground";
import IntroReveal from "./components/IntroReveal";
import SmoothScroll from "./components/SmoothScroll";
import EmberParticles from "./components/EmberParticles";
import SmokeWisps from "./components/SmokeWisps";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "High Like It — Transforme ta photo en personnage GTA 5 & GTA 6 (IA)",
  description:
    "Envoie ta photo et découvre à quoi tu ressemblerais en personnage de GTA 5 ou GTA 6 grâce à l'IA Ultra HD de High Like It. Résultat 4K en moins de 30 secondes.",
  keywords: ["High Like It", "GTA 5", "GTA 6", "IA", "personnage GTA", "avatar IA", "transformation photo", "style GTA"],
  openGraph: {
    title: "High Like It — Transforme ta photo en personnage GTA 5 & GTA 6",
    description: "Envoie ta photo et vois-toi en personnage de GTA 5 ou GTA 6 avec l'IA Ultra HD de High Like It.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="text-foreground antialiased">
        <I18nProvider>
          <SmoothScroll />
          <IntroReveal />
          <SiteBackground />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1E1E1E",
                color: "#fff",
                border: "1px solid #2A2A2A",
                borderRadius: "12px",
              },
              success: {
                iconTheme: { primary: "#8A2BE2", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#fff" },
              },
            }}
          />
          {children}

          <EmberParticles />
          <SmokeWisps />

          {/* Grain vintage très léger, au-dessus de toute l'interface */}
          <div className="fixed inset-0 z-[999] pointer-events-none grain-overlay" />
        </I18nProvider>
      </body>
    </html>
  );
}
