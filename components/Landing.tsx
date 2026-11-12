"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { config } from "@/lib/config";
import { useChatStore } from "@/lib/chat/store";
import { startChat } from "@/lib/chat/engine";
import { getSupabase } from "@/lib/supabase/client";
import { FilterSheet } from "./FilterSheet";
import {
  GoogleIcon,
  HeroIllustration,
  IconBolt,
  IconCheck,
  IconChevron,
  IconMask,
  IconNext,
  IconShield,
  IconUsers,
  LogoMark,
} from "./Illustrations";

type Who = { email: string | null; guest: boolean } | null | undefined; // undefined = still loading

const PREF_LABEL = { any: "Anyone", male: "Men", female: "Women" } as const;

const STEPS = [
  { t: "Tap start", d: "Sign in with Google or jump in as a guest. No forms, no profile." },
  { t: "Say hi", d: "You're matched with a stranger in seconds. Break the ice with a tap." },
  { t: "Swipe to move on", d: "Not feeling it? Tap Next or swipe left and meet someone new." },
];

const FEATURES = [
  { icon: IconMask, c: "text-violet bg-violet/15", t: "Anonymous by design", d: "No names, no photos. Just a conversation." },
  { icon: IconBolt, c: "text-amber bg-amber/15", t: "Matched in seconds", d: "Built for fast, light chats on any phone." },
  { icon: IconUsers, c: "text-rose bg-rose/15", t: "Choose who you meet", d: "Pick men, women or anyone before you start." },
  { icon: IconNext, c: "text-mint bg-mint/15", t: "One-tap Next", d: "Skip anytime. No awkward goodbyes." },
];

const SAFETY = [
  "18+ only, confirmed before your first chat",
  "Report or block in two taps",
  "Links, phone numbers and UPI IDs are filtered",
  "Chats are never saved",
];

const FAQ = [
  { q: "Is it free?", a: "Yes. You can chat for free as a guest or with Google." },
  { q: "Are my chats saved?", a: "No. Messages disappear when the chat ends. If you report someone, the last few messages are kept so we can review it." },
  { q: "Who can use it?", a: "Anyone in India who is 18 or older." },
  { q: "How do I report someone?", a: "Tap Report in the chat. You can also just block them and they'll never be matched with you again." },
];

export function Landing() {
  const { status, error } = useChatStore();
  const prefGender = useChatStore((s) => s.prefGender);
  const patch = useChatStore((s) => s.patch);
  const [who, setWho] = useState<Who>(undefined);
  const [online, setOnline] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        const u = data.session?.user;
        setWho(u ? { email: u.email ?? null, guest: !!u.is_anonymous } : null);
      });
    fetch("/api/online-count")
      .then((r) => r.json())
      .then((d) => setOnline(d.count))
      .catch(() => setOnline(null));
    if (new URLSearchParams(window.location.search).has("auth_error")) {
      patch({ toast: "Google sign-in didn't work. Try again." });
      window.history.replaceState({}, "", "/");
    }
  }, [patch]);

  async function signInWithGoogle() {
    setBusy(true);
    const { error: err } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) {
      setBusy(false);
      patch({ toast: err.message });
    }
  }

  const signedIn = !!who && !who.guest;

  const startPanel = (
    <div className="flex w-full max-w-sm flex-col gap-3">
      {status === "banned" && <p className="rounded-2xl bg-red-500/15 p-3 text-sm text-red-200">Your access is paused. Contact support if you think this is a mistake.</p>}
      {status === "limit" && <p className="rounded-2xl bg-amber/15 p-3 text-sm text-amber">You've used today's free chats. Come back tomorrow.</p>}
      {status === "error" && <p className="rounded-2xl bg-red-500/15 p-3 text-sm text-red-200">{error ?? "Something went wrong. Try again."}</p>}

      {signedIn ? (
        <>
          <button onClick={startChat} className="rounded-pill bg-brand px-8 py-4 text-lg font-semibold text-white shadow-glow transition-transform active:scale-[0.98]">
            Start chatting
          </button>
          <p className="text-center text-sm text-mist/60">Signed in as {who?.email}</p>
        </>
      ) : (
        <>
          <button
            onClick={signInWithGoogle}
            disabled={busy}
            className="flex items-center justify-center gap-3 rounded-pill bg-white px-8 py-4 text-lg font-semibold text-ink transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            <GoogleIcon className="h-5 w-5" />
            Continue with Google
          </button>
          <div className="flex items-center gap-3 text-xs text-mist/40" aria-hidden>
            <span className="h-px flex-1 bg-white/15" />
            or
            <span className="h-px flex-1 bg-white/15" />
          </div>
          <button onClick={startChat} className="rounded-pill bg-brand px-8 py-4 text-lg font-semibold text-white shadow-glow transition-transform active:scale-[0.98]">
            Start as guest
          </button>
        </>
      )}

      <button onClick={() => setShowFilters(true)} className="mx-auto flex items-center gap-1.5 rounded-pill bg-glass px-4 py-2 text-sm text-mist/80">
        Meeting: {PREF_LABEL[prefGender]}
        <IconChevron className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8">
      {/* Top bar */}
      <header className="flex items-center justify-between py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8" />
          <span className="text-xl font-semibold tracking-tight">{config.appName}</span>
        </Link>
        <Link href="/account" className="rounded-pill bg-glass px-4 py-2 text-sm">Account</Link>
      </header>

      {/* Hero */}
      <section className="grid items-center gap-8 pb-14 pt-4 md:grid-cols-2 md:gap-12 md:pt-10">
        <div className="flex flex-col items-start">
          <span className="flex items-center gap-2 rounded-pill bg-glass px-3.5 py-1.5 text-sm text-mist/80">
            <span className="h-2 w-2 rounded-full bg-mint" />
            {online && online > 0 ? `${online.toLocaleString("en-IN")} people online now` : "Made for India, 18+"}
          </span>
          <h1 className="mt-5 text-[2.9rem] font-semibold leading-[1.04] tracking-tight sm:text-6xl">
            Meet someone new in three seconds.
          </h1>
          <p className="mt-4 max-w-md text-lg text-mist/70">
            Anonymous 1-on-1 chat. Say hi, swap stories, and tap Next whenever you want someone else.
          </p>
          <div className="mt-8 w-full">{startPanel}</div>
         <p className="mt-4 text-sm text-mist/50">Free to use. No chats are saved.</p>
<p className="mt-2 flex items-center gap-1.5 text-sm text-mist/70">
  Made with
  <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-rose">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
  by Onkar
</p>
        </div>
        <HeroIllustration className="mx-auto w-full max-w-[420px] md:max-w-none" />
      </section>

      {/* How it works */}
      <section className="py-12">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">From hello to chatting in three taps</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.t} className="rounded-3xl bg-glass p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
              <p className="mt-1.5 text-mist/65">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="py-12">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple on purpose</h2>
        <p className="mt-2 max-w-lg text-mist/65">No feeds, no followers, no pressure. Just one screen and one conversation at a time.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {FEATURES.map((f) => (
            <div key={f.t} className="rounded-3xl border border-white/10 p-5">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${f.c}`}>
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-semibold leading-snug">{f.t}</h3>
              <p className="mt-1 text-sm text-mist/60">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Safety */}
      <section className="my-12 overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet/35 via-ink to-rose/25 p-6 sm:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-mint">
            <IconShield className="h-11 w-11" />
          </span>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Your safety comes first</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {SAFETY.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-mist/80">
                  <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-mint" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Questions</h2>
        <div className="mt-6 divide-y divide-white/10 rounded-3xl border border-white/10">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-medium">
                {f.q}
                <IconChevron className="h-5 w-5 shrink-0 text-mist/50 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-mist/65">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final call to action */}
      <section className="flex flex-col items-center gap-6 py-12 text-center">
        <h2 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight">Someone is online and ready to talk.</h2>
        {startPanel}
      </section>

      <footer className="flex flex-col items-center gap-3 border-t border-white/10 py-8 text-sm text-mist/50 sm:flex-row sm:justify-between">
        <span className="flex items-center gap-2">
          <LogoMark className="h-5 w-5" />
          {config.appName}. 18+ only.
        </span>
        <nav className="flex gap-5">
          <Link href="/legal/terms" className="hover:text-mist">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-mist">Privacy</Link>
          <Link href="/legal/guidelines" className="hover:text-mist">Guidelines</Link>
        </nav>
      </footer>

      {showFilters && <FilterSheet onClose={() => setShowFilters(false)} />}
    </div>
  );
}
