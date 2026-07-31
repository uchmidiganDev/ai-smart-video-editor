import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#07070b",
          900: "#0a0a10",
          850: "#0d0d15",
          800: "#12121c",
          700: "#1a1a28",
          600: "#26263a",
        },
        accent: {
          violet: "#8b5cf6",
          fuchsia: "#d946ef",
          cyan: "#22d3ee",
          blue: "#3b82f6",
        },
        signal: {
          success: "#34d399",
          warning: "#fbbf24",
          danger: "#fb7185",
        },
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #8b5cf6 0%, #d946ef 55%, #22d3ee 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(217,70,239,0.14) 55%, rgba(34,211,238,0.16) 100%)",
        "radial-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(139,92,246,0.25) 0%, rgba(7,7,11,0) 70%)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0,0,0,0.35)",
        "glow-violet": "0 0 40px -8px rgba(139,92,246,0.55)",
        "glow-cyan": "0 0 40px -8px rgba(34,211,238,0.45)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer: "shimmer 2.2s linear infinite",
        "spin-slow": "spin 6s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
