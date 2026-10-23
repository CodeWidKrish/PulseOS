import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#07090D",
        graphite: "#12161D",
        mist: "#F4F5F7",
        "card-border": "rgba(255, 255, 255, 0.08)",
        pulse: {
          DEFAULT: "#FF4D5E",
          glow: "rgba(255, 77, 94, 0.25)",
          muted: "rgba(255, 77, 94, 0.12)",
        },
        teal: {
          DEFAULT: "#5EE1D2",
          glow: "rgba(94, 225, 210, 0.25)",
          muted: "rgba(94, 225, 210, 0.12)",
        },
        amber: {
          DEFAULT: "#FFB86B",
          muted: "rgba(255, 184, 107, 0.12)",
        },
        text: {
          primary: "#F2F4F7",
          muted: "#8B93A1",
          dark: "#0B0F15",
          "dark-muted": "#5A6270",
        },
      },
      borderRadius: {
        pill: "9999px",
        card: "1.75rem", // 28px
        "card-sm": "1.25rem", // 20px
        control: "0.75rem", // 12px
      },
      boxShadow: {
        "glow-pulse": "0 0 50px -10px rgba(255, 77, 94, 0.25)",
        "glow-teal": "0 0 50px -10px rgba(94, 225, 210, 0.25)",
        "elevation-high": "0 24px 48px -12px rgba(0, 0, 0, 0.70)",
        "elevation-low": "0 8px 24px -6px rgba(0, 0, 0, 0.40)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
