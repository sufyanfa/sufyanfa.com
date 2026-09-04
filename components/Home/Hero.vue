<template>
  <section class="relative bg-white border-b border-black/[0.04]">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-12 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <!-- Content Column (Starts right in RTL) -->
        <div class="order-2 lg:order-1 lg:col-span-7 text-right">
          <!-- Eyebrow Tag -->
          <div class="inline-flex items-center gap-2 bg-cream-deep border border-black/[0.04] rounded-full px-3.5 py-1.5 text-xs font-semibold text-ink-soft mb-6">
            <span class="w-1.5 h-1.5 rounded-full bg-ink"></span>
            <span>سفيان فارع · أبني منتجات رقمية </span>
          </div>

          <!-- Main Heading -->
          <h1 class="text-3xl sm:text-4xl lg:text-[46px] font-bold text-ink !leading-[1.55] mb-5 tracking-tight">
           أحوّل الفكرة إلى منتج
          </h1>

          <!-- Bio / Tagline -->
          <p class="text-[16px] sm:text-[17px] text-ink-soft leading-[1.8] max-w-xl mb-8">
           أساعد رواد الأعمال والمؤسسات على تحويل الأفكار إلى منتجات رقمية واضحة، قابلة للتنفيذ والنمو - من الفكرة حتى الإطلاق.
          </p>

          <!-- Proof Stats -->
          <div class="grid grid-cols-4 gap-3 sm:gap-5 mb-8 pb-8 border-b border-black/[0.06]">
            <div>
              <div class="text-lg sm:text-2xl font-bold text-ink">250K+</div>
              <div class="text-[10px] sm:text-xs text-ink-mute leading-snug">مستخدم</div>
            </div>
            <div>
              <div class="text-lg sm:text-2xl font-bold text-ink">700K+</div>
              <div class="text-[10px] sm:text-xs text-ink-mute leading-snug">معاملة</div>
            </div>
            <div>
              <div class="text-lg sm:text-2xl font-bold text-ink">25+</div>
              <div class="text-[10px] sm:text-xs text-ink-mute leading-snug">جهة</div>
            </div>
            <div>
              <div class="text-lg sm:text-2xl font-bold text-ink">8+</div>
              <div class="text-[10px] sm:text-xs text-ink-mute leading-snug">سنوات خبرة</div>
            </div>
          </div>

          <!-- CTA Actions -->
          <div class="flex flex-wrap items-center gap-3">
            <NuxtLink
              to="https://cal.com/sufyanfa/15min/"
              target="_blank"
              external
              data-umami-event="cta-book-call"
              data-umami-event-position="hero"
              class="inline-flex items-center gap-2 bg-ink hover:bg-black text-white rounded-full px-7 py-3.5 text-sm font-semibold transition-all shadow-sm"
            >
              <span>احجز جلسة 30 دقيقة</span>
              <Icon name="lucide:arrow-left" class="w-4 h-4" />
            </NuxtLink>

            <NuxtLink
              to="/projects"
              data-umami-event="cta-view-projects"
              data-umami-event-position="hero"
              class="inline-flex items-center gap-2 border border-black/25 hover:border-black/50 active:bg-cream-deep bg-transparent text-ink rounded-full px-7 py-3.5 text-sm font-medium transition-all hover:bg-cream-deep"
            >
              <span>استكشف أعمالي</span>
              <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
            </NuxtLink>
          </div>
        </div>

        <!-- Photo Column (Left in RTL, Top on Mobile) -->
        <div class="order-1 lg:order-2 lg:col-span-5 flex justify-center lg:justify-end">
          <div class="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[340px]">
            <div
              class="relative aspect-[4/5] rounded-[28px] overflow-hidden bg-cream-deep border border-black/[0.06] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)]"
            >
              <NuxtImg
                src="/sufyan.png"
                alt="سفيان فارع — شريك تقني"
                class="w-full h-full object-cover object-top"
                sizes="320px sm:400px"
                format="webp"
                loading="eager"
                fetchpriority="high"
                preload
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Client / Partner Logos Marquee -->
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-12 pb-14 sm:pb-16">
      <div class="text-[11px] font-semibold tracking-wider uppercase text-ink-mute mb-6 text-center">
       خبرات ومشاريع مع جهات مختلفة
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
              class="block h-7 sm:h-8 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
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
  animation: trusted-by-scroll-animation 35s linear infinite;
  will-change: transform;
}
.trusted-by-scroll:hover {
  animation-play-state: paused;
}
</style>
