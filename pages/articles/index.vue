<template>
  <main>
    <AppHeader title="المدونة" :description="description" eyebrow="مقالات وأفكار" />

    <section class="bg-gray-50 border-y border-black/[0.04]">
      <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-20">
        <div
          v-if="articles && articles.length"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AppArticleCard
            v-for="(article, id) in articles"
            :key="id"
            :article="(article as any)"
            :index="id"
          />
        </div>
        <p v-else class="text-center text-ink-mute">لا توجد مقالات متاحة في الوقت الحالي.</p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const title = "المدونة | مقالات في تطوير المنتجات | سفيان فارع";
const description =
  "كتابات حديثة في البرمجة، تطوير المنتجات الرقمية، تجربة المستخدم، وريادة الأعمال التقنية.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "https://sufyanfa.com/preview.png",
  ogUrl: "https://sufyanfa.com/articles",
  ogType: "website",
  ogLocale: "ar_SA",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: "https://sufyanfa.com/preview.png",
});

useHead({
  link: [{ rel: "canonical", href: "https://sufyanfa.com/articles" }],
});

const { data: articles } = await useAsyncData("all-articles", () =>
  queryContent("/articles").sort({ published: -1 }).find()
);
</script>
