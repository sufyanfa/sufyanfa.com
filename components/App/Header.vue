<template>
  <section class="bg-white py-14 sm:py-18 lg:py-20 border-b border-black/[0.04]">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-12 text-right">
      <div v-if="eyebrow" class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-mute mb-3">
        <span class="w-1.5 h-1.5 rounded-full bg-ink"></span>
        <span>{{ eyebrow }}</span>
      </div>

      <h1
        class="text-3xl sm:text-4xl lg:text-[44px] font-bold text-ink leading-tight mb-4"
      >
        {{ title }}
      </h1>

      <p
        v-if="description"
        class="text-base sm:text-lg text-ink-soft leading-relaxed max-w-2xl"
      >
        {{ description }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  eyebrow?: string;
}>();
</script>
