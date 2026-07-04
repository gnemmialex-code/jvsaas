"use client";

import { useRef, useState, useCallback } from "react";

interface Props {
  before: string;
  after:  string;
  alt?:   string;
  onError?: () => void;
}

export default function BeforeAfterSlider({ before, after, alt = "", onError }: Props) {
  const [pos, setPos]       = useState(50); // % from left
  const containerRef        = useRef<HTMLDivElement>(null);
  const dragging            = useRef(false);

  const updatePos = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - left) / width) * 100));
    setPos(pct);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updatePos(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updatePos(e.clientX);
  };
  const onPointerUp = () => { dragging.current = false; };

  return (
    <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden">
      {/* After (full) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt={`${alt} après`} className="absolute inset-0 w-full h-full object-cover" draggable={false} onError={onError} />

      {/* Before (clipped to left of slider) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt={`${alt} avant`} className="absolute inset-0 w-full h-full object-cover" style={{ width: containerRef.current?.offsetWidth ?? "100%" }} draggable={false} onError={onError} />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
        style={{ left: `${pos}%` }}
      />

      {/* Handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
        style={{ left: `${pos}%` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M5 4L2 8l3 4M11 4l3 4-3 4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Labels */}
      <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-black/60 backdrop-blur-sm text-white/80 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-lg border border-white/10 pointer-events-none">
        Avant
      </span>
      <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 gradient-bg-orange-animated text-white font-semibold text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-lg pointer-events-none shadow-[0_0_12px_rgba(255,122,0,0.5)]">
        Après
      </span>
    </div>
  );
}
