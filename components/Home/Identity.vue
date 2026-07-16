<template>
  <div class="flex flex-col items-center text-center">
    <div class="relative bg-cream-deep rounded-2xl px-4 py-2.5 text-[13px] text-ink-soft leading-snug max-w-[200px] mb-3">
      اختصار للتعرّف عليّ...
      <span
        class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-cream-deep rotate-45"
        aria-hidden="true"
      ></span>
    </div>

    <div
      class="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-cream-deep ring-1 ring-black/[0.04] mb-7"
    >
      <NuxtImg
        src="/sufyan.png"
        alt="سفيان فارع"
        class="w-full h-full object-cover"
        sizes="80px sm:96px"
        format="webp"
        loading="eager"
        fetchpriority="high"
      />
    </div>

    <h1
      class="font-bold text-ink text-[28px] sm:text-[34px] mb-2 tracking-tight"
    >
      سفيان فارع
    </h1>

    <div
      class="inline-flex items-center justify-center gap-2 text-[15px] sm:text-base text-ink-soft mb-7"
    >
      <span>شريك تقني · مطوّر منتجات</span>
      <span
        class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#15803D] text-white text-[9px] font-bold"
        aria-label="موثّق"
      >
        ✓
      </span>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
      <NuxtLink
        to="https://cal.com/sufyanfa/15min/"
        target="_blank"
        external
        class="inline-flex items-center gap-2 bg-ink hover:bg-ink/90 text-white rounded-full px-6 py-3 text-[14px] font-semibold transition-colors"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
        احجز جلسة مجانية ٣٠ دقيقة
      </NuxtLink>

      <a
        href="mailto:hi@sufyanfa.com"
        class="text-[14px] font-medium text-ink hover:opacity-60 transition-opacity inline-flex items-center gap-1.5"
      >
        أو راسلني
        <span class="text-xs">←</span>
      </a>
    </div>
  </div>
</template>
