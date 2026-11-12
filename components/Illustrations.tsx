import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

export function LogoMark(props: P) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden {...props}>
      <circle cx="12" cy="14" r="10" fill="#7C4DFF" />
      <circle cx="21" cy="18" r="10" fill="#FF4F8B" fillOpacity="0.92" />
      <circle cx="16.5" cy="16" r="2.2" fill="#fff" />
    </svg>
  );
}

export function GoogleIcon(props: P) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...props}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const IconShield = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
export const IconMask = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
    <path d="M3 3l18 18" />
    <path d="M10.6 10.6a3 3 0 004.2 4.2" />
    <path d="M9.9 5.1A10.9 10.9 0 0112 5c5 0 9 4 10 7a11 11 0 01-3.2 4.4" />
    <path d="M6.1 6.1A11 11 0 002 12c1 3 5 7 10 7 1.5 0 2.9-.3 4.2-.9" />
  </svg>
);
export const IconUsers = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
    <circle cx="9" cy="8" r="3" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
    <path d="M15.5 15.2c3-.4 5.5 1 5.5 4.3" />
  </svg>
);
export const IconNext = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
    <path d="M5 5l7 7-7 7" />
    <path d="M13 5l7 7-7 7" />
  </svg>
);
export const IconBolt = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
);
export const IconCheck = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const IconChevron = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

function Face({ cx, cy, fill }: { cx: number; cy: number; fill: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="34" fill={fill} />
      <circle cx={cx - 10} cy={cy - 6} r="3.6" fill="#fff" />
      <circle cx={cx + 10} cy={cy - 6} r="3.6" fill="#fff" />
      <path d={`M${cx - 12} ${cy + 8} Q${cx} ${cy + 21} ${cx + 12} ${cy + 8}`} stroke="#fff" strokeWidth="3.2" strokeLinecap="round" fill="none" />
    </g>
  );
}

function Spark({ x, y, s = 1, fill = "#FFB84D" }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10Z"
      fill={fill}
    />
  );
}

// Two strangers, two bubbles, one Next pill.
export function HeroIllustration(props: P) {
  return (
    <svg viewBox="0 0 360 390" role="img" aria-label="Two people chatting with speech bubbles" {...props}>
      <defs>
        <linearGradient id="gBrand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF4F8B" />
          <stop offset="1" stopColor="#FF8A4D" />
        </linearGradient>
        <linearGradient id="gViolet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9B7BFF" />
          <stop offset="1" stopColor="#5B2FE0" />
        </linearGradient>
        <linearGradient id="gMint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3EE6B0" />
          <stop offset="1" stopColor="#1FA6C9" />
        </linearGradient>
        <radialGradient id="gGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#7C4DFF" stopOpacity="0.65" />
          <stop offset="1" stopColor="#7C4DFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="180" cy="195" r="175" fill="url(#gGlow)" />
      <circle cx="180" cy="195" r="128" fill="none" stroke="#fff" strokeOpacity="0.10" strokeDasharray="3 9" strokeWidth="2" />

      <g className="float-a">
        <Face cx={66} cy={96} fill="url(#gViolet)" />
        <rect x="108" y="52" width="206" height="80" rx="26" fill="#F6F3FF" />
        <path d="M112 100 L96 112 L116 118Z" fill="#F6F3FF" />
        <text x="132" y="98" fill="#130B2B" fontSize="19" fontWeight="600">Hi! Kahan se ho?</text>
      </g>

      <g className="float-b">
        <rect x="46" y="170" width="206" height="80" rx="26" fill="url(#gBrand)" />
        <path d="M248 226 L268 238 L244 240Z" fill="#FF7A66" />
        <text x="70" y="216" fill="#fff" fontSize="19" fontWeight="600">Pune se! Tum?</text>
        <Face cx={294} cy={226} fill="url(#gMint)" />
      </g>

      <g className="float-c">
        <circle cx="86" cy="296" r="22" fill="#fff" fillOpacity="0.1" />
        <circle cx="76" cy="296" r="4.5" fill="#F6F3FF" className="dot" />
        <circle cx="88" cy="296" r="4.5" fill="#F6F3FF" className="dot" style={{ animationDelay: "0.2s" }} />
        <circle cx="100" cy="296" r="4.5" fill="#F6F3FF" className="dot" style={{ animationDelay: "0.4s" }} />
      </g>

      <g className="float-a">
        <rect x="150" y="318" width="170" height="52" rx="26" fill="#fff" />
        <text x="190" y="351" fill="#130B2B" fontSize="20" fontWeight="700">Next</text>
        <path d="M262 337 l9 9 -9 9 M274 337 l9 9 -9 9" fill="none" stroke="#FF4F8B" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <Spark x={330} y={40} s={1.2} />
      <Spark x={20} y={190} s={0.8} fill="#3EE6B0" />
      <Spark x={336} y={150} s={0.7} fill="#FF4F8B" />
      <Spark x={30} y={350} s={1} />
    </svg>
  );
}

// Small wave used to separate landing sections.
export function Wave(props: P) {
  return (
    <svg viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden {...props}>
      <path d="M0 30 C 200 70, 400 -10, 600 30 S 1000 70, 1200 30 L1200 60 L0 60Z" fill="currentColor" />
    </svg>
  );
}
