<template>
  <div>
    <HomeHero />
    <HomeApproach />
    <HomeProcess />
    <HomeFeaturedProjects />
    <HomeFeaturedArticles />
    <HomeTestimonials />
    <HomeFinalCTA />
  </div>
</template>

<script setup>
const title = "سفيان فارع | أبني منتجات رقمية لرواد الأعمال والمؤسسات";
const description =
  "أحوّل الأفكار إلى منتجات رقمية يستخدمها الناس. خطة واضحة خلال 30 دقيقة، ثم بناء بميزانية ووقت واقعيَّيْن. أكثر من 10 سنوات خبرة مع مؤسسات حكومية، جامعات، وشركات ناشئة.";
const url = "https://sufyanfa.com";
const ogImage = "https://sufyanfa.com/preview.png";
const ogImageAlt = "سفيان فارع، باني منتجات رقمية وشريك تقني";

useSeoMeta({
  title,
  description,
  author: "سفيان فارع",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  ogTitle: title,
  ogDescription: description,
  ogImage,
  ogImageAlt,
  ogImageWidth: 1200,
  ogImageHeight: 630,
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
