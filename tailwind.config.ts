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
          deep: "#F6F6F6",
        },
        forest: {
          DEFAULT: "#111111",
          deep: "#000000",
          soft: "#F6F6F6",
        },
        ink: {
          DEFAULT: "#111111",
          soft: "#555555",
          mute: "#888888",
        },
        makoa: {
          bg: "#FFFFFF",
          card: "#F6F6F6",
          cardHover: "#EFEFF1",
          border: "rgba(0, 0, 0, 0.05)",
          text: "#111111",
          secondary: "#555555",
          muted: "#888888",
        },
        success: "#111111",
      },
      fontFamily: {
        sans: ["Thmanyah Sans", "IBM Plex Sans Arabic", "sans-serif"],
        thmanyah: ["Thmanyah Sans", "IBM Plex Sans Arabic", "sans-serif"],
      },
      fontWeight: {
        // Thmanyah Sans only ships 300/400/500/700/900 — no 600. Without this,
        // every `font-semibold` request forces browsers to synthesize a fake
        // bold, which renders as visibly broken/clipped strokes on iOS Safari.
        semibold: "500",
      },
      maxWidth: {
        site: "980px",
        wide: "1160px",
      },
      borderRadius: {
        'card': '20px',
        'container': '24px',
      },
      letterSpacing: {
        normal: "0",
        wide: "0.05em",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
