/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        glacier: "#E8EEF2",
        snow: "#F7FAFC",
        ink: "#0B1220",
        slate: "#3A4658",
        alpine: "#9B1B2E",
        brass: "#A67C52",
        line: "#C5CED6",
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
        display: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Source Sans 3", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
