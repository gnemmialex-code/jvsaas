"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, Plus } from "lucide-react";

export default function CreditCounter() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const res = await fetch("/api/credits");
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits ?? 0);
      } else {
        setCredits(null);
      }
    } catch {
      setCredits(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-8 w-24 shimmer-bg rounded-lg" />
    );
  }

  if (credits === null) return null;

  const isLow = credits <= 2;

  return (
    <div className="flex items-center gap-1">
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
          isLow
            ? "bg-red-500/10 border-red-500/30 text-red-400"
            : "bg-accent-violet/10 border-accent-violet/30 text-accent-violet"
        }`}
      >
        <Zap className="w-3.5 h-3.5" />
        <span>{credits} crédit{credits !== 1 ? "s" : ""}</span>
      </div>
      {isLow && (
        <Link
          href="/pricing"
          className="w-7 h-7 bg-accent-violet rounded-lg flex items-center justify-center hover:bg-accent-violet/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
        </Link>
      )}
    </div>
  );
}
