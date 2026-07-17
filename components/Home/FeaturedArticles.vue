<template>
  <section class="bg-cream-deep">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-24 lg:py-28">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-14 sm:mb-16">
        <div class="lg:col-span-7 text-right">
          <div
            class="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-semibold uppercase tracking-wide text-ink-mute mb-5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
            <span>المدوّنة</span>
          </div>

          <h2
            class="font-bold text-ink leading-[1.3] tracking-display text-[30px] sm:text-[40px] lg:text-[48px] mb-5"
          >
            أكتب ما
            <span class="relative inline-block">
              <span class="relative">أتعلّمه</span>
              <span
                class="absolute -inset-x-1 bottom-1 sm:bottom-2 h-2.5 sm:h-3 lg:h-3.5 bg-[#15803D]/10 -z-0"
                aria-hidden="true"
              ></span>
            </span>.
          </h2>

          <p class="text-[15px] sm:text-[17px] text-ink-soft leading-[1.85] max-w-xl">
            ملاحظات قصيرة عن
            <strong class="font-semibold text-ink">بناء المنتجات الرقمية</strong>،
            القرارات التقنية، والشراكة مع المؤسسين.
          </p>
        </div>

        <div class="lg:col-span-5 flex items-end justify-start lg:justify-end">
          <div
            class="inline-flex flex-wrap items-center gap-x-2 gap-y-2 text-[12px] sm:text-[13px]"
          >
            <span
              class="inline-flex items-center gap-1.5 bg-white rounded-full px-3.5 py-1.5 text-ink"
            >
              <span class="w-1 h-1 rounded-full bg-[#15803D]"></span>
              منتجات
            </span>
            <span
              class="inline-flex items-center gap-1.5 bg-white rounded-full px-3.5 py-1.5 text-ink"
            >
              <span class="w-1 h-1 rounded-full bg-[#15803D]"></span>
              تقنية
            </span>
            <span
              class="inline-flex items-center gap-1.5 bg-white rounded-full px-3.5 py-1.5 text-ink"
            >
              <span class="w-1 h-1 rounded-full bg-[#15803D]"></span>
              شراكة
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <AppArticleCard
          v-for="(article, i) in articles"
          :key="i"
          :article="(article as any)"
          :index="i"
        />
      </div>

      <div class="mt-12 text-center">
        <NuxtLink
          to="/articles"
          class="inline-flex items-center gap-2 bg-white hover:bg-cream-deep border border-black/[0.06] text-ink rounded-full px-6 py-3 text-[13px] font-semibold transition-colors"
        >
          كل المقالات
          <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
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
