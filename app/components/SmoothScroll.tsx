"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Défilement inertiel doux (Lenis) sur tout le site : le scroll molette /
// trackpad est lissé avec une inertie premium au lieu des sauts natifs.
// Les ancres (/#examples…) restent gérées par Lenis pour un glissement fluide.
export default function SmoothScroll() {
  useEffect(() => {
    // On respecte la préférence d'accessibilité "réduire les animations".
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      anchors: true,
    });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
