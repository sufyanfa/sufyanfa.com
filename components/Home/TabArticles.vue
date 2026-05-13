<template>
  <div>
    <div
      class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-6"
    >
      الكتابة
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <AppArticleCard
        v-for="(article, i) in articles"
        :key="i"
        :article="(article as any)"
        :index="i"
      />
    </div>

    <div class="mt-10 text-center">
      <NuxtLink
        to="/articles"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:opacity-60 transition-opacity"
      >
        كل المقالات
        <span class="text-xs">←</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: articles } = await useAsyncData("home-tab-articles", () =>
  queryContent("/articles")
    .sort({ published: -1 })
    .limit(4)
    .only(["title", "description", "published", "_path"])
    .find()
);
</script>
