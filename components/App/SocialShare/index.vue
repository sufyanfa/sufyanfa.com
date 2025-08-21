<template>
  <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
    <div class="flex flex-row gap-2 px-3 py-2 text-sm font-medium bg-white/90 shadow-lg shadow-gray-800/5 ring-1 backdrop-blur dark:bg-gray-800/90 dark:ring-white/20 ring-gray-900/5 rounded-full">
      <AppSocialShareWhatsAppShare :title="title" :url="url" />
      <AppSocialShareXShare :title="title" :url="url" />
      <AppSocialShareLinkedInShare :title="title" :url="url" />
      <AppSocialShareCopyUrlShare :url="url" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  url?: string
}

defineProps<Props>()
</script>