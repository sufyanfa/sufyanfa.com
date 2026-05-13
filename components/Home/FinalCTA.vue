<template>
  <section class="bg-ink text-white">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-24 sm:py-32">
      <div class="flex flex-col items-center text-center max-w-3xl mx-auto">
        <div class="flex items-center justify-between w-full mb-12 sm:mb-16 text-[11px] font-medium uppercase tracking-wide text-white/40">
          <span>سفيان فارع</span>
          <span>شريك تقني</span>
        </div>

        <div
          class="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-semibold uppercase tracking-wide text-white/60 mb-6"
        >
          <span class="relative flex w-2 h-2">
            <span
              class="absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-60 animate-ping"
            ></span>
            <span class="relative inline-flex rounded-full w-2 h-2 bg-[#22C55E]"></span>
          </span>
          <span>متاح للمشاريع — 2026</span>
        </div>

        <h2
          class="font-bold leading-[1.3] sm:leading-[1.25] tracking-display text-[40px] sm:text-[60px] lg:text-[72px] mb-7"
        >
          خلّينا نبني<br />
          شيئاً
          <span class="relative inline-block">
            <span class="relative">معًا</span>
            <span
              class="absolute -inset-x-1 bottom-1 sm:bottom-2 h-3 sm:h-4 lg:h-5 bg-[#22C55E]/15 -z-0"
              aria-hidden="true"
            ></span>
          </span>.
        </h2>

        <p
          class="text-[15px] sm:text-[17px] text-white/60 leading-relaxed max-w-lg mb-10 sm:mb-12"
        >
          جلسة 30 دقيقة مجانية، نناقش فكرتك ونحدد الخطوة التالية بصراحة.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3 mb-16 sm:mb-20">
          <NuxtLink
            to="https://cal.com/sufyanfa/15min/"
            target="_blank"
            external
            class="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-ink rounded-full px-7 py-4 text-[14px] font-semibold transition-colors"
          >
            احجز جلستك الآن
            <Icon name="lucide:arrow-left" class="w-4 h-4" />
          </NuxtLink>

          <NuxtLink
            to="mailto:hi@sufyanfa.com"
            external
            class="inline-flex items-center gap-2 border border-white/20 hover:border-white/50 text-white rounded-full px-7 py-4 text-[14px] font-semibold transition-colors"
          >
            راسلني مباشرة
          </NuxtLink>
        </div>

        <div class="flex items-center justify-center gap-5 sm:gap-7 text-[13px] text-white/50">
          <a
            v-for="link in links"
            :key="link.label"
            :href="link.url"
            target="_blank"
            rel="noopener"
            class="hover:text-white transition-colors"
          >
            {{ link.label }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const links = [
  { label: "اكس", url: "https://x.com/sufyanfa" },
  { label: "لينكدإن", url: "https://linkedin.com/in/sufyanfa" },
  { label: "جيت‌هَب", url: "https://github.com/sufyanfa" },
  { label: "البريد", url: "mailto:hi@sufyanfa.com" },
];
</script>
