"use client";

import { useEffect, useRef, useState } from "react";
import { config } from "@/lib/config";
import { useChatStore } from "@/lib/chat/store";
import { backToStart, nextChat, sendMessage, sendTyping } from "@/lib/chat/engine";
import { MessageBubble } from "./MessageBubble";
import { ReportSheet } from "./ReportSheet";

const STARTERS = ["Hi!", "Kahan se ho?", "Favourite movie?"];

export function ChatScreen() {
  const { messages, status, partnerTyping } = useChatStore();
  const patch = useChatStore((s) => s.patch);
  const [text, setText] = useState("");
  const [reporting, setReporting] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const live = status === "connected";
  const hasChatted = messages.some((m) => m.from !== "system");

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, partnerTyping]);

  // Desktop shortcut: Esc twice = Next
  useEffect(() => {
    let last = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const now = Date.now();
      if (now - last < 600) nextChat();
      last = now;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function send(value: string) {
    const err = sendMessage(value);
    if (err) patch({ toast: err });
    else setText("");
  }

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current !== null && touchX.current - e.changedTouches[0].clientX > 110) nextChat();
        touchX.current = null;
      }}
    >
      <header className="flex items-center justify-between px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <button onClick={backToStart} className="text-sm text-mist/60" aria-label="Leave chat">Leave</button>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${live ? "bg-[var(--tint)]" : "bg-mist/30"}`} />
          <span className="font-medium">Stranger</span>
        </div>
        <button
          onClick={() => setReporting(true)}
          disabled={!live}
          className="rounded-pill bg-glass px-3 py-1.5 text-sm disabled:opacity-30"
          aria-label="Report or block"
        >
          Report
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-5 py-3" aria-live="polite">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}
        {partnerTyping && <p className="text-sm text-mist/50">Stranger is typing...</p>}
        {live && !hasChatted && (
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {STARTERS.map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-pill bg-glass px-4 py-2 text-sm">
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <footer className="flex flex-col gap-3 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        {live && (
          <div className="flex items-end gap-2 rounded-3xl bg-glass p-2 pl-4">
            <textarea
              value={text}
              rows={1}
              maxLength={config.maxMessageLength}
              onChange={(e) => {
                setText(e.target.value);
                sendTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(text);
                }
              }}
              placeholder="Type a message"
              aria-label="Message"
              className="max-h-28 flex-1 resize-none bg-transparent py-2 outline-none placeholder:text-mist/40"
            />
            <button
              onClick={() => send(text)}
              disabled={!text.trim()}
              aria-label="Send"
              className="h-11 rounded-pill bg-mist px-5 font-semibold text-ink disabled:opacity-30"
            >
              Send
            </button>
          </div>
        )}
        <button
          onClick={nextChat}
          className="w-full rounded-pill bg-white/90 py-4 text-lg font-semibold text-ink transition-transform active:scale-[0.98]"
        >
          {live ? "Next" : "Find someone new"}
        </button>
      </footer>

      {reporting && <ReportSheet onClose={() => setReporting(false)} />}
    </div>
  );
}
