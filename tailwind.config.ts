import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#130B2B",      // deep midnight indigo (base)
        mist: "#F6F3FF",     // soft lavender white (text)
        glass: "rgba(255,255,255,0.08)",
        violet: "#7C4DFF",   // primary brand
        rose: "#FF4F8B",     // energy / CTA
        amber: "#FFB84D",    // warm highlight
        mint: "#3EE6B0",     // "online" and success
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
      borderRadius: { pill: "999px" },
      backgroundImage: {
        brand: "linear-gradient(135deg, #FF4F8B 0%, #FF8A4D 100%)",
      },
      boxShadow: {
        glow: "0 10px 40px -10px rgba(255,79,139,0.65)",
      },
    },
  },
  plugins: [],
};
export default config;
