"use client";

import { useEffect, useState } from "react";
import { cancelSearch } from "@/lib/chat/engine";

export function Searching() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const line =
    secs < 15 ? "Finding someone for you..." : secs < 45 ? "Taking a bit longer. Hang tight." : "Quiet right now. We'll keep looking.";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div
        className="h-28 w-28 rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 30%, #fff, var(--tint) 60%, transparent 72%)",
          animation: "orb 2.2s ease-in-out infinite",
        }}
        aria-hidden
      />
      <p role="status" className="text-xl">{line}</p>
      <button onClick={cancelSearch} className="rounded-pill bg-glass px-6 py-3">Cancel</button>
    </main>
  );
}
