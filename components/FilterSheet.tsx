"use client";

import { useChatStore, type PrefGender } from "@/lib/chat/store";

const OPTIONS: { v: PrefGender; l: string; hint: string }[] = [
  { v: "any", l: "Anyone", hint: "Fastest matches" },
  { v: "male", l: "Men", hint: "Only men" },
  { v: "female", l: "Women", hint: "Only women" },
];

export function FilterSheet({ onClose }: { onClose: () => void }) {
  const pref = useChatStore((s) => s.prefGender);
  const patch = useChatStore((s) => s.patch);

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 sm:items-center" role="dialog" aria-modal onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-ink p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold">Who do you want to meet?</h2>
        <p className="mt-1 text-mist/60">You'll only match with people who are happy to meet you too.</p>
        <div className="mt-5 grid gap-2" role="radiogroup" aria-label="Who do you want to meet">
          {OPTIONS.map((o) => (
            <button
              key={o.v}
              role="radio"
              aria-checked={pref === o.v}
              onClick={() => {
                patch({ prefGender: o.v });
                onClose();
              }}
              className={`flex items-center justify-between rounded-2xl px-5 py-4 text-left transition-colors ${
                pref === o.v ? "bg-brand text-white shadow-glow" : "bg-glass"
              }`}
            >
              <span className="text-lg font-semibold">{o.l}</span>
              <span className={`text-sm ${pref === o.v ? "text-white/80" : "text-mist/50"}`}>{o.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
