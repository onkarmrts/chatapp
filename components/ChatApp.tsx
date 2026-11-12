"use client";

import { useEffect } from "react";
import { useChatStore } from "@/lib/chat/store";
import { MoodBackground } from "./MoodBackground";
import { Landing } from "./Landing";
import { Searching } from "./Searching";
import { ChatScreen } from "./ChatScreen";
import { ConsentSheet } from "./ConsentSheet";
import { Toast } from "./Toast";

export function ChatApp() {
  const status = useChatStore((s) => s.status);
  const roomId = useChatStore((s) => s.roomId);
  const inChat = status === "connected" || status === "partner_left" || status === "searching";

  // Warn before closing the tab in the middle of a chat.
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (useChatStore.getState().status === "connected") e.preventDefault();
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  return (
    <>
      <MoodBackground seed={roomId ?? "idle"} />
      {inChat ? (
        <div className="mx-auto flex h-dvh max-w-xl flex-col">
          {status === "searching" ? <Searching /> : <ChatScreen />}
        </div>
      ) : (
        <Landing />
      )}
      {status === "consent" && <ConsentSheet />}
      <Toast />
    </>
  );
}
