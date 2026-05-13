<template>
  <section class="relative bg-white overflow-hidden">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-16">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <div class="order-2 lg:order-1 lg:col-span-7 text-right">
          <div
            class="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-semibold uppercase tracking-wide text-ink-mute mb-5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
            <span>أهلًا، أنا سفيان</span>
          </div>

          <h1
            class="font-bold text-ink leading-[1.3] tracking-display text-[30px] sm:text-[40px] lg:text-[48px] mb-7"
          >
            شريكك التقني لبناء<br />
            منتج
            <span class="relative inline-block">
              <span class="relative">يستخدمه الناس</span>
              <span
                class="absolute -inset-x-1 bottom-1 sm:bottom-2 h-2.5 sm:h-3 lg:h-3.5 bg-[#15803D]/10 -z-0"
                aria-hidden="true"
              ></span>
            </span>
            .
          </h1>

          <p
            class="text-[15px] sm:text-[17px] text-ink-soft leading-[1.85] max-w-xl mb-9"
          >
            أساعد رواد الأعمال على بناء منتجاتهم الرقمية —
            <strong class="font-semibold text-ink">خطة واضحة خلال 30 دقيقة</strong>،
            ثم تنفيذ بميزانية ووقت واقعيَّيْن.
          </p>

          <div class="flex flex-wrap items-center gap-3">
            <NuxtLink
              to="https://cal.com/sufyanfa/15min/"
              target="_blank"
              external
              class="inline-flex items-center gap-2 bg-ink hover:bg-ink/90 text-white rounded-full px-7 py-4 text-[14px] font-semibold transition-colors"
            >
              احجز جلسة مجانية
              <Icon name="lucide:arrow-left" class="w-4 h-4" />
            </NuxtLink>

            <NuxtLink
              to="/services"
              class="inline-flex items-center bg-white hover:bg-cream-deep border border-black/[0.08] text-ink rounded-full px-7 py-4 text-[14px] font-semibold transition-colors"
            >
              الخدمات
            </NuxtLink>
          </div>
        </div>

        <div class="order-1 lg:order-2 lg:col-span-5">
          <div class="relative max-w-[260px] sm:max-w-[340px] lg:max-w-[420px] mx-auto lg:mx-0">
            <div
              class="absolute inset-0 rounded-3xl sm:rounded-[28px] bg-gradient-to-br from-[#DCFCE7] via-[#E5F7EA] to-[#F0FDF4] -rotate-2"
              aria-hidden="true"
            ></div>

            <div
              class="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-ink text-white flex items-center justify-center text-xl sm:text-2xl shadow-[0_8px_24px_rgba(0,0,0,0.16)] rotate-12"
              aria-hidden="true"
            >
              ✦
            </div>

            <button
              type="button"
              class="flip-card relative w-full aspect-[4/5] [perspective:1400px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] rounded-2xl sm:rounded-3xl"
              :aria-pressed="flipped"
              aria-label="اقلب البطاقة"
              @click="flipped = !flipped"
            >
              <div
                class="flip-inner relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]"
                :class="{ '[transform:rotateY(180deg)]': flipped }"
              >
                <div
                  class="flip-face absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-cream-deep ring-1 ring-black/[0.04] shadow-[0_24px_56px_-16px_rgba(0,0,0,0.18)] [backface-visibility:hidden]"
                >
                  <NuxtImg
                    src="/sufyan.jpeg"
                    alt="سفيان فارع"
                    class="absolute inset-0 w-full h-full object-cover grayscale"
                    sizes="320px sm:400px lg:440px"
                    format="webp"
                    loading="eager"
                    fetchpriority="high"
                    preload
                  />

                  <div
                    class="absolute top-4 right-4 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-ink shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                    aria-hidden="true"
                  >
                    <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" />
                  </div>

                  <div
                    class="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full px-4 py-2 text-[12px] font-medium text-ink shadow-[0_4px_16px_rgba(0,0,0,0.12)] whitespace-nowrap"
                  >
                    <span class="w-2 h-2 rounded-full bg-success"></span>
                    متاح لمشاريع مُختارة
                  </div>
                </div>

                <div
                  class="flip-face absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-ink text-white shadow-[0_24px_56px_-16px_rgba(0,0,0,0.18)] p-7 sm:p-8 flex flex-col [backface-visibility:hidden] [transform:rotateY(180deg)]"
                >
                  <div class="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-white/40">
                    <span>خلف الكاميرا</span>
                    <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" />
                  </div>

                  <div class="flex-1 flex items-center text-right">
                    <p class="text-base sm:text-lg lg:text-xl font-medium leading-[1.7]">
                      أبني المنتجات الرقمية
                      <br />
                      من
                      <span class="text-[#15803D] font-semibold">السعودية</span>،
                      لرواد الأعمال في المنطقة.
                    </p>
                  </div>

                  <img
                    src="/saudi.svg"
                    alt="صنع في السعودية"
                    class="h-10 sm:h-12 w-auto self-start brightness-0 invert"
                  />
                </div>
              </div>
            </button>

            <div
              class="hidden sm:flex absolute top-6 -right-6 lg:-right-10 items-center gap-3 rounded-xl px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] border max-w-[220px] transition-colors duration-700"
              :class="
                flipped
                  ? 'bg-ink border-white/[0.08]'
                  : 'bg-white border-black/[0.04]'
              "
            >
              <div
                class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-700"
                :class="
                  flipped
                    ? 'bg-[#15803D]/25 text-[#22C55E]'
                    : 'bg-[#15803D]/10 text-[#15803D]'
                "
              >
                <Icon name="lucide:zap" class="w-4 h-4" />
              </div>
              <div class="text-right">
                <div
                  class="text-[10px] font-medium uppercase tracking-wide mb-0.5 transition-colors duration-700"
                  :class="flipped ? 'text-white/40' : 'text-ink-mute'"
                >
                  +8 سنوات خبرة
                </div>
                <div
                  class="text-[13px] font-bold leading-tight transition-colors duration-700"
                  :class="flipped ? 'text-white' : 'text-ink'"
                >
                  شريك تقني
                </div>
              </div>
            </div>

            <div
              class="hidden sm:flex absolute bottom-10 -left-6 lg:-left-10 items-center gap-3 rounded-xl px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] border max-w-[220px] transition-colors duration-700"
              :class="
                flipped
                  ? 'bg-ink border-white/[0.08]'
                  : 'bg-white border-black/[0.04]'
              "
            >
              <div
                class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-700"
                :class="
                  flipped
                    ? 'bg-white/[0.12] text-white'
                    : 'bg-ink/[0.06] text-ink'
                "
              >
                <Icon name="lucide:code-2" class="w-4 h-4" />
              </div>
              <div class="text-right">
                <div
                  class="text-[10px] font-medium uppercase tracking-wide mb-0.5 transition-colors duration-700"
                  :class="flipped ? 'text-white/40' : 'text-ink-mute'"
                >
                  +12 منتج أطلقته
                </div>
                <div
                  class="text-[13px] font-bold leading-tight transition-colors duration-700"
                  :class="flipped ? 'text-white' : 'text-ink'"
                >
                  مطوّر منتجات
                </div>
              </div>
            </div>

          </div>

          <div class="sm:hidden grid grid-cols-2 gap-2 mt-5">
            <div
              class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 border bg-white border-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
            >
              <div
                class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-[#15803D]/10 text-[#15803D]"
              >
                <Icon name="lucide:zap" class="w-3.5 h-3.5" />
              </div>
              <div class="text-right min-w-0">
                <div
                  class="text-[9px] font-medium uppercase tracking-wide mb-0.5 text-ink-mute truncate"
                >
                  +8 سنوات
                </div>
                <div class="text-[12px] font-bold leading-tight text-ink truncate">
                  شريك تقني
                </div>
              </div>
            </div>

            <div
              class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 border bg-white border-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
            >
              <div
                class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-ink/[0.06] text-ink"
              >
                <Icon name="lucide:code-2" class="w-3.5 h-3.5" />
              </div>
              <div class="text-right min-w-0">
                <div
                  class="text-[9px] font-medium uppercase tracking-wide mb-0.5 text-ink-mute truncate"
                >
                  +12 منتج
                </div>
                <div class="text-[12px] font-bold leading-tight text-ink truncate">
                  مطوّر منتجات
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 pb-14 sm:pb-20">
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
const flipped = ref(false);

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
