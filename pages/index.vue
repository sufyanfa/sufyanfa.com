<template>
  <main class="min-h-screen">
    <div class="space-y-12">
      <HomeIntro />
      <HomeCTAButtons />
      <HomeFeaturedServices />
      <HomeFeaturedProjects />
      <HomeFeaturedArticles />
      <HomeSocialLinks />
      <HomeNewsletter />
    </div>
    <HomeProductAlert />
  </main>
</template>

<script setup>
const title = "سفيان فارع | شريك تقني لبناء منتجات رقمية";
const description = "شريك تقني متخصص في بناء منتجات رقمية ناجحة. أساعد رواد الأعمال والشركات في تحويل أفكارهم إلى منتجات رقمية ملموسة من التخطيط إلى الإطلاق.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://sufyanfa.com/preview.png',
  ogUrl: 'https://sufyanfa.com',
  ogType: 'website',
  ogLocale: 'ar_SA',
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: 'https://sufyanfa.com/preview.png',
});

useHead({
  link: [
    { rel: 'canonical', href: 'https://sufyanfa.com' },
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "سفيان فارع",
        "alternateName": "Sufyan Farea",
        "jobTitle": "شريك تقني لبناء منتجات رقمية",
        "description": "شريك تقني متخصص في بناء منتجات رقمية ناجحة. أساعد رواد الأعمال والشركات في تحويل أفكارهم إلى منتجات رقمية ملموسة.",
        "url": "https://sufyanfa.com",
        "image": "https://sufyanfa.com/preview.png",
        "knowsAbout": ["Software Engineering", "Web Development", "Technical Consulting", "Product Development", "Vue.js", "Nuxt", "React", "Node.js"],
        "sameAs": [
          "https://github.com/sufyanfarea",
          "https://twitter.com/sufyanfarea",
          "https://linkedin.com/in/sufyanfarea"
        ]
      })
    }
  ]
});
</script>
