// Light client-side filter. Real enforcement also needs server-side checks and reports.
const URL_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|in|me|io|net|org|xyz|ly)\b)/i;
const PHONE_RE = /(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/;
const UPI_RE = /\b[\w.-]{2,}@[a-z]{2,}\b/i;
// Add words you want blocked. Keep it in sync with your Community Guidelines.
const BLOCKED_WORDS: string[] = [];

export type CheckResult = { ok: true } | { ok: false; reason: string };

export function checkMessage(text: string): CheckResult {
  if (URL_RE.test(text)) return { ok: false, reason: "Links aren't allowed in chat." };
  if (PHONE_RE.test(text)) return { ok: false, reason: "Sharing phone numbers isn't allowed." };
  if (UPI_RE.test(text)) return { ok: false, reason: "Sharing payment IDs isn't allowed." };
  const lower = text.toLowerCase();
  if (BLOCKED_WORDS.some((w) => lower.includes(w))) return { ok: false, reason: "That message breaks the community guidelines." };
  return { ok: true };
}
