<template>
  <NuxtLayout>
    <div class="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div class="text-center space-y-8 max-w-2xl mx-auto">
        <!-- Error Code with gradient -->
        <div class="relative">
          <h1 
            class="text-[150px] md:text-[200px] font-bold leading-none bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-900 bg-clip-text text-transparent select-none"
            aria-label="404"
          >
            {{ error.statusCode }}
          </h1>
          <div 
            class="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-br from-teal-500 to-blue-500 -z-10"
            aria-hidden="true"
          ></div>
        </div>

        <!-- Error Message -->
        <div class="space-y-4">
          <h2 class="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-zinc-100">
            {{ errorTitle }}
          </h2>
          <p class="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {{ errorMessage }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <UButton
            to="/"
            size="lg"
            color="primary"
            variant="solid"
            class="min-w-[160px]"
            icon="i-heroicons-home"
          >
            العودة للرئيسية
          </UButton>
          
          <UButton
            @click="handleBack"
            size="lg"
            color="gray"
            variant="ghost"
            class="min-w-[160px]"
            icon="i-heroicons-arrow-right"
          >
            الرجوع للخلف
          </UButton>
        </div>

        <!-- Helpful Links -->
        <div class="pt-8 border-t border-gray-200 dark:border-gray-800">
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-4">
            أو يمكنك تصفح:
          </p>
          <div class="flex flex-wrap gap-3 justify-center">
            <NuxtLink
              to="/projects"
              class="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              المشاريع
            </NuxtLink>
            <span class="text-gray-300 dark:text-gray-700">•</span>
            <NuxtLink
              to="/articles"
              class="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              المقالات
            </NuxtLink>
            <span class="text-gray-300 dark:text-gray-700">•</span>
            <NuxtLink
              to="/services"
              class="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              الخدمات
            </NuxtLink>
            <span class="text-gray-300 dark:text-gray-700">•</span>
            <NuxtLink
              to="/bookmarks"
              class="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              المراجع
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    required: true
  }
});

// Determine error title and message based on status code
const errorTitle = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return 'الصفحة غير موجودة';
    case 500:
      return 'خطأ في الخادم';
    case 403:
      return 'غير مصرح بالوصول';
    default:
      return 'حدث خطأ ما';
  }
});

const errorMessage = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.';
    case 500:
      return 'عذراً، حدث خطأ في الخادم. نحن نعمل على حل المشكلة.';
    case 403:
      return 'عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة.';
    default:
      return 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
  }
});

// Handle back navigation
const handleBack = () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    navigateTo('/');
  }
};

// SEO Meta
useHead({
  title: `${errorTitle.value} | سفيان فارع`,
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
});
</script>

<style scoped>
/* Add subtle animation to the error code */
h1 {
  animation: fadeInScale 0.6s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
