<template>
  <button
    @click="copyToClipboard"
    class="flex items-center justify-center w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors duration-200"
    :class="{ 'bg-green-600 hover:bg-green-700': copied }"
    aria-label="Copy URL"
  >
    <Icon :name="copied ? 'lucide:check' : 'lucide:link'" class="w-5 h-5" />
  </button>
</template>

<script setup lang="ts">
interface Props {
  url?: string
}

const props = defineProps<Props>()
const copied = ref(false)

const copyToClipboard = async () => {
  const currentUrl = props.url || window.location.href
  
  try {
    await navigator.clipboard.writeText(currentUrl)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy URL:', err)
  }
}
</script>