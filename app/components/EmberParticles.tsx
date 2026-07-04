"use client";

import { useEffect, useState, type CSSProperties } from "react";

interface Ember {
  left: number;     // %
  size: number;     // px
  duration: number; // s
  delay: number;    // s (négatif = déjà "en vol" au montage)
  drift: number;    // px de dérive horizontale sur le trajet
  opacity: number;
}

function generateEmbers(count: number): Ember[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    size: 2 + Math.random() * 3,
    duration: 10 + Math.random() * 12,
    delay: -Math.random() * 20,
    drift: (Math.random() - 0.5) * 70,
    opacity: 0.15 + Math.random() * 0.3,
  }));
}

// Très légères étincelles orangées qui remontent en continu du bas de
// l'écran vers le haut, sur toutes les pages, pour donner un effet vivant et
// ambiant au site (façon braises qui s'envolent). Purement décoratif :
// pointer-events désactivés, opacité très faible.
export default function EmberParticles() {
  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    setEmbers(generateEmbers(24));
  }, []);

  return (
    <div className="fixed inset-0 z-[3] pointer-events-none overflow-hidden">
      {embers.map((e, i) => {
        const style: CSSProperties & Record<"--ember-drift" | "--ember-opacity", string> = {
          left: `${e.left}%`,
          bottom: "-2vh",
          width: e.size,
          height: e.size,
          animationDuration: `${e.duration}s`,
          animationDelay: `${e.delay}s`,
          "--ember-drift": `${e.drift}px`,
          "--ember-opacity": `${e.opacity}`,
        };
        return (
          <span
            key={i}
            className="absolute rounded-full bg-gradient-to-t from-accent-orange to-amber-200 blur-[0.5px] animate-ember-rise"
            style={style}
          />
        );
      })}
    </div>
  );
}
