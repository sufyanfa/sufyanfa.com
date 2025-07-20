<template>
  <div
    :class="[
      'flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2.5 transition-all duration-500 ease-out',
      isLoaded
        ? 'opacity-100 blur-none translate-y-0'
        : 'opacity-0 blur-[4px] translate-y-2'
    ]"
    :style="{ transitionDelay: '300ms' }"
  >
    <NuxtLink
      to="https://cal.com/sufyanfa/15min/"
      class="w-full sm:w-auto inline-flex h-[34px] items-center justify-center gap-2.5 pl-4 pr-3 py-0 bg-[#020618] dark:bg-white rounded-[99px] hover:bg-[#020618]/90 text-slate-50 dark:text-black font-medium text-[13px] leading-5"
      aria-label="Get a free consultation"
      target="_blank"
    >
      <span>احصل على استشارة مجانية</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        class="text-slate-50 dark:text-black rotate-180"
        aria-label="chevron-right"
        role="img"
      >
        <g
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <polyline points="4.25 10.25 8.5 6 4.25 1.75"></polyline>
        </g>
      </svg>
    </NuxtLink>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isLoaded = ref(false)

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>