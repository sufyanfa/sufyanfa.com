export default defineNuxtConfig({
  devtools: { enabled: true },
  nitro: {
    preset: 'cloudflare-pages',
    externals: {
      inline: ['resend']
    },
    alias: {
      '@react-email/render': 'unenv/runtime/mock/empty'
    }
  },
  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
  },
  modules: [
    "@nuxt/ui",
    "nuxt-icon",
    "@nuxtjs/google-fonts",
    "@nuxtjs/fontaine",
    "@nuxt/image",
    "@nuxt/content",
    "@nuxthq/studio",
    "@vueuse/nuxt",
    "@nuxtjs/seo",
    "motion-v/nuxt",
  ],
  ui: {
    icons: ["heroicons", "lucide"],
  },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      htmlAttrs: {
        lang: "ar",
        dir: "rtl",
        class: "h-full",
      },
      script: [
        {
          src: "https://cloud.umami.is/script.js",
          async: true,
          "data-website-id": "0de1b8da-46e2-4a95-b550-425dcf3b2bb3",
        },
      ],
      bodyAttrs: {
        class: "antialiased bg-gray-50 dark:bg-black min-h-screen font-rubik",
      },
    },
  },
  content: {
    highlight: {
      theme: "github-dark",
    },
  },
  googleFonts: {
    display: "swap",
    download: true,
    families: {
      Inter: [400, 500, 600, 700, 800, 900],
      Rubik: [400, 500, 600, 700, 800, 900],
    },
  },
});