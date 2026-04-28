<template>
  <section class="bg-forest text-white">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-24">
      <div class="text-center mb-12">
        <span
          class="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold bg-white/10 text-white/80 mb-6"
        >
          آراء المؤسسين
        </span>
        <h2
          class="font-extrabold text-white leading-tight tracking-h2 text-[28px] sm:text-[36px] lg:text-[38px]"
        >
          ماذا يقول من عمل معي
        </h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article
          v-for="(t, i) in testimonials"
          :key="i"
          class="rounded-3xl p-7 sm:p-8 bg-white text-ink"
        >
          <p class="text-sm sm:text-[15px] text-ink leading-relaxed mb-6">
            &laquo;{{ t.quote }}&raquo;
          </p>
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br from-forest to-forest-deep"
              aria-hidden="true"
            ></div>
            <div>
              <div class="text-[13px] font-bold text-ink">{{ t.name }}</div>
              <div class="text-xs text-forest">{{ t.role }} · {{ t.context }}</div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: testimonials } = await useAsyncData("home-testimonials", () =>
  queryContent("/testimonials").find()
);
</script>
