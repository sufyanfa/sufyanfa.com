<template>
  <section class="relative bg-cream overflow-hidden">
    <span
      class="hidden sm:block absolute top-12 right-[12%] text-2xl text-forest/30 select-none pointer-events-none"
      aria-hidden="true"
    >
      ✦
    </span>
    <span
      class="hidden sm:block absolute bottom-16 left-[10%] text-xl text-forest/25 select-none pointer-events-none"
      aria-hidden="true"
    >
      ✦
    </span>
    <svg
      class="hidden sm:block absolute bottom-20 right-[8%] w-14 h-7 opacity-25 pointer-events-none"
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
      class="relative max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-24 text-center"
    >
      <h2
        class="font-extrabold text-ink leading-[1.2] tracking-display text-[32px] sm:text-[40px] lg:text-[48px] mb-5"
      >
        جاهز نتحدث؟
      </h2>
      <p class="text-base sm:text-[17px] text-ink-soft leading-relaxed max-w-lg mx-auto mb-8">
        جلسة 30 دقيقة، نناقش فكرتك ونحدد الخطوة التالية.
      </p>
      <AppPillButton to="https://cal.com/sufyanfa/15min/" external size="lg" tone="ink">
        احجز جلستك الآن
      </AppPillButton>
    </div>
  </section>
</template>
