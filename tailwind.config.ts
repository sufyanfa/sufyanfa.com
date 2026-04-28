import type { Config } from "tailwindcss";
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#F4F1EA",
          deep: "#E5DFD0",
        },
        forest: {
          DEFAULT: "#3B5A3B",
          deep: "#2A4128",
          soft: "#E4ECE0",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          soft: "#5A5650",
          mute: "#857F75",
        },
        success: "#16A34A",
      },
      fontFamily: {
        sans: ["Rubik", "Inter", "sans-serif"],
        rubik: ["Rubik", "sans-serif"],
      },
      maxWidth: {
        site: "1080px",
      },
      letterSpacing: {
        display: "-0.035em",
        h2: "-0.025em",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
