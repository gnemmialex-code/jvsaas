"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import UploadBox from "./UploadBox";
import { User, Upload } from "lucide-react";

type FaceSource = "uploaded" | "self";

interface FaceSelectorProps {
  onFaceSelected: (file: File | null, preview: string | null, source: FaceSource) => void;
  selectedSource?: FaceSource;
  preview?: string | null;
}

export default function FaceSelector({
  onFaceSelected,
  selectedSource,
  preview,
}: FaceSelectorProps) {
  const [activeTab, setActiveTab] = useState<FaceSource>(selectedSource ?? "self");

  const handleTabChange = (tab: FaceSource) => {
    setActiveTab(tab);
    if (tab === "self") {
      onFaceSelected(null, null, "self");
    }
  };

  const handleFileSelected = (file: File, filePreview: string) => {
    onFaceSelected(file, filePreview, "uploaded");
  };

  const handleClear = () => {
    onFaceSelected(null, null, "uploaded");
  };

  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-3">
        Source du visage
      </label>

      {/* Tab selector */}
      <div className="flex gap-1 p-1 bg-surface-hover rounded-xl mb-4">
        {[
          { id: "self" as FaceSource, label: "Votre photo", icon: <User className="w-4 h-4" /> },
          { id: "uploaded" as FaceSource, label: "Upload séparé", icon: <Upload className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-surface text-white shadow-sm border border-surface-border"
                : "text-white/50 hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "self" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-accent-violet/5 border border-accent-violet/20 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-violet/10 rounded-xl flex items-center justify-center text-accent-violet">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm">Même photo que l&apos;original</p>
              <p className="text-white/40 text-xs">
                Le visage sera extrait de votre photo uploadée
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <UploadBox
            onFileSelected={handleFileSelected}
            onClear={handleClear}
            preview={preview}
            label="Photo du visage (optionnel)"
            maxSizeMB={5}
          />
          <p className="text-white/30 text-xs mt-2">
            Uploadez un visage différent à appliquer sur le résultat
          </p>
        </motion.div>
      )}
    </div>
  );
}
