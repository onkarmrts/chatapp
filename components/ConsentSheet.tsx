"use client";

import { useState } from "react";
import Link from "next/link";
import { backToStart, confirmAge } from "@/lib/chat/engine";

type Gender = "male" | "female" | "other";
const OPTIONS: { v: Gender; l: string }[] = [
  { v: "male", l: "Male" },
  { v: "female", l: "Female" },
  { v: "other", l: "Other" },
];

export function ConsentSheet() {
  const [ok, setOk] = useState(false);
  const [gender, setGender] = useState<Gender | null>(null);
  const [busy, setBusy] = useState(false);
  const ready = ok && gender !== null && !busy;

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 sm:items-center" role="dialog" aria-modal>
      <div className="w-full max-w-md rounded-t-3xl bg-ink p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-3xl">
        <h2 className="text-2xl font-semibold">Quick setup</h2>
        <p className="mt-1 text-mist/60">Takes five seconds. You only do this once.</p>

        <p className="mt-5 text-sm font-medium text-mist/80">I am</p>
        <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="I am">
          {OPTIONS.map((o) => (
            <button
              key={o.v}
              role="radio"
              aria-checked={gender === o.v}
              onClick={() => setGender(o.v)}
              className={`rounded-2xl py-3 font-medium transition-colors ${
                gender === o.v ? "bg-brand text-white shadow-glow" : "bg-glass text-mist"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>

        <label className="mt-5 flex items-start gap-3">
          <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-1 h-5 w-5 accent-[#FF4F8B]" />
          <span className="text-sm text-mist/80">
            I'm 18 or older and I agree to the{" "}
            <Link href="/legal/terms" className="underline">Terms</Link> and{" "}
            <Link href="/legal/guidelines" className="underline">Community Guidelines</Link>.
          </span>
        </label>
        <p className="mt-3 text-xs text-mist/50">Chats aren't saved. If you report someone, the last few messages are kept for review.</p>

        <div className="mt-6 flex gap-3">
          <button onClick={backToStart} className="rounded-pill bg-glass px-6 py-3">Not now</button>
          <button
            onClick={async () => {
              if (!gender) return;
              setBusy(true);
              await confirmAge(gender);
            }}
            disabled={!ready}
            className="flex-1 rounded-pill bg-brand px-6 py-3 font-semibold text-white shadow-glow disabled:opacity-40 disabled:shadow-none"
          >
            Start chatting
          </button>
        </div>
      </div>
    </div>
  );
}
