<template>
  <main class="min-h-screen">
    <AppHeader class="mb-12" title="الخدمات" :description="description" />
    <div class="space-y-8">
      <AppServiceCTA
        v-for="(service, id) in services"
        :key="id"
        :service="service"
      />
    </div>
  </main>
</template>

<script setup>
const title = "الخدمات التقنية | تطوير المواقع والتطبيقات | سفيان فارع";
const description = "خدمات تقنية متكاملة: تطوير المواقع والتطبيقات، استشارات تقنية، تطوير MVP، إرشاد ريادة الأعمال. حلول مخصصة لتحويل فكرتك إلى منتج رقمي ناجح.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://sufyanfa.com/preview.png',
  ogUrl: 'https://sufyanfa.com/services',
  ogType: 'website',
  ogLocale: 'ar_SA',
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: 'https://sufyanfa.com/preview.png',
});

useHead({
  link: [
    { rel: 'canonical', href: 'https://sufyanfa.com/services' }
  ]
});

const { data: services } = await useAsyncData("services-all", () =>
  queryContent("/services").find()
);
</script>
