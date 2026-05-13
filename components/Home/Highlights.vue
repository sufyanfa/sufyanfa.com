<template>
  <section class="bg-white">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 pb-16 sm:pb-20">
      <div class="grid grid-cols-3 gap-3 sm:gap-4 mb-14 sm:mb-16">
        <div
          v-for="(item, i) in stats"
          :key="i"
          class="group relative bg-cream-deep rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 text-right border border-transparent hover:border-black/[0.06] hover:bg-white hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] transition-all duration-300"
        >
          <div
            class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-3 sm:mb-4 leading-tight"
          >
            {{ item.label }}
          </div>
          <div
            class="text-3xl sm:text-5xl lg:text-6xl font-bold text-ink leading-none tracking-tight tabular-nums"
          >
            {{ item.value }}
          </div>
        </div>
      </div>

      <div
        class="text-[11px] font-semibold tracking-wide uppercase text-ink-mute mb-6 text-center"
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
              class="block h-7 sm:h-9 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
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
