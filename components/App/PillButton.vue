<template>
  <NuxtLink
    :to="to"
    :target="external ? '_blank' : undefined"
    :external="external || undefined"
    class="inline-flex items-center gap-2 rounded-full font-semibold transition-transform active:scale-[0.98]"
    :class="[sizeClass, toneClass]"
  >
    <slot />
    <span v-if="arrow" class="text-xs">←</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    to: string;
    tone?: "ink" | "white" | "ghost";
    size?: "md" | "lg";
    external?: boolean;
    arrow?: boolean;
  }>(),
  {
    tone: "ink",
    size: "md",
    external: false,
    arrow: true,
  }
);

const sizeClass = computed(() =>
  props.size === "lg" ? "px-9 py-4 text-[15px]" : "px-7 py-3.5 text-sm"
);

const toneClass = computed(() => {
  if (props.tone === "white") return "bg-white text-ink";
  if (props.tone === "ghost") return "text-ink";
  return "bg-ink text-white hover:bg-ink/90";
});
</script>
