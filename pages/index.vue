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
const title = "سفيان فارع | مهندس برمجيات ومستشار تقني - تحويل الأفكار إلى منتجات رقمية";
const description = "مهندس برمجيات ومستشار تقني متخصص في بناء المنتجات الرقمية. خبرة في تطوير المواقع والتطبيقات، استشارات تقنية، وتحويل الأفكار إلى حلول ناجحة للشركات والمؤسسات.";

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
    { rel: 'canonical', href: 'https://sufyanfa.com' }
  ]
});
</script>
