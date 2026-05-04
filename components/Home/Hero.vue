<template>
  <section
    class="relative bg-cream overflow-hidden min-h-[calc(100svh-68px)] flex items-center"
  >
    <span
      class="hidden sm:block absolute top-20 right-20 text-2xl text-forest/30 select-none pointer-events-none"
      aria-hidden="true"
    >
      ✦
    </span>
    <span
      class="hidden sm:block absolute bottom-32 left-32 text-xl text-forest/25 select-none pointer-events-none"
      aria-hidden="true"
    >
      ✦
    </span>
    <svg
      class="hidden sm:block absolute top-36 left-20 w-12 h-12 opacity-30 pointer-events-none"
      viewBox="0 0 50 50"
      aria-hidden="true"
    >
      <path
        d="M5 25 Q15 5 25 25 T45 25"
        stroke="#3B5A3B"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
      />
    </svg>
    <svg
      class="hidden sm:block absolute bottom-24 right-36 w-16 h-8 opacity-25 pointer-events-none"
      viewBox="0 0 60 30"
      aria-hidden="true"
    >
      <path
        d="M2 20 Q10 5 30 15 T58 10"
        stroke="#3B5A3B"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
      />
    </svg>

    <div
      class="relative w-full max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-10 sm:py-12 text-center"
    >
      <div class="relative w-full max-w-[640px] mx-auto mb-8 sm:mb-10">
        <div class="relative w-full max-w-[240px] sm:max-w-[280px] mx-auto">
          <div
            class="absolute -inset-8 sm:-inset-10 rounded-full pointer-events-none"
            :style="haloStyle"
            aria-hidden="true"
          ></div>

          <div
            class="relative rounded-[28px] sm:rounded-[32px] overflow-hidden aspect-[5/6] bg-cream-deep ring-1 ring-black/[0.04] shadow-[0_20px_50px_-20px_rgba(59,90,59,0.25)]"
          >
            <NuxtImg
              src="/sufyan.jpeg"
              alt="سفيان فارع"
              class="absolute inset-0 w-full h-full object-cover"
              sizes="320px sm:360px"
              format="webp"
              loading="eager"
              fetchpriority="high"
              preload
            />

            <div
              class="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-3.5 py-1.5 text-xs font-semibold text-ink shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              {{ availability }}
            </div>

            <div
              class="absolute top-4 left-4 bg-ink text-white rounded-full px-3 py-1 text-[11px] font-bold tracking-wide"
            >
              +8 سنوات
            </div>
          </div>
        </div>

        <span
          class="hidden lg:inline-flex absolute top-[14%] right-[2%] items-center bg-forest-soft text-forest rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap shadow-sm"
        >
          استراتيجية تقنية
        </span>
        <span
          class="hidden lg:inline-flex absolute top-[48%] left-[2%] items-center bg-forest-soft text-forest rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap shadow-sm"
        >
          تطوير منتجات
        </span>
        <span
          class="hidden lg:inline-flex absolute bottom-[14%] right-[6%] items-center bg-forest-soft text-forest rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap shadow-sm"
        >
          إرشاد المؤسسين
        </span>
      </div>

      <div class="lg:hidden flex flex-wrap items-center justify-center gap-2 mb-8">
        <span class="bg-forest-soft text-forest rounded-full px-3.5 py-1.5 text-xs font-semibold">
          استراتيجية تقنية
        </span>
        <span class="bg-forest-soft text-forest rounded-full px-3.5 py-1.5 text-xs font-semibold">
          تطوير منتجات
        </span>
        <span class="bg-forest-soft text-forest rounded-full px-3.5 py-1.5 text-xs font-semibold">
          إرشاد المؤسسين
        </span>
      </div>

      <h1
        class="font-extrabold text-ink leading-[1.15] tracking-display text-[34px] sm:text-[44px] lg:text-[54px] mb-5"
      >
        من فكرة على ورقة،<br />
        إلى منتج
        <span class="relative inline-block">
          يستخدمه الناس
          <svg
            class="absolute -bottom-2 -right-1.5 w-[calc(100%+12px)] h-3.5"
            viewBox="0 0 200 14"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M2 10 Q50 2 100 8 T198 6"
              stroke="#3B5A3B"
              stroke-width="2.5"
              fill="none"
              stroke-linecap="round"
            />
          </svg>
        </span>
        .
      </h1>

      <p class="text-base sm:text-lg leading-relaxed text-ink-soft max-w-xl mx-auto mb-7 sm:mb-8">
        شريك تقني لرواد الأعمال - نخرج معًا بخطة واضحة لمنتجك خلال 30 دقيقة، ونبنيه بميزانية ووقت
        واقعيَّيْن.
      </p>

      <AppPillButton
        to="https://cal.com/sufyanfa/15min/"
        external
        size="md"
        tone="ink"
      >
        احجز جلسة مجانية 30 دقيقة
      </AppPillButton>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    availability?: string;
  }>(),
  {
    availability: "متاح لمشاريع مُختارة",
  }
);

const haloStyle = {
  background:
    "radial-gradient(circle, rgba(59,90,59,0.18) 0%, rgba(59,90,59,0) 65%)",
};
</script>
