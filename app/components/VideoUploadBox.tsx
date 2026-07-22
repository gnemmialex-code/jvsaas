"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Film, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface VideoUploadBoxProps {
  onFileSelected: (file: File, preview: string) => void;
  onClear?: () => void;
  preview?: string | null;
  label?: string;
  maxSizeMB?: number;
}

const MAX_SIZE_MB = 100;
const ALLOWED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export default function VideoUploadBox({
  onFileSelected,
  onClear,
  preview,
  label,
  maxSizeMB = MAX_SIZE_MB,
}: VideoUploadBoxProps) {
  const { t } = useI18n();
  const resolvedLabel = label ?? t("upload.videoLabel");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejected = rejectedFiles[0] as { errors?: { code: string }[] };
        const errCode = rejected?.errors?.[0]?.code;
        if (errCode === "file-too-large") {
          setError(t("upload.tooLarge").replace("{n}", String(maxSizeMB)));
        } else if (errCode === "file-invalid-type") {
          setError(t("upload.badFormatVideo"));
        } else {
          setError(t("upload.invalidFile"));
        }
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      const url = URL.createObjectURL(file);
      onFileSelected(file, url);
    },
    [onFileSelected, maxSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/mp4": [], "video/quicktime": [], "video/webm": [] },
    maxFiles: 1,
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: !!preview,
  });

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-white/70 mb-2">{resolvedLabel}</label>

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden border border-accent-orange/40 shadow-orange"
          >
            <div className="aspect-video relative bg-black">
              <video src={preview} controls className="w-full h-full object-contain" />
            </div>
            <button
              onClick={() => { onClear?.(); setFileName(null); }}
              className="absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white border border-surface-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-white/80 text-xs truncate">{fileName ?? t("upload.videoSelected")} ✓</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div
              {...getRootProps()}
              className={`
                relative aspect-video rounded-2xl border-2 border-dashed cursor-pointer
                flex flex-col items-center justify-center text-center p-6
                transition-all duration-300
                ${isDragActive
                  ? "border-accent-orange bg-accent-orange/10 scale-[1.02]"
                  : "border-surface-border hover:border-accent-orange/50 hover:bg-surface-hover"
                }
              `}
            >
              <input {...getInputProps()} />
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isDragActive ? "bg-accent-orange/20 text-accent-orange" : "bg-surface text-white/30"}`}>
                {isDragActive ? <Film className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
              </div>
              <p className="text-white font-semibold mb-1">
                {isDragActive ? t("upload.dropHere") : t("upload.dragVideo")}
              </p>
              <p className="text-white/40 text-sm mb-4">{t("upload.orClick")}</p>
              <p className="text-white/25 text-xs">MP4, MOV, WebM • Max {maxSizeMB}MB</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}
    </div>
  );
}
