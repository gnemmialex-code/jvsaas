"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Download, Share2, RefreshCw, Maximize2, Check, Lock, Crown } from "lucide-react";
import toast from "react-hot-toast";
import { useI18n } from "@/lib/i18n";

interface ResultCardProps {
  outputUrl: string;
  inputUrl?: string;
  style?: string;
  generatedAt?: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  locked?: boolean;
}

export default function ResultCard({
  outputUrl,
  inputUrl,
  style,
  generatedAt,
  onRegenerate,
  isRegenerating = false,
  locked = false,
}: ResultCardProps) {
  const { t } = useI18n();
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(outputUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `astracrea-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("rc.downloaded"));
    } catch {
      toast.error(t("dash.toast.downloadError"));
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: t("rc.shareTitle"),
          text: t("rc.shareText"),
          url: outputUrl,
        });
      } else {
        await navigator.clipboard.writeText(outputUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(t("dash.toast.linkCopied"));
      }
    } catch {
      toast.error(t("rc.shareError"));
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card overflow-hidden"
      >
        {/* Image container */}
        <div className="relative aspect-square rounded-xl overflow-hidden mb-4 group">
          <Image
            src={showOriginal && inputUrl ? inputUrl : outputUrl}
            alt={t("dash.result.title")}
            fill
            className={`object-cover transition-all duration-300 ${locked && !showOriginal ? "blur-2xl scale-110" : ""}`}
          />

          {/* Cadenas — compte gratuit */}
          {locked && !showOriginal && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 text-center p-4 bg-black/30">
              <div className="w-14 h-14 rounded-2xl bg-accent-violet/20 border border-accent-violet/40 flex items-center justify-center">
                <Lock className="w-7 h-7 text-accent-violet" />
              </div>
              <p className="text-white font-bold text-sm">{t("dash.locked.title")}</p>
              <p className="text-white/70 text-xs max-w-[240px] leading-relaxed">
                {t("dash.locked.desc")}
              </p>
              <Link href="/pricing" className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm mt-1">
                <Crown className="w-4 h-4" />
                {t("dash.result.unlockHd")}
              </Link>
            </div>
          )}

          {/* Overlay controls (zoom) — masqué si flouté */}
          {!locked && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() => setIsFullscreen(true)}
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-colors"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Style badge */}
          {style && (
            <div className="absolute top-3 left-3">
              <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/10">
                {style}
              </span>
            </div>
          )}

          {/* HD badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-accent-violet/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-bold">
              4K HD
            </span>
          </div>

          {/* Before/After toggle */}
          {inputUrl && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex gap-1 bg-black/60 backdrop-blur-sm rounded-full p-1">
                <button
                  onClick={() => setShowOriginal(false)}
                  className={`flex-1 text-xs py-1 rounded-full transition-colors ${
                    !showOriginal ? "bg-accent-violet text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {t("dash.result.title")}
                </button>
                <button
                  onClick={() => setShowOriginal(true)}
                  className={`flex-1 text-xs py-1 rounded-full transition-colors ${
                    showOriginal ? "bg-accent-violet text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  Original
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        {generatedAt && (
          <p className="text-white/30 text-xs mb-4">
{t("rc.generatedOn")} {new Date(generatedAt).toLocaleString(undefined)}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {locked ? (
            <Link
              href="/pricing"
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <Crown className="w-4 h-4" />
              {t("dash.result.unlockHd")}
            </Link>
          ) : (
            <>
              <button
                onClick={handleDownload}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
              >
                <Download className="w-4 h-4" />
                {t("dash.result.download")}
              </button>
              <button
                onClick={handleShare}
                className="btn-secondary px-4 py-3 flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </>
          )}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="btn-secondary px-4 py-3 flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-3xl max-h-full w-full aspect-square">
            <Image src={outputUrl} alt="Plein écran" fill className="object-contain rounded-2xl" />
          </div>
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white"
            onClick={() => setIsFullscreen(false)}
          >
            ✕
          </button>
        </motion.div>
      )}
    </>
  );
}
