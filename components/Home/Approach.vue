<template>
  <section class="bg-white py-16 sm:py-20 lg:py-24 border-b border-black/[0.04]">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-12">
      <!-- Section Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-14">
        <div class="text-right max-w-xl">
          <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-mute mb-3">
            <span class="w-1.5 h-1.5 rounded-full bg-ink"></span>
            <span>رحلة المنتج</span>
          </div>

          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink !leading-tight mb-3">
            أين أنت الآن؟
          </h2>

          <p class="text-[15px] sm:text-[16px] text-ink-soft leading-relaxed">
            أيًا كانت المرحلة التي تمر بها مع منتجك، هناك طريق واضح للخطوة التالية.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink
            to="/services"
            data-umami-event="services-link-click"
            data-umami-event-position="approach"
            class="inline-flex items-center gap-2 border border-black/20 hover:border-black/45 active:bg-cream-deep rounded-full px-5 py-2 text-xs font-medium text-ink transition-all hover:bg-cream-deep"
          >
            <span>تفاصيل الخدمات</span>
            <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
      </div>

      <!-- Superpowers / Services Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <article
          v-for="(s, i) in scenarios"
          :key="i"
          class="group rounded-[20px] p-7 sm:p-8 flex flex-col justify-between bg-cream-deep hover:bg-[#ECECED] border border-black/[0.03] transition-all duration-300"
        >
          <div>
            <div class="flex items-center justify-between mb-6">
              <div
                class="w-11 h-11 rounded-full bg-white flex items-center justify-center text-ink shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:scale-105 transition-transform"
              >
                <Icon :name="s.icon" class="w-5 h-5" />
              </div>
              <span class="text-[11px] font-semibold text-ink-mute/60 tracking-wider">
                0{{ i + 1 }}
              </span>
            </div>

            <div class="text-[11px] font-semibold uppercase tracking-wider text-ink-mute mb-2">
              {{ s.condition }}
            </div>

            <h3 class="text-lg sm:text-xl font-bold text-ink mb-3 leading-snug">
              {{ s.solution }}
            </h3>

            <p class="text-[14px] text-ink-soft leading-[1.75] mb-8">
              {{ s.description }}
            </p>
          </div>

          <div class="pt-4 border-t border-black/[0.05]">
            <button
              v-if="s.modal"
              type="button"
              class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink hover:opacity-60 transition-opacity"
              @click="openModal(s)"
            >
              <span>{{ s.cta }}</span>
              <Icon
                name="lucide:arrow-left"
                class="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1"
              />
            </button>
            <NuxtLink
              v-else
              :to="s.url!"
              :target="s.external ? '_blank' : undefined"
              :external="s.external || undefined"
              data-umami-event="approach-external-cta-click"
              :data-umami-event-cta="s.solution"
              class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink hover:opacity-60 transition-opacity"
            >
              <span>{{ s.cta }}</span>
              <Icon
                name="lucide:arrow-left"
                class="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1"
              />
            </NuxtLink>
          </div>
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
    condition: "لديك فكرة",
    solution: "تحويل الفكرة إلى MVP",
    description: "أحوّل فكرتك إلى منتج أولي واضح، أحدد ما يستحق البناء، وأصل بك إلى نسخة قابلة للاختبار في السوق.",
    cta: "ابدأ المشروع",
    icon: "lucide:layers",
    modal: true,
    service: "تحويل الفكرة إلى MVP",
    placeholder: "اشرح لي فكرتك باختصار، الجمهور المستهدف، والهدف من النسخة الأولى.",
  },
  {
    condition: "لديك منتج",
    solution: "تطوير المنتج وتسريع الفريق",
    description: "أراجع منتجك وقراراتك التقنية، أزيل التعقيد، وأساعد فريقك على البناء والتصدير بسرعة أكبر.",
    cta: "تواصل معي",
    icon: "lucide:code-2",
    modal: true,
    service: "تطوير المنتج وتسريع الفريق",
    placeholder: "اشرح لي وضع منتجك الحالي، ما الذي يعمل وما الذي تريد تحسينه.",
  },
  {
    condition: "لديك تحدٍ",
    solution: "استشارة تقنية ومنتجية",
    description: "جلسة مركزة لفهم المشكلة، ترتيب الخيارات، والخروج بقرارات وخطوات قابلة للتنفيذ.",
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

const { track } = useAnalytics();

const openModal = (s: Scenario) => {
  active.value = {
    service: s.service ?? "",
    eyebrow: s.condition,
    headline: s.solution,
    placeholder: s.placeholder ?? "اشرح لي مشروعك باختصار.",
  };
  modalOpen.value = true;
  track("inquiry-modal-open", { source: "homepage-approach", service: active.value.service });
};
</script>
