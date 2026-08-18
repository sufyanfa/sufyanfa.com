<template>
  <section class="bg-cream-deep py-14 sm:py-16 border-b border-black/[0.04]">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-12">
      <!-- Section Header -->
      <div class="text-right max-w-xl mb-10 sm:mb-12">
        <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-mute mb-3">
          <span class="w-1.5 h-1.5 rounded-full bg-ink"></span>
          <span>منهج العمل</span>
        </div>

        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink !leading-tight mb-3">
          كيف نعمل معًا؟
        </h2>
      </div>

      <!-- Steps -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="pt-4 border-t border-black/[0.1]"
        >
          <span class="text-[11px] font-semibold text-ink-mute/60 tracking-wider">
            0{{ i + 1 }}
          </span>
          <h3 class="text-base font-bold text-ink mt-2 mb-1.5">
            {{ step.title }}
          </h3>
          <p class="text-[13px] text-ink-soft leading-[1.7]">
            {{ step.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const steps = [
  {
    title: "أفهم",
    description: "جلسة لفهم فكرتك والمشكلة التي تحاول حلّها.",
  },
  {
    title: "أحدد",
    description: "أحدد معك ما يستحق البناء الآن، وما يمكن تأجيله لاحقًا.",
  },
  {
    title: "أبني",
    description: "أحوّل الخطة إلى منتج حقيقي يعمل، لا مجرد تصور.",
  },
  {
    title: "أطلق",
    description: "أطلق النسخة الأولى في السوق، وأتعلم من أول المستخدمين الحقيقيين.",
  },
];
</script>
