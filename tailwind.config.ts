import type { Config } from "tailwindcss";

/**
 * Padosi Admin — brand tokens mirror the Flutter app so the
 * customer / partner / admin surfaces all read as the same product.
 *
 *   primary       tangerine (#FF5630) — CTAs, accents
 *   primary-soft  pastel peach        — chips, hover
 *   ink           near-black          — body type, sidebar bg
 *   muted         neutral grey        — secondary text
 *   cream         soft warm bg        — canvas
 *   line          hairline border
 *   success       deep green
 *   error         red
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FAF7F1",
        surface: "#FFFFFF",
        cream: "#F4EFE0",
        ink: "#16181D",
        "ink-soft": "#41454F",
        muted: "#8B8E97",
        line: "#E9E3D6",
        primary: {
          DEFAULT: "#FF5630",
          dark: "#E04420",
          soft: "#FFE8DF",
        },
        secondary: {
          DEFAULT: "#2A6F97",
          soft: "#E3F0F8",
        },
        success: {
          DEFAULT: "#2E7D32",
          soft: "#E2F1E3",
        },
        warn: "#E6A100",
        error: "#D14343",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 4px 18px 0 rgba(22, 24, 29, 0.04)",
        lift: "0 12px 28px -8px rgba(22, 24, 29, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
