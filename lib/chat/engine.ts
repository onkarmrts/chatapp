"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import { checkMessage } from "@/lib/moderation";
import { config } from "@/lib/config";
import { useChatStore } from "./store";
import type { MatchResult, ReportReason } from "@/types";

// Chat engine: module-level state so React re-renders never duplicate sockets.
let uid: string | null = null;
let roomChannel: RealtimeChannel | null = null;
let userChannel: RealtimeChannel | null = null;
let heartbeat: ReturnType<typeof setInterval> | null = null;
let leaveTimer: ReturnType<typeof setTimeout> | null = null;
let joinTimer: ReturnType<typeof setTimeout> | null = null;
let partnerSeen = false;
let lastSent = 0;
let lastTyping = 0;

const state = () => useChatStore.getState();

function fail(e: unknown) {
  const message = e instanceof Error ? e.message : "Something went wrong";
  state().patch({ status: "error", error: message });
}

async function ensureSession(): Promise<string> {
  const sb = getSupabase();
  const { data } = await sb.auth.getSession();
  if (data.session) return data.session.user.id;
  const { data: anon, error } = await sb.auth.signInAnonymously();
  if (error || !anon.user) throw new Error(error?.message ?? "Couldn't start a session");
  return anon.user.id;
}

export async function startChat() {
  try {
    uid = await ensureSession();
    const { data: profile } = await getSupabase()
      .from("profiles")
      .select("age_confirmed_at, gender")
      .eq("id", uid)
      .maybeSingle();
    if (!profile?.age_confirmed_at || !profile?.gender) {
      state().patch({ status: "consent" });
      return;
    }
    await search();
  } catch (e) {
    fail(e);
  }
}

export async function confirmAge(gender: "male" | "female" | "other") {
  try {
    const { error } = await getSupabase().rpc("confirm_age", { p_version: "v1", p_gender: gender });
    if (error) throw error;
    await search();
  } catch (e) {
    fail(e);
  }
}

function handleResult(r: MatchResult | null) {
  if (!r || state().status !== "searching") return;
  switch (r.status) {
    case "matched":
      connect(r.room_id);
      break;
    case "banned":
      stopSearching();
      state().patch({ status: "banned" });
      break;
    case "limit_reached":
      stopSearching();
      state().patch({ status: "limit" });
      break;
    case "consent_required":
      stopSearching();
      state().patch({ status: "consent" });
      break;
  }
}

async function search() {
  cleanupRoom();
  stopSearching();
  state().patch({ status: "searching", roomId: null, messages: [], partnerTyping: false, error: null });
  const sb = getSupabase();
  const { data, error } = await sb.rpc("join_queue", {
    p_pref_gender: state().prefGender,
  });
  if (error) throw error;
  handleResult(data as MatchResult);
  if (state().status !== "searching") return;

  // Push channel: the DB can notify us the moment someone pairs with us.
  userChannel = sb
    .channel(`user:${uid}`)
    .on("broadcast", { event: "matched" }, ({ payload }) => handleResult({ status: "matched", room_id: payload.room_id }))
    .subscribe();

  // Heartbeat keeps us in the queue and retries pairing (covers races and missed pushes).
  heartbeat = setInterval(async () => {
    const { data: r } = await sb.rpc("queue_heartbeat");
    handleResult(r as MatchResult);
  }, config.heartbeatMs);
}

function stopSearching() {
  if (heartbeat) clearInterval(heartbeat);
  heartbeat = null;
  if (userChannel) getSupabase().removeChannel(userChannel);
  userChannel = null;
}

function connect(roomId: string) {
  stopSearching();
  const sb = getSupabase();
  partnerSeen = false;
  state().patch({ status: "connected", roomId, messages: [], partnerTyping: false });
  state().addMessage("system", "You're connected. Say hi!");

  const ch = sb.channel(`room:${roomId}`, {
    config: { broadcast: { self: false }, presence: { key: uid! } },
  });
  ch.on("broadcast", { event: "message" }, ({ payload }) => {
    state().addMessage("them", String(payload.text ?? "").slice(0, config.maxMessageLength));
    state().patch({ partnerTyping: false });
  })
    .on("broadcast", { event: "typing" }, () => {
      state().patch({ partnerTyping: true });
      setTimeout(() => state().patch({ partnerTyping: false }), 2500);
    })
    .on("broadcast", { event: "leave" }, () => partnerLeft())
    .on("presence", { event: "join" }, ({ key }) => {
      if (key !== uid) {
        partnerSeen = true;
        if (leaveTimer) clearTimeout(leaveTimer);
        if (joinTimer) clearTimeout(joinTimer);
      }
    })
    .on("presence", { event: "leave" }, ({ key }) => {
      if (key !== uid) leaveTimer = setTimeout(partnerLeft, config.partnerLeaveGraceMs);
    })
    .subscribe(async (s) => {
      if (s === "SUBSCRIBED") await ch.track({ online: true });
    });
  roomChannel = ch;

  // If the partner never shows up (closed the tab right after matching), end the room.
  joinTimer = setTimeout(() => {
    if (!partnerSeen) partnerLeft();
  }, config.partnerJoinTimeoutMs);
}

function cleanupRoom() {
  if (leaveTimer) clearTimeout(leaveTimer);
  if (joinTimer) clearTimeout(joinTimer);
  leaveTimer = joinTimer = null;
  if (roomChannel) getSupabase().removeChannel(roomChannel);
  roomChannel = null;
}

async function partnerLeft() {
  const { status, roomId } = state();
  if (status !== "connected") return;
  state().patch({ status: "partner_left", partnerTyping: false });
  state().addMessage("system", "Stranger left the chat.");
  cleanupRoom();
  if (roomId) await getSupabase().rpc("close_room", { p_room_id: roomId, p_reason: "disconnect" });
}

export async function nextChat() {
  try {
    const { roomId, status } = state();
    if (roomId && status === "connected") {
      await roomChannel?.send({ type: "broadcast", event: "leave", payload: {} });
    }
    if (roomId) await getSupabase().rpc("close_room", { p_room_id: roomId, p_reason: "next" });
    await search();
  } catch (e) {
    fail(e);
  }
}

export async function cancelSearch() {
  stopSearching();
  await getSupabase().rpc("leave_queue");
  state().patch({ status: "idle" });
}

export function backToStart() {
  cleanupRoom();
  stopSearching();
  state().patch({ status: "idle", roomId: null, messages: [], error: null });
}

export function sendMessage(raw: string): string | null {
  const text = raw.trim().slice(0, config.maxMessageLength);
  if (!text || state().status !== "connected") return null;
  const now = Date.now();
  if (now - lastSent < config.messageIntervalMs) return "Slow down a little.";
  const check = checkMessage(text);
  if (!check.ok) return check.reason;
  lastSent = now;
  roomChannel?.send({ type: "broadcast", event: "message", payload: { text } });
  state().addMessage("me", text);
  return null;
}

export function sendTyping() {
  const now = Date.now();
  if (now - lastTyping < 1500) return;
  lastTyping = now;
  roomChannel?.send({ type: "broadcast", event: "typing", payload: {} });
}

export async function reportPartner(reason: ReportReason, details: string) {
  const { roomId, messages } = state();
  if (!roomId) return;
  const snapshot = messages.filter((m) => m.from !== "system").slice(-30);
  await roomChannel?.send({ type: "broadcast", event: "leave", payload: {} });
  await getSupabase().rpc("report_user", {
    p_room_id: roomId,
    p_reason: reason,
    p_details: details || null,
    p_snapshot: snapshot,
  });
  state().patch({ toast: "Thanks, we're on it." });
  await search();
}

export async function blockPartner() {
  const { roomId } = state();
  if (!roomId) return;
  await roomChannel?.send({ type: "broadcast", event: "leave", payload: {} });
  await getSupabase().rpc("block_user", { p_room_id: roomId });
  state().patch({ toast: "Blocked." });
  await search();
}
