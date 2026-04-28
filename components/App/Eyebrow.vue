<template>
  <span
    class="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold"
    :class="toneClass"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tone?: "sage" | "lavender" | "white";
  }>(),
  {
    tone: "lavender",
  }
);

const toneClass = computed(() => {
  if (props.tone === "sage") return "bg-cream text-ink";
  if (props.tone === "white") return "bg-white text-forest border border-black/5";
  return "bg-forest-soft text-forest";
});
</script>
