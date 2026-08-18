<template>
  <section class="relative bg-ink text-white overflow-hidden">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-28 sm:py-36 lg:py-44">
      <div class="flex items-start gap-3 mb-12 sm:mb-16 text-[11px] font-medium uppercase tracking-wide text-white/50">
        <span class="w-1 h-1 rounded-full bg-white/40 mt-2"></span>
        <span>قاعدة</span>
      </div>

      <h2
        class="font-bold leading-[1.25] tracking-display text-[40px] sm:text-[64px] lg:text-[88px] max-w-5xl"
      >
        {{ statement }}<span class="text-white/40">.</span>
      </h2>

      <p
        v-if="caption"
        class="mt-10 sm:mt-12 text-base sm:text-lg leading-relaxed text-white/60 max-w-xl"
      >
        {{ caption }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    statement?: string;
    caption?: string;
  }>(),
  {
    statement: "إذا لم ترَ قيمة عملك، فلن يراها أحد قبلك",
    caption: "ابدأ من نظرتك — الناس يعاملون عملك بالقيمة التي تمنحها له.",
  }
);
</script>
