export type Status =
  | "idle"
  | "consent"
  | "searching"
  | "connected"
  | "partner_left"
  | "banned"
  | "limit"
  | "error";

export type Msg = {
  id: string;
  from: "me" | "them" | "system";
  text: string;
  at: number;
};

export type ReportReason = "spam" | "abuse" | "sexual_content" | "underage" | "scam" | "other";

export type MatchResult =
  | { status: "matched"; room_id: string }
  | { status: "waiting" }
  | { status: "banned" | "limit_reached" | "consent_required" | "idle" };
