"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="relative z-10 border-t border-surface-border bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo2.png" alt="High Like It" className="h-11 w-auto rounded-xl" />
              <span className="font-black text-lg tracking-tight">High<span className="gradient-text">lights</span></span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Links — fond noir flouté pour rester lisibles sur le fond animé */}
          <div className="rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 p-5">
            <h4 className="font-semibold mb-4 text-white/80">{t("footer.product")}</h4>
            <ul className="space-y-2">
              {[
                { href: "/upload", label: t("footer.link.generate") },
                { href: "/pricing", label: t("footer.link.pricing") },
                { href: "/dashboard", label: t("footer.link.dashboard") },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 p-5">
            <h4 className="font-semibold mb-4 text-white/80">{t("footer.legal")}</h4>
            <ul className="space-y-2">
              {[
                { href: "/terms", label: t("footer.link.terms") },
                { href: "/privacy", label: t("footer.link.privacy") },
                { href: "/consent", label: t("footer.link.consent") },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Disclaimer légal — fond noir flouté pour la lisibilité ── */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-white/35" />
            </div>
            <div className="space-y-2">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                {t("footer.disclaimer.title")}
              </p>
              <p className="text-white/38 text-xs leading-relaxed">
                {t("footer.disclaimer.p1")}{" "}
                <strong className="text-white/55 font-semibold">{t("footer.disclaimer.strong")}</strong>{" "}
                {t("footer.disclaimer.p2")}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-surface-border mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            {t("footer.rights")}
          </p>
          <p className="text-white/20 text-xs">
            {t("footer.creative")}
          </p>
        </div>
      </div>
    </footer>
  );
}
