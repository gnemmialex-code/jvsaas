"use client";

import Link from "next/link";
import Navbar from "./components/Navbar";
import { useI18n } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="text-8xl font-black gradient-text mb-4">404</div>
        <h1 className="text-3xl font-bold mb-2">{t("nf.title")}</h1>
        <p className="text-white/50 mb-8">{t("nf.subtitle")}</p>
        <Link href="/" className="btn-primary">
          {t("nf.back")}
        </Link>
      </div>
    </div>
  );
}
