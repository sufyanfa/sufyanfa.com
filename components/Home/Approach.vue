<template>
  <section class="bg-white">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-24">
      <div class="text-center mb-12 sm:mb-14">
        <AppEyebrow tone="lavender" class="mb-6">ما أقدّمه</AppEyebrow>
        <h2
          class="font-extrabold text-ink leading-tight tracking-h2 text-[28px] sm:text-[36px] lg:text-[40px]"
        >
          كيف أساعدك؟
        </h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-16 sm:mb-20">
        <article
          v-for="(s, i) in scenarios"
          :key="i"
          class="rounded-3xl p-7 sm:p-8 flex flex-col"
          :class="s.tone === 'lavender' ? 'bg-forest-soft' : 'bg-cream'"
        >
          <div
            class="text-[11px] font-semibold tracking-[0.1em] uppercase mb-3"
            :class="s.tone === 'lavender' ? 'text-forest' : 'text-ink-soft'"
          >
            {{ s.condition }}
          </div>

          <h3 class="text-xl sm:text-[22px] font-bold text-ink leading-tight tracking-tight mb-4">
            {{ s.solution }}
          </h3>

          <p class="text-sm text-ink-soft leading-relaxed mb-6 flex-1">{{ s.description }}</p>

          <button
            v-if="s.modal"
            type="button"
            class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink hover:underline self-start"
            @click="openModal(s)"
          >
            {{ s.cta }}
            <span class="text-xs">←</span>
          </button>
          <NuxtLink
            v-else
            :to="s.url!"
            :target="s.external ? '_blank' : undefined"
            :external="s.external || undefined"
            class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink hover:underline self-start"
          >
            {{ s.cta }}
            <span class="text-xs">←</span>
          </NuxtLink>
        </article>
      </div>

      <div class="text-center">
        <div
          class="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-mute mb-6"
        >
          كيف نعمل معًا
        </div>
        <div class="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          <span
            v-for="(step, i) in steps"
            :key="step"
            class="contents"
          >
            <span
              class="rounded-full px-5 py-2 text-sm font-semibold text-ink"
              :class="i % 2 === 0 ? 'bg-cream' : 'bg-forest-soft'"
            >
              {{ step }}
            </span>
            <span
              v-if="i < steps.length - 1"
              class="text-ink-mute text-base"
              aria-hidden="true"
            >
              ←
            </span>
          </span>
        </div>
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
  tone: string;
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
    tone: "sage",
    modal: true,
    service: "تطوير منتج جديد (MVP)",
    placeholder: "اشرح لي فكرتك باختصار، الجمهور المستهدف، والهدف من النسخة الأولى.",
  },
  {
    condition: "عندك منتج",
    solution: "نطوّره ونرافقك",
    description: "إرشاد مستمر للقرارات التقنية والمنتج مع فريقك.",
    cta: "تواصل معي",
    tone: "lavender",
    modal: true,
    service: "تطوير منتج قائم / إرشاد مستمر",
    placeholder: "اشرح لي وضع منتجك الحالي، ما الذي يعمل وما الذي تريد تحسينه.",
  },
  {
    condition: "عندك مشكلة",
    solution: "نحلّها استشاريًا",
    description: "جلسة موجَّهة للخروج بخريطة طريق واضحة.",
    cta: "احجز استشارة",
    tone: "sage",
    url: "https://cal.com/sufyanfa/consultation",
    external: true,
  },
];

const steps = ["مكالمة", "خطة", "تنفيذ"];

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
