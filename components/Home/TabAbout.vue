<template>
  <div class="max-w-xl mx-auto">
    <div
      class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-5"
    >
      عن سفيان
    </div>

    <p
      class="text-[15px] sm:text-[16px] text-ink-soft leading-[1.85] mb-7"
    >
      شريك تقني لرواد الأعمال — أبني منتجات رقمية واضحة الهدف، بفهم عميق
      للسياق التجاري والتقني معًا. أكثر من ٨ سنوات بناء مع مؤسسات حكومية
      وجامعات وشركات ناشئة. أؤمن أن الإتقان يبدأ من التفاصيل الصغيرة،
      وأن قيمة المنتج تبدأ من نظرتك له
      <span class="text-[#15803D]">.</span>
    </p>

    <div class="flex flex-wrap items-center gap-3 mb-12">
      <NuxtLink
        to="/about"
        class="inline-flex items-center gap-2 bg-cream-deep hover:bg-[#EDEDF0] transition-colors rounded-full px-4 py-2 text-sm text-ink"
      >
        <Icon name="lucide:file-text" class="w-4 h-4 text-[#15803D]" />
        صفحة عني
      </NuxtLink>
      <span class="text-sm text-ink-mute">← اقرأ القصة كاملة</span>
    </div>

    <div
      class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-5"
    >
      الخدمات
    </div>

    <div class="space-y-3 mb-12">
      <NuxtLink
        v-for="(s, i) in services"
        :key="i"
        :to="s.url"
        class="group flex items-start justify-between gap-4 p-4 rounded-2xl hover:bg-cream-deep transition-colors"
      >
        <div>
          <div class="text-[15px] font-semibold text-ink mb-0.5">{{ s.title }}</div>
          <div class="text-[13px] text-ink-mute leading-relaxed">{{ s.desc }}</div>
        </div>
        <span
          class="text-ink-mute text-sm group-hover:text-ink transition-colors mt-1"
          aria-hidden="true"
        >
          ←
        </span>
      </NuxtLink>
    </div>

    <div
      class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-5"
    >
      تواصل
    </div>

    <div class="flex flex-wrap gap-2">
      <a
        v-for="link in links"
        :key="link.label"
        :href="link.url"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-2 bg-cream-deep hover:bg-[#EDEDF0] transition-colors rounded-full px-4 py-2 text-sm text-ink"
      >
        <Icon :name="link.icon" class="w-4 h-4" />
        {{ link.label }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const services = [
  {
    title: "تطوير منتج جديد (MVP)",
    desc: "خطة + بناء نسخة أولى قابلة للاختبار خلال ٢-٤ أسابيع.",
    url: "/services",
  },
  {
    title: "تطوير منتج قائم",
    desc: "إرشاد مستمر للقرارات التقنية والمنتج مع فريقك.",
    url: "/services",
  },
  {
    title: "استشارة موجَّهة",
    desc: "جلسة للخروج بخريطة طريق واضحة لمشكلة محددة.",
    url: "https://cal.com/sufyanfa/consultation",
  },
];

const links = [
  { label: "احجز جلسة", url: "https://cal.com/sufyanfa/15min/", icon: "lucide:calendar" },
  { label: "البريد", url: "mailto:sfmu1998@gmail.com", icon: "lucide:mail" },
  { label: "اكس", url: "https://x.com/sufyanfa", icon: "simple-icons:x" },
  { label: "لينكدإن", url: "https://linkedin.com/in/sufyanfa", icon: "lucide:linkedin" },
];
</script>
