<template>
  <div class="flex items-end gap-4 group p-2 -m-2 rounded-lg">
    <div class="max-w-md space-y-4">
      <Icon aria-hidden="true" :name="service.icon" class="w-10 h-10" />
      <h2 class="text-md font-medium">
        {{ service.name }}
      </h2>
      <p class="text-gray-600 text-sm dark:text-gray-300">{{ service.description }}</p>
      <p class="text-gray-400 text-xs dark:text-gray-300">
        الميزات:
      </p>
      <ul class="list-disc list-inside space-y-2">
        <li v-for="(feature, index) in service.features" :key="index" class="text-gray-800 text-sm dark:text-gray-300">
          {{ feature }}
        </li>
      </ul>
      <div class="flex items-center gap-x-2">
        <span class="text-xs text-gray-500 dark:text-gray-200">{{ service.price }}
          <img v-if="service.price !== 'مجاني'" src="/Saudi_Riyal.svg" alt="coin icon" class="inline-block w-4 h-4 bg-white" />
        </span>
        <NuxtLink to="https://cal.com/sufyanfa/15min/"
          class="w-auto inline-flex h-[34px] items-center justify-center gap-2.5 pl-4 pr-3 py-0 bg-[#020618] dark:bg-teal-50 rounded-[99px] hover:bg-[#020618]/90 text-slate-50 dark:text-slate-900 font-medium text-[13px] leading-5"
          aria-label="Get a free consultation" target="_blank">
          <span>طلب الخدمة</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"
            class="text-slate-50 dark:text-slate-900 rotate-180" aria-label="chevron-right" role="img">
            <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor">
              <polyline points="4.25 10.25 8.5 6 4.25 1.75"></polyline>
            </g>
          </svg>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  service: {
    type: Object,
    required: true,
  },
});
</script>
