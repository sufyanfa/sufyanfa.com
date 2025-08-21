<template>
  <div v-if="!isDismissed" class="fixed bottom-6 left-6 right-6 z-50 max-w-md mx-auto">
    <div class="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-2xl backdrop-blur-sm">
      <div class="flex-shrink-0">
        <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon name="lucide:rocket" class="w-6 h-6" />
        </div>
      </div>
      
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-sm leading-tight">
          دليل الشركات الناشئة
        </h3>
        <p class="text-xs text-white/90 mt-1">
          اكتشف خطوات تأسيس شركتك التقنية
        </p>
      </div>
      
      <div class="flex items-center gap-2">
        <NuxtLink 
          to="https://startup.sufyanfa.com" 
          target="_blank" 
          external
          class="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/90 transition-colors duration-200"
        >
          شاهد الآن
        </NuxtLink>
        
        <button
          @click="dismiss"
          class="p-1.5 hover:bg-white/20 rounded-lg transition-colors duration-200"
          aria-label="إغلاق"
        >
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isDismissed = ref(false)

const dismiss = () => {
  isDismissed.value = true
  // Store in localStorage to remember dismissal
  if (process.client) {
    localStorage.setItem('product-alert-dismissed', 'true')
  }
}

onMounted(() => {
  // Check if already dismissed
  if (process.client) {
    const dismissed = localStorage.getItem('product-alert-dismissed')
    if (dismissed === 'true') {
      isDismissed.value = true
    }
  }
})
</script>