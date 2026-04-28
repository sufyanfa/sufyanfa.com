<template>
  <section class="bg-gray-50 border-y border-black/[0.04]">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-24">
      <div class="text-center mb-12">
        <AppEyebrow tone="sage" class="mb-6">من المقالات</AppEyebrow>
        <h2
          class="font-extrabold text-ink leading-tight tracking-h2 text-[28px] sm:text-[36px] lg:text-[38px]"
        >
          من المدونة
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AppArticleCard
          v-for="(article, i) in articles"
          :key="i"
          :article="(article as any)"
          :index="i"
        />
      </div>

      <div class="mt-10 text-center">
        <NuxtLink to="/articles" class="text-sm font-semibold text-ink hover:underline">
          كل المقالات ←
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: articles } = await useAsyncData("articles-home", () =>
  queryContent("/articles")
    .sort({ published: -1 })
    .limit(3)
    .only(["title", "description", "published", "_path"])
    .find()
);
</script>
