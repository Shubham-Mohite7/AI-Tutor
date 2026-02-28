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
          50:  "#CAF4FF",  // Changed from FFF9D0
          100: "#CAF4FF", // Test background upper  
          200: "#A0DEFF", // Fixed background lower
          300: "#B8E0F7",
          400: "#4CC9FE",
          500: "#5AB2FF", // Logo, highlighted text, try now button
          600: "#4A9FEF",
          700: "#3A8CDF",
          800: "#2A79CF",
          900: "#1A69BF",
        },
        surface: "#CAF4FF", // Changed from FFF9D0
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
