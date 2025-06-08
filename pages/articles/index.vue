<template>
  <main class="min-h-screen">
    <AppHeader class="mb-16" title="المدونة" :description="description" />
    <ul class="space-y-16">
      <li v-for="(article, id) in articles" :key="id">
        <AppArticleCard :article="article" />
      </li>
    </ul>
  </main>
</template>

<script setup>
const description =
  "مقالات حول البرمجة والتصميم وتطوير المنتجات وتجربة المستخدم، بالإضافة إلى مواضيع أخرى تتعلق بالتكنولوجيا والابتكار.";
useSeoMeta({
  title: "المدونة | سفيان فارع",
  description,
});

const { data: articles } = await useAsyncData("all-articles", () =>
  queryContent("/articles").sort({ published: -1 }).find()
);
</script>
