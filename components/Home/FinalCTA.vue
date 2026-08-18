<template>
  <section class="bg-white py-16 sm:py-20 lg:py-24">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-12">
      <div
        class="bg-cream-deep rounded-[24px] sm:rounded-[28px] p-8 sm:p-12 lg:p-14 border border-black/[0.04] text-right"
      >
        <!-- Header text -->
        <div class="max-w-2xl mb-10">
          <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-mute mb-3">
            <span class="w-1.5 h-1.5 rounded-full bg-ink"></span>
            <span>تواصل معي</span>
          </div>

          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink !leading-[1.4] mb-3">
           لديك فكرة؟ لنحوّلها إلى منتج.
          </h2>

          <p class="text-[15px] sm:text-[16px] text-ink-soft leading-relaxed">
           شاركني فكرتك أو التحدي الذي تعمل عليه، وسنحدد معًا أفضل خطوة للبدء.
          </p>
        </div>

        <!-- Contact Channels Columns -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-black/[0.06]">
          <!-- Email -->
          <div class="flex flex-col gap-2">
            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-ink shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-1">
              <Icon name="lucide:mail" class="w-5 h-5" />
            </div>
            <span class="text-xs font-semibold text-ink-mute uppercase tracking-wider">البريد الإلكتروني</span>
            <a
              href="mailto:sfmu1998@gmail.com"
              class="text-[15px] font-semibold text-ink hover:underline inline-flex items-center gap-1.5"
            >
              <span>sfmu1998@gmail.com</span>
            </a>
          </div>

          <!-- Book a Session -->
          <div class="flex flex-col gap-2">
            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-ink shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-1">
              <Icon name="lucide:calendar" class="w-5 h-5" />
            </div>
            <span class="text-xs font-semibold text-ink-mute uppercase tracking-wider">حجز موعد</span>
            <NuxtLink
              to="https://cal.com/sufyanfa/15min/"
              target="_blank"
              external
              class="text-[15px] font-semibold text-ink hover:underline inline-flex items-center gap-1.5"
            >
              <span>جلسة استكشاف (30 دقيقة)</span>
              <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
            </NuxtLink>
          </div>

          <!-- Socials -->
          <div class="flex flex-col gap-2">
            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-ink shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-1">
              <Icon name="lucide:share-2" class="w-5 h-5" />
            </div>
            <span class="text-xs font-semibold text-ink-mute uppercase tracking-wider">الشبكات المهنية</span>
            <div class="flex items-center gap-2 pt-0.5">
              <NuxtLink
                v-for="s in socials"
                :key="s.name"
                :to="s.url"
                target="_blank"
                external
                :aria-label="s.name"
                class="w-9 h-9 rounded-full bg-white border border-black/[0.06] hover:bg-ink hover:text-white flex items-center justify-center text-ink transition-all shadow-[0_2px_6px_rgba(0,0,0,0.03)]"
              >
                <Icon :name="s.icon" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const socials = [
  { name: "X", url: "https://x.com/sufyanfa", icon: "simple-icons:x" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/sufyanfa/", icon: "mdi:linkedin" },
  { name: "GitHub", url: "https://github.com/sufyanfa", icon: "mdi:github" },
];
</script>
