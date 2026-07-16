<template>
  <NuxtLoadingIndicator color="#15803D" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const SITE_URL = "https://sufyanfa.com";
const SITE_DESC = "شريك تقني لرواد الأعمال في السعودية. أبني منتجات رقمية واضحة الهدف بميزانية ووقت واقعيَّيْن.";

useSeoMeta({
  ogSiteName: "سفيان فارع",
  ogLocale: "ar_SA",
  twitterSite: "@sufyanfa",
  twitterCreator: "@sufyanfa",
});

useHead({
  htmlAttrs: { lang: "ar", dir: "rtl" },
  link: [
    { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
    { rel: "apple-touch-icon", href: "/sufyan.png" },
    { rel: "manifest", href: "/site.webmanifest" },
    { rel: "preconnect", href: "https://cloud.umami.is" },
    { rel: "dns-prefetch", href: "https://cloud.umami.is" },
  ],
  meta: [
    { name: "theme-color", content: "#FFFFFF", media: "(prefers-color-scheme: light)" },
    { name: "theme-color", content: "#000000", media: "(prefers-color-scheme: dark)" },
    { name: "format-detection", content: "telephone=no" },
  ],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Person",
            "@id": `${SITE_URL}/#person`,
            name: "سفيان فارع",
            alternateName: "Sufyan Farea",
            jobTitle: "شريك تقني لبناء منتجات رقمية",
            description: SITE_DESC,
            url: SITE_URL,
            image: `${SITE_URL}/sufyan.png`,
            email: "mailto:hi@sufyanfa.com",
            address: {
              "@type": "PostalAddress",
              addressCountry: "SA",
              addressRegion: "Riyadh",
            },
            sameAs: [
              "https://x.com/sufyanfa",
              "https://www.linkedin.com/in/sufyanfa/",
              "https://github.com/sufyanfa",
            ],
            knowsAbout: [
              "Software Engineering",
              "Web Development",
              "Technical Consulting",
              "Product Development",
              "MVP Development",
              "Saudi Arabia Startups",
            ],
            worksFor: { "@id": `${SITE_URL}/#service` },
          },
          {
            "@type": "ProfessionalService",
            "@id": `${SITE_URL}/#service`,
            name: "سفيان فارع — شريك تقني",
            url: SITE_URL,
            image: `${SITE_URL}/preview.png`,
            description: SITE_DESC,
            priceRange: "$$",
            areaServed: { "@type": "Country", name: "Saudi Arabia" },
            serviceType: [
              "تطوير منتج جديد (MVP)",
              "تطوير منتج قائم",
              "استشارة تقنية موجَّهة",
            ],
            provider: { "@id": `${SITE_URL}/#person` },
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "Sales",
              email: "hi@sufyanfa.com",
              url: "https://cal.com/sufyanfa/15min/",
              availableLanguage: ["Arabic", "English"],
            },
            offers: {
              "@type": "Offer",
              name: "جلسة استكشاف مجانية",
              price: "0",
              priceCurrency: "SAR",
              url: "https://cal.com/sufyanfa/15min/",
              availability: "https://schema.org/InStock",
            },
          },
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            url: SITE_URL,
            name: "سفيان فارع",
            description: SITE_DESC,
            inLanguage: "ar-SA",
            publisher: { "@id": `${SITE_URL}/#person` },
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_URL}/?q={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          },
        ],
      }),
    },
  ],
});
</script>

<style>
body {
  font-family: "Rubik", sans-serif;
}
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
</style>
