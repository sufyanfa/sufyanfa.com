<template>
  <section class="bg-white border-y border-black/[0.04]">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-10 sm:py-12">
      <div class="grid grid-cols-3 gap-6 sm:gap-8 text-center mb-9 sm:mb-10">
        <div v-for="(item, i) in stats" :key="i">
          <div
            class="text-2xl sm:text-3xl font-extrabold text-ink leading-none mb-1.5 tracking-h2"
          >
            {{ item.value }}
          </div>
          <div class="text-[11px] sm:text-xs text-ink-soft">{{ item.label }}</div>
        </div>
      </div>

      <div
        class="text-center text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-mute mb-5"
      >
        بنيت لهم
      </div>

      <div class="relative overflow-hidden" dir="ltr">
        <div class="trusted-by-scroll inline-flex items-center gap-10 sm:gap-14">
          <div
            v-for="(company, index) in [...companies, ...companies]"
            :key="`${company.name}-${index}`"
            class="flex-shrink-0"
          >
            <img
              :src="company.logo"
              :alt="`شعار ${company.name}`"
              class="block h-8 sm:h-10 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data } = await useAsyncData("home-stats", () =>
  queryContent("/stats").findOne()
);
const stats = computed(() => (data.value as any)?.items ?? []);

const companies = [
  { name: "هيئة تطوير منطقة عسير", logo: "/companies/asser.svg" },
  { name: "مجلس الجمعيات الأهلية", logo: "/companies/ccsa.svg" },
  { name: "إمارة منطقة عسير", logo: "/companies/assir.svg" },
  { name: "هيئة الغذاء والدواء", logo: "/companies/sfda.svg" },
  { name: "جامعة الملك خالد", logo: "/companies/kku.svg" },
  { name: "الهيئة الملكية للجبيل وينبع", logo: "/companies/rcjy.svg" },
  { name: "جامعة الملك فهد للبترول والمعادن", logo: "/companies/kfupm.svg" },
  { name: "تراحم", logo: "/companies/trahum.svg" },
];
</script>

<style scoped>
@keyframes trusted-by-scroll-animation {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
.trusted-by-scroll {
  animation: trusted-by-scroll-animation 40s linear infinite;
  will-change: transform;
}
.trusted-by-scroll:hover {
  animation-play-state: paused;
}
</style>
