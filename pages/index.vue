<template>
  <div>
    <HomeHero />
    <HomeApproach />
    <HomeFeaturedProjects />
    <HomeFeaturedArticles />
    <HomeFinalCTA />
  </div>
</template>

<script setup>
const title = "سفيان فارع | شريك تقني لرواد الأعمال في السعودية";
const description =
  "شريك تقني لرواد الأعمال — نخرج معًا بخطة واضحة لمنتجك خلال 30 دقيقة، ونبنيه بميزانية ووقت واقعيَّيْن. خبرة +8 سنوات مع مؤسسات حكومية، جامعات، وشركات ناشئة.";
const url = "https://sufyanfa.com";
const ogImage = "https://sufyanfa.com/preview.png";
const ogImageAlt = "سفيان فارع — شريك تقني لبناء منتجات رقمية";

useSeoMeta({
  title,
  description,
  author: "سفيان فارع",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  ogTitle: title,
  ogDescription: description,
  ogImage,
  ogImageAlt,
  ogImageWidth: 1905,
  ogImageHeight: 767,
  ogImageType: "image/png",
  ogUrl: url,
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: ogImage,
  twitterImageAlt: ogImageAlt,
});

useHead({
  link: [
    { rel: "canonical", href: url },
    { rel: "alternate", hreflang: "ar", href: url },
    { rel: "alternate", hreflang: "x-default", href: url },
  ],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "الرئيسية",
            item: url,
          },
        ],
      }),
    },
  ],
});
</script>
