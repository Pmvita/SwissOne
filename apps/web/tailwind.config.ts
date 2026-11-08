import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        glacier: "var(--glacier)",
        snow: "var(--snow)",
        ink: "var(--ink)",
        slate: "var(--slate)",
        alpine: "var(--alpine)",
        brass: "var(--brass)",
        line: "var(--line)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        // Mapped for existing primary-* class usage across the app
        primary: {
          50: "#F7FAFC",
          100: "#E8EEF2",
          200: "#C5CED6",
          300: "#9AA8B5",
          400: "#6B7A8C",
          500: "#3A4658",
          600: "#2A3545",
          700: "#9B1B2E",
          800: "#7A1524",
          900: "#0B1220",
          950: "#060A12",
        },
        accent: {
          50: "#F7F3EE",
          100: "#EDE4D8",
          200: "#D9C4A8",
          300: "#C4A47A",
          400: "#B89060",
          500: "#A67C52",
          600: "#8A6643",
          700: "#6E5136",
          800: "#523C28",
          900: "#36281B",
          950: "#1C140E",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
      },
    },
  },
  plugins: [],
};

export default config;
