import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      colors: {
        brand: {
          50:  "#f5f3ff",
          100: "#ede9ff",
          200: "#e0daff",
          300: "#c4bfff",
          400: "#a89cff",
          500: "#7c6ff7",
          600: "#6a5de6",
          700: "#5748cc",
          800: "#4538a8",
          900: "#3d3784",
        },
        surface: "#F4F2FF",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        stepIn: {
          from: { opacity: "0", transform: "translateX(-10px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        float:   "float 3.2s ease-in-out infinite",
        slideUp: "slideUp 0.4s ease forwards",
        fadeIn:  "fadeIn 0.35s ease forwards",
        stepIn:  "stepIn 0.4s ease forwards",
      },
    },
  },
  plugins: [],
};
export default config;
