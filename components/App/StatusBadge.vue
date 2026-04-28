<template>
  <span
    class="inline-flex items-center gap-2 bg-white border border-black/5 text-ink rounded-full px-4 py-1.5 text-xs font-semibold"
  >
    <span class="w-1.5 h-1.5 rounded-full bg-success" :class="{ 'animate-pulse': pulse }"></span>
    <slot>متاح لمشروع جديد هذا الشهر</slot>
  </span>
</template>

<script setup lang="ts">
defineProps({
  pulse: {
    type: Boolean,
    default: true,
  },
});
</script>
