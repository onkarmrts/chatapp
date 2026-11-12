"use client";

import { useState } from "react";
import { blockPartner, reportPartner } from "@/lib/chat/engine";
import type { ReportReason } from "@/types";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "abuse", label: "Abuse or harassment" },
  { value: "sexual_content", label: "Sexual content" },
  { value: "spam", label: "Spam" },
  { value: "scam", label: "Scam or asking for money" },
  { value: "underage", label: "Seems under 18" },
  { value: "other", label: "Something else" },
];

export function ReportSheet({ onClose }: { onClose: () => void }) {
  const [reason, setReason] = useState<ReportReason>("abuse");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    onClose();
    await reportPartner(reason, details);
  }

  async function block() {
    setBusy(true);
    onClose();
    await blockPartner();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60" role="dialog" aria-modal onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-t-3xl bg-ink p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold">Report this person</h2>
        <fieldset className="mt-4 flex flex-col gap-2">
          {REASONS.map((r) => (
            <label key={r.value} className="flex items-center gap-3 rounded-xl bg-glass px-4 py-3">
              <input type="radio" name="reason" checked={reason === r.value} onChange={() => setReason(r.value)} />
              {r.label}
            </label>
          ))}
        </fieldset>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          maxLength={500}
          placeholder="Anything else we should know? (optional)"
          className="mt-3 h-20 w-full resize-none rounded-xl bg-glass p-3 outline-none placeholder:text-mist/40"
        />
        <div className="mt-4 flex gap-3">
          <button onClick={block} disabled={busy} className="rounded-pill bg-glass px-5 py-3">Just block</button>
          <button onClick={submit} disabled={busy} className="flex-1 rounded-pill bg-mist px-5 py-3 font-semibold text-ink">
            Report and move on
          </button>
        </div>
      </div>
    </div>
  );
}
