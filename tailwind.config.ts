import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Official Nebius brand tokens (extracted from wordmark)
        lime: {
          DEFAULT: "#E0FF4F",
          50: "#FBFFE6",
          100: "#F5FFC2",
          200: "#EFFF92",
          300: "#E8FF66",
          400: "#E0FF4F",
          500: "#D6F73A",
          600: "#B8D420",
          700: "#8FA414",
        },
        navy: {
          DEFAULT: "#052B42",
          50: "#E8EEF3",
          100: "#C6D4DF",
          200: "#9FB4C5",
          300: "#7894AB",
          400: "#516F8B",
          500: "#0E3F5C",
          600: "#073149",
          700: "#052B42",
          800: "#031D2C",
          900: "#020F17",
        },
        ink: {
          DEFAULT: "#0B0E0C",
          50: "#FAFAF7",
          100: "#F4F5F2",
          200: "#E7E8E4",
          300: "#C8CAC4",
          400: "#9FA29B",
          500: "#6E726B",
          600: "#41443E",
          700: "#23251F",
          800: "#13140F",
          900: "#0B0E0C",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      maxWidth: {
        page: "1280px",
      },
      borderRadius: {
        card: "12px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 1px 0 rgba(5,43,66,0.04), 0 12px 32px -16px rgba(5,43,66,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
