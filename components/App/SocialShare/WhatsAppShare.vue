<template>
  <button
    @click="shareOnWhatsApp"
    class="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors duration-200"
    aria-label="Share on WhatsApp"
  >
    <Icon name="lucide:message-circle" class="w-5 h-5" />
  </button>
</template>

<script setup lang="ts">
interface Props {
  title: string
  url?: string
}

const props = defineProps<Props>()

const shareOnWhatsApp = () => {
  const currentUrl = props.url || window.location.href
  const text = encodeURIComponent(`${props.title} - ${currentUrl}`)
  const whatsappUrl = `https://wa.me/?text=${text}`
  window.open(whatsappUrl, '_blank')
}
</script>