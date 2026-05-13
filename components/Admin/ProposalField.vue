<template>
  <div>
    <label class="block text-[12px] font-semibold text-ink mb-2">
      {{ label }}
    </label>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string }>()
</script>
