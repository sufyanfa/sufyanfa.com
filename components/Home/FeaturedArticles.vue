<template>
  <section class="bg-white py-16 sm:py-20 lg:py-24 border-b border-black/[0.04]">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-12">
      <!-- Section Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-14">
        <div class="text-right max-w-xl">
          <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-mute mb-3">
            <span class="w-1.5 h-1.5 rounded-full bg-ink"></span>
            <span>المدوّنة</span>
          </div>

          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink !leading-tight mb-3">
            من ملاحظاتي في بناء المنتجات
          </h2>

          <p class="text-[15px] sm:text-[16px] text-ink-soft leading-relaxed">
            ملاحظات من تجربتي في بناء المنتجات: قرارات هندسية، وشراكة مع المؤسسين.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink
            to="/articles"
            class="inline-flex items-center gap-2 border border-black/20 hover:border-black/45 active:bg-cream-deep rounded-full px-5 py-2 text-xs font-medium text-ink transition-all hover:bg-cream-deep"
          >
            <span>كل المقالات</span>
            <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
      </div>

      <!-- Articles Stacked List -->
      <div class="flex flex-col gap-4">
        <AppArticleCard
          v-for="(article, i) in articles"
          :key="i"
          :article="(article as any)"
          :index="i"
        />
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
