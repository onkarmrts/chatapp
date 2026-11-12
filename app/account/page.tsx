"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/client";

export default function Account() {
  const [guest, setGuest] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        const u = data.session?.user;
        setGuest(u ? !!u.is_anonymous : true);
        setEmail(u?.email ?? null);
      });
  }, []);

  async function signInGoogle() {
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/account` },
    });
    if (error) alert(error.message);
  }

  async function signOut() {
    await getSupabase().auth.signOut();
    window.location.href = "/";
  }

  async function deleteAccount() {
    if (!confirm("Delete your account and data? This can't be undone.")) return;
    setBusy(true);
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (res.ok) {
      await getSupabase().auth.signOut();
      window.location.href = "/";
    } else {
      setBusy(false);
      alert("Couldn't delete the account. Try again.");
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-6 py-12">
      <Link href="/" className="text-sm text-mist/60 hover:text-mist">Back to home</Link>
      <h1 className="mt-6 text-3xl font-semibold">Account</h1>
      <p className="mt-2 text-mist/70">
        {guest === null ? "Loading..." : guest ? "You're chatting as a guest." : `Signed in as ${email ?? "your account"}.`}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {guest && (
          <button onClick={signInGoogle} className="rounded-pill bg-mist px-5 py-3 font-medium text-ink">
            Continue with Google
          </button>
        )}
        <button onClick={signOut} className="rounded-pill bg-glass px-5 py-3">Log out</button>
        <button onClick={deleteAccount} disabled={busy} className="rounded-pill px-5 py-3 text-red-300 hover:bg-red-400/10 disabled:opacity-50">
          Delete my account
        </button>
      </div>
    </main>
  );
}
