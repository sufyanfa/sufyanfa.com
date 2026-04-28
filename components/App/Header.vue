<template>
  <section class="bg-cream">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-20 lg:py-24 text-center">
      <AppEyebrow v-if="eyebrow" tone="white" class="mb-6">{{ eyebrow }}</AppEyebrow>
      <h1
        class="font-extrabold text-ink leading-tight tracking-display text-[36px] sm:text-[44px] lg:text-[52px] mb-5"
      >
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="text-base sm:text-lg text-ink-soft leading-relaxed max-w-2xl mx-auto"
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
