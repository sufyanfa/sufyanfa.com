export default defineNuxtConfig({
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  site: {
    url: 'https://sufyanfa.com',
    name: 'سفيان فارع',
    description: 'مطور ويب ومستشار تقني متخصص في بناء المنتجات الرقمية',
    defaultLocale: 'ar',
    identity: {
      type: 'Person'
    }
  },
  nitro: {
    preset: 'cloudflare-pages',
    externals: {
      inline: ['resend']
    },
    alias: {
      '@react-email/render': 'unenv/runtime/mock/empty'
    },
    prerender: {
      crawlLinks: true,
      failOnError: false,
      ignore: ['/build/ai-agent-v1', '/admin', '/admin/**', '/p/**', '/i/**'],
      routes: [
        '/',
        '/about',
        '/projects',
        '/articles',
        '/bookmarks',
        '/services',
        '/build',
        '/resources',
      ]
    }
  },
  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    sessionSecret: process.env.SESSION_SECRET || 'dev-only-change-me-in-production',
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
    "nuxt-gtag",
    // nitro-cloudflare-dev only wires D1 bindings into the local dev server;
    // including it in production builds leaks vite-node into the Workers
    // bundle and breaks SSR with "undefined.startsWith".
    ...(process.env.NODE_ENV !== "production" ? ["nitro-cloudflare-dev"] : []),
  ],
  // SEO Configuration
  seo: {
    fallbackTitle: false,
  },
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
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
      ],
      script: [
        {
          src: "https://cloud.umami.is/script.js",
          async: true,
          "data-website-id": "0de1b8da-46e2-4a95-b550-425dcf3b2bb3",
        },
      ],
      bodyAttrs: {
        class: "antialiased bg-white text-ink min-h-screen font-rubik",
      },
    },
  },
  content: {
    highlight: {
      theme: "github-dark",
    },
  },
  gtag: {
    id: 'G-WTRJ9XBY85',
  },
  googleFonts: {
    display: "swap",
    download: true,
    families: {
      Rubik: [400, 500, 600, 700, 800],
    },
  },
});