export const config = {
  appName: "Drift", // placeholder: rename anywhere
  tagline: "Talk to someone new.",
  maxMessageLength: 500,
  messageIntervalMs: 1000, // max 1 message per second
  partnerLeaveGraceMs: 10_000,
  partnerJoinTimeoutMs: 15_000,
  heartbeatMs: 4_000,
  features: {
    // Gender preference is free while payments are off. Set true when Pro launches.
    lockGenderFilterBehindPro: false,
  },
} as const;
