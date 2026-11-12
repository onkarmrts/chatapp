"use client";

import { useEffect, useState } from "react";
import { moodColors, moodGradient } from "@/lib/mood";

type Layer = { id: string; bg: string };

// Idle screens use the brand backdrop; every chat room gets its own colour mood.
const BRAND_BG =
  "radial-gradient(60% 45% at 90% 0%, rgba(255,79,139,0.38), transparent 62%), " +
  "radial-gradient(70% 55% at 0% 100%, rgba(124,77,255,0.50), transparent 62%), #130B2B";

function bgFor(seed: string) {
  return seed === "idle" ? BRAND_BG : moodGradient(seed);
}

export function MoodBackground({ seed }: { seed: string }) {
  const [layers, setLayers] = useState<Layer[]>([{ id: seed, bg: bgFor(seed) }]);

  useEffect(() => {
    setLayers((l) => (l[l.length - 1].id === seed ? l : [l[l.length - 1], { id: seed, bg: bgFor(seed) }]));
    document.documentElement.style.setProperty("--tint", seed === "idle" ? "#b79cff" : moodColors(seed).tint);
  }, [seed]);

  return (
    <div className="fixed inset-0 -z-10 bg-ink" aria-hidden>
      {layers.map((l, i) => (
        <div
          key={l.id}
          className="absolute inset-0"
          style={{
            background: l.bg,
            animation: layers.length > 1 && i === layers.length - 1 ? "moodIn 900ms ease forwards" : undefined,
          }}
        />
      ))}
    </div>
  );
}
