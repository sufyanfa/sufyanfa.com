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
    { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
  ],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "سفيان فارع",
        alternateName: "Sufyan Farea",
        jobTitle: "شريك تقني لبناء منتجات رقمية",
        description,
        url: "https://sufyanfa.com",
        image: "https://sufyanfa.com/preview.png",
        knowsAbout: [
          "Software Engineering",
          "Web Development",
          "Technical Consulting",
          "Product Development",
          "Vue.js",
          "Nuxt",
          "React",
          "Node.js",
        ],
        sameAs: [
          "https://github.com/sufyanfarea",
          "https://twitter.com/sufyanfarea",
          "https://linkedin.com/in/sufyanfarea",
        ],
      }),
    },
  ],
});
</script>
