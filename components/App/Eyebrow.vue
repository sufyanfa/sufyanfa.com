<template>
  <span
    class="inline-block text-[11px] font-semibold uppercase tracking-wide text-ink-mute"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{
  tone?: "sage" | "lavender" | "white";
}>();
</script>
