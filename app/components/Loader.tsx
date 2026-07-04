"use client";

import { motion } from "framer-motion";

interface LoaderProps {
  message?: string;
  progress?: number;
  steps?: string[];
  currentStep?: number;
}

export default function Loader({
  message = "Génération en cours...",
  progress,
  steps,
  currentStep = 0,
}: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Animated orb */}
      <div className="relative w-24 h-24 mb-8">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-accent-violet/30 blur-xl"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-2 border-transparent border-t-accent-violet border-r-accent-neon"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full border-2 border-transparent border-t-accent-neon border-l-accent-violet"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-gradient-violet-neon animate-pulse" />
        </div>
      </div>

      <motion.p
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-white font-semibold text-lg mb-2"
      >
        {message}
      </motion.p>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="w-64 mt-4">
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-violet-neon rounded-full"
            />
          </div>
        </div>
      )}

      {/* Steps */}
      {steps && steps.length > 0 && (
        <div className="mt-6 space-y-2 w-full max-w-xs">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  i < currentStep
                    ? "bg-accent-violet text-white text-xs"
                    : i === currentStep
                    ? "border-2 border-accent-violet"
                    : "border-2 border-surface-border"
                }`}
              >
                {i < currentStep && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    ✓
                  </motion.span>
                )}
                {i === currentStep && (
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-accent-violet"
                  />
                )}
              </div>
              <span
                className={`text-sm transition-colors ${
                  i <= currentStep ? "text-white" : "text-white/30"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function InlineLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizes[size]} rounded-full border-2 border-transparent border-t-accent-violet border-r-accent-neon`}
    />
  );
}
