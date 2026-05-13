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
          DEFAULT: "#FFFFFF",
          deep: "#F5F5F7",
        },
        forest: {
          DEFAULT: "#1D1D1F",
          deep: "#000000",
          soft: "#F5F5F7",
        },
        ink: {
          DEFAULT: "#000000",
          soft: "#424245",
          mute: "#6E6E73",
        },
        success: "#166534",
      },
      fontFamily: {
        sans: ["Rubik", "sans-serif"],
        rubik: ["Rubik", "sans-serif"],
      },
      maxWidth: {
        site: "1080px",
      },
      letterSpacing: {
        display: "-0.04em",
        h2: "-0.03em",
        wide: "0.18em",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
