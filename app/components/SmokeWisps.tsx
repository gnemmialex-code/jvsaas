"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

interface Wisp {
  id: number;
  left: number;    // %
  height: number;  // px
  duration: number; // s
  sway: number;    // px de balancement latéral sur le trajet
  path: string;    // courbe légèrement différente à chaque fois
}

// Chaque filet suit une courbe légèrement différente (variations aléatoires
// des points de contrôle), pour ne jamais avoir deux volutes identiques.
function buildSmokePath(): string {
  const rnd = (base: number) => base + (Math.random() - 0.5) * 10;
  return `M22 200 C ${rnd(10)} 165, ${rnd(34)} 145, 22 110 C ${rnd(10)} 75, ${rnd(34)} 55, 22 20 C ${rnd(15)} 8, 22 0, 22 0`;
}

// De temps en temps (pas en continu, contrairement aux étincelles), un fin
// filet de fumée de cigarette monte lentement depuis le bas de l'écran en
// ondulant, s'élargit et se floute progressivement en montant — comme de la
// vraie fumée qui se diffuse dans l'air — puis se dissipe complètement.
// Purement décoratif et très discret.
export default function SmokeWisps() {
  const [wisps, setWisps] = useState<Wisp[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const spawn = () => {
      const id = ++idRef.current;
      const duration = 20 + Math.random() * 12;
      setWisps((prev) => [
        ...prev,
        {
          id,
          left: 6 + Math.random() * 88,
          height: 150 + Math.random() * 100,
          duration,
          sway: (Math.random() - 0.5) * 90,
          path: buildSmokePath(),
        },
      ]);
      setTimeout(() => {
        setWisps((prev) => prev.filter((w) => w.id !== id));
      }, duration * 1000);
    };

    const first = setTimeout(spawn, 5000);
    const interval = setInterval(spawn, 9000 + Math.random() * 12000);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[3] pointer-events-none overflow-hidden">
      {wisps.map((w) => {
        const style: CSSProperties & Record<"--sway", string> = {
          left: `${w.left}%`,
          bottom: "-4vh",
          width: 44,
          height: w.height,
          animationDuration: `${w.duration}s`,
          "--sway": `${w.sway}px`,
        };
        return (
          <svg
            key={w.id}
            viewBox="0 0 44 200"
            className="absolute animate-smoke-rise"
            style={style}
          >
            <path
              d={w.path}
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.3"
            />
          </svg>
        );
      })}
    </div>
  );
}
