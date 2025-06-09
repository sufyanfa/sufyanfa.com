export default defineNuxtConfig({
  devtools: { enabled: true },
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
        class: "antialiased bg-gray-50 dark:bg-black min-h-screen font-sans",
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
    families: {
      Inter: [400, 500, 600, 700, 800, 900],
    },
  },
});