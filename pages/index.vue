<template>
  <div>
    <HomeHero />
    <HomeHighlights />
    <HomeApproach />
    <HomeFeaturedProjects />
    <HomeFeaturedArticles />
    <HomeFinalCTA />
  </div>
</template>

<script setup>
const title = "سفيان فارع | شريك تقني لبناء منتجات رقمية";
const description =
  "شريك تقني لرواد الأعمال - نخرج معًا بخطة واضحة لمنتجك خلال 30 دقيقة، ونبنيه بميزانية ووقت واقعيَّيْن.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "https://sufyanfa.com/preview.png",
  ogUrl: "https://sufyanfa.com",
  ogType: "website",
  ogLocale: "ar_SA",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: "https://sufyanfa.com/preview.png",
});

useHead({
  link: [
    { rel: "canonical", href: "https://sufyanfa.com" },
  ],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "سفيان فارع",
        url: "https://sufyanfa.com",
        description,
        inLanguage: "ar-SA",
        author: {
          "@type": "Person",
          name: "سفيان فارع",
          url: "https://sufyanfa.com",
        },
      }),
    },
  ],
});
</script>
