import { create } from "zustand";
import type { Msg, Status } from "@/types";

export type PrefGender = "any" | "male" | "female";

// crypto.randomUUID only works on HTTPS/localhost, so fall back on plain http (phone over Wi-Fi).
const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

type ChatState = {
  status: Status;
  roomId: string | null;
  messages: Msg[];
  partnerTyping: boolean;
  error: string | null;
  toast: string | null;
  prefGender: PrefGender;
  patch: (p: Partial<Omit<ChatState, "patch" | "addMessage">>) => void;
  addMessage: (from: Msg["from"], text: string) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  status: "idle",
  roomId: null,
  messages: [],
  partnerTyping: false,
  error: null,
  toast: null,
  prefGender: "any",
  patch: (p) => set(p),
  addMessage: (from, text) =>
    set((s) => ({
      messages: [...s.messages, { id: makeId(), from, text, at: Date.now() }],
    })),
}));