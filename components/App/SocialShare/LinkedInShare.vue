<template>
  <button
    @click="shareOnLinkedIn"
    class="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200"
    aria-label="Share on LinkedIn"
  >
    <Icon name="lucide:linkedin" class="w-5 h-5" />
  </button>
</template>

<script setup lang="ts">
interface Props {
  title: string
  url?: string
}

const props = defineProps<Props>()

const shareOnLinkedIn = () => {
  const currentUrl = props.url || window.location.href
  const encodedUrl = encodeURIComponent(currentUrl)
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  window.open(linkedInUrl, '_blank')
}
</script>