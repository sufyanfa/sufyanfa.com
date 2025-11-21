<template>
  <main class="min-h-screen">
    <AppHeader class="mb-16" title="المدونة" :description="description" />
    <ul class="space-y-16" v-if="articles && articles.length">
      <li v-for="(article, id) in articles" :key="id">
        <AppArticleCard :article="article" />
      </li>
    </ul>
    <p v-else class="text-center text-gray-500">
      لا توجد مقالات متاحة في الوقت الحالي.
    </p>
  </main>
</template>

<script setup>
const title = "المدونة | مقالات عن البرمجة وتطوير المنتجات | سفيان فارع";
const description = "مقالات تقنية متخصصة: البرمجة، تطوير المنتجات الرقمية، تجربة المستخدم، ريادة الأعمال التقنية. رؤى وخبرات عملية في بناء المنتجات الناجحة.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://sufyanfa.com/preview.png',
  ogUrl: 'https://sufyanfa.com/articles',
  ogType: 'website',
  ogLocale: 'ar_SA',
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: 'https://sufyanfa.com/preview.png',
});

useHead({
  link: [
    { rel: 'canonical', href: 'https://sufyanfa.com/articles' }
  ]
});

const { data: articles } = await useAsyncData("all-articles", () =>
  queryContent("/articles").sort({ published: -1 }).find()
);
</script>
