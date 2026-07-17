<template>
  <section class="bg-cream-deep">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-24 lg:py-28">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-14 sm:mb-16">
        <div class="lg:col-span-7 text-right">
          <div
            class="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-semibold uppercase tracking-wide text-ink-mute mb-5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
            <span>ما أقدّمه</span>
          </div>

          <h2
            class="font-bold text-ink leading-[1.3] tracking-display text-[30px] sm:text-[40px] lg:text-[48px] mb-5"
          >
            كيف
            <span class="relative inline-block">
              <span class="relative">أساعدك</span>
              <span
                class="absolute -inset-x-1 bottom-1 sm:bottom-2 h-2.5 sm:h-3 lg:h-3.5 bg-[#15803D]/10 -z-0"
                aria-hidden="true"
              ></span>
            </span>؟
          </h2>

          <p class="text-[15px] sm:text-[17px] text-ink-soft leading-[1.85] max-w-xl">
            ثلاث طرق نعمل بها معًا، مع
            <strong class="font-semibold text-ink">شريك تقني واحد</strong>
            يفهم السياق التجاري والتقني.
          </p>
        </div>

        <div
          class="lg:col-span-5 flex items-end justify-start lg:justify-end"
        >
          <div
            class="inline-flex flex-wrap items-center gap-x-2 gap-y-2 text-[12px] sm:text-[13px]"
          >
            <span
              class="inline-flex items-center gap-1.5 bg-white rounded-full px-3.5 py-1.5 border border-black/[0.05] text-ink"
            >
              <span class="w-1 h-1 rounded-full bg-[#15803D]"></span>
              MVP
            </span>
            <span
              class="inline-flex items-center gap-1.5 bg-white rounded-full px-3.5 py-1.5 border border-black/[0.05] text-ink"
            >
              <span class="w-1 h-1 rounded-full bg-[#15803D]"></span>
              منتج قائم
            </span>
            <span
              class="inline-flex items-center gap-1.5 bg-white rounded-full px-3.5 py-1.5 border border-black/[0.05] text-ink"
            >
              <span class="w-1 h-1 rounded-full bg-[#15803D]"></span>
              استشارة
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <article
          v-for="(s, i) in scenarios"
          :key="i"
          class="group rounded-2xl sm:rounded-3xl p-8 sm:p-9 flex flex-col bg-white border border-black/[0.05] transition-all duration-300 hover:border-black/[0.12] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-1"
        >
          <div class="flex items-start justify-between mb-7">
            <div
              class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#15803D]/10 text-[#15803D] group-hover:bg-ink group-hover:text-white transition-colors"
            >
              <Icon :name="s.icon" class="w-5 h-5" />
            </div>
            <span class="text-[12px] font-bold text-ink-mute/40 tabular-nums">
              0{{ i + 1 }}
            </span>
          </div>

          <div
            class="text-[11px] font-semibold tracking-wide uppercase text-ink-mute mb-2.5"
          >
            {{ s.condition }}
          </div>

          <h3
            class="text-xl sm:text-[22px] font-bold text-ink leading-tight tracking-tight mb-3"
          >
            {{ s.solution }}.
          </h3>

          <p class="text-[14px] text-ink-soft leading-[1.7] mb-7 flex-1">
            {{ s.description }}
          </p>

          <button
            v-if="s.modal"
            type="button"
            class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink hover:opacity-60 transition-colors self-start"
            @click="openModal(s)"
          >
            {{ s.cta }}
            <Icon
              name="lucide:arrow-left"
              class="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5"
            />
          </button>
          <NuxtLink
            v-else
            :to="s.url!"
            :target="s.external ? '_blank' : undefined"
            :external="s.external || undefined"
            class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink hover:opacity-60 transition-colors self-start"
          >
            {{ s.cta }}
            <Icon
              name="lucide:arrow-left"
              class="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5"
            />
          </NuxtLink>
        </article>
      </div>

    </div>
  </section>

  <AppProjectInquiryModal
    v-model="modalOpen"
    :service="active.service"
    :eyebrow="active.eyebrow"
    :headline="active.headline"
    :message-placeholder="active.placeholder"
  />
</template>

<script setup lang="ts">
type Scenario = {
  condition: string;
  solution: string;
  description: string;
  cta: string;
  icon: string;
  modal?: boolean;
  service?: string;
  placeholder?: string;
  url?: string;
  external?: boolean;
};

const scenarios: Scenario[] = [
  {
    condition: "عندك فكرة",
    solution: "نحوّلها إلى MVP",
    description: "خطة واقعية وإطلاق نسخة أولى قابلة للاختبار خلال 2-4 أسابيع.",
    cta: "ابدأ المشروع",
    icon: "lucide:lightbulb",
    modal: true,
    service: "تطوير منتج جديد (MVP)",
    placeholder: "اشرح لي فكرتك باختصار، الجمهور المستهدف، والهدف من النسخة الأولى.",
  },
  {
    condition: "عندك منتج",
    solution: "نطوّره ونرافقك",
    description: "إرشاد مستمر للقرارات التقنية والمنتج مع فريقك.",
    cta: "تواصل معي",
    icon: "lucide:rocket",
    modal: true,
    service: "تطوير منتج قائم / إرشاد مستمر",
    placeholder: "اشرح لي وضع منتجك الحالي، ما الذي يعمل وما الذي تريد تحسينه.",
  },
  {
    condition: "عندك مشكلة",
    solution: "نحلّها استشاريًا",
    description: "جلسة موجَّهة للخروج بخريطة طريق واضحة.",
    cta: "احجز استشارة",
    icon: "lucide:compass",
    url: "https://cal.com/sufyanfa/consultation",
    external: true,
  },
];

const modalOpen = ref(false);
const active = ref({
  service: "",
  eyebrow: "",
  headline: "",
  placeholder: "",
});

const openModal = (s: Scenario) => {
  active.value = {
    service: s.service ?? "",
    eyebrow: s.condition,
    headline: s.solution,
    placeholder: s.placeholder ?? "اشرح لي مشروعك باختصار.",
  };
  modalOpen.value = true;
};
</script>
