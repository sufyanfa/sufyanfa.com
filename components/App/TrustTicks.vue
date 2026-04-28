<template>
  <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-soft">
    <span v-for="tick in items" :key="tick" class="inline-flex items-center gap-1.5">
      <span class="text-success font-bold">✓</span>
      {{ tick }}
    </span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    items?: string[];
  }>(),
  {
    items: () => ["بدون التزام", "رد خلال 24 ساعة", "سرّية كاملة"],
  }
);
</script>
