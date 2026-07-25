<template>
  <span class="inline-flex flex-col leading-none opacity-60">
    <Icon name="lucide:chevron-up" :class="['w-3 h-3 -mb-1', active && dir === 'asc' ? 'text-ink opacity-100' : 'text-ink-mute/50']" />
    <Icon name="lucide:chevron-down" :class="['w-3 h-3', active && dir === 'desc' ? 'text-ink opacity-100' : 'text-ink-mute/50']" />
  </span>
</template>

<script setup lang="ts">
defineProps<{ active: boolean; dir: 'asc' | 'desc' }>()
</script>
