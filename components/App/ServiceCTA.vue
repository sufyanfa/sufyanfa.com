<template>
  <div class="flex items-end gap-4 group p-2 -m-2 rounded-lg">
    <div class="max-w-md space-y-4">
      <Icon aria-hidden="true" :name="service.icon" class="w-10 h-10" />
      <h2 class="text-md font-medium">
        {{ service.name }}
      </h2>
      <p class="text-gray-600 text-sm dark:text-gray-300">{{ service.description }}</p>
      <p class="text-gray-400 text-xs dark:text-gray-300">
        ما ستحصل عليه:
      </p>
      <ul class="list-disc list-inside space-y-2">
        <li v-for="(feature, index) in service.features" :key="index" class="text-gray-800 text-sm dark:text-gray-300">
          {{ feature }}
        </li>
      </ul>
      <div class="flex items-center gap-x-2">
        <UButton
          @click="openContactModal"
          class="w-auto inline-flex h-[34px] items-center justify-center gap-2.5 pl-4 pr-3 py-0 bg-[#020618] dark:bg-teal-50 rounded-[99px] hover:bg-[#020618]/90 text-slate-50 dark:text-slate-900 font-medium text-[13px] leading-5"
          variant="solid"
          size="sm"
        >
          <span>طلب الخدمة</span>
          <Icon name="lucide:arrow-left" class="w-3 h-3" />
        </UButton>
      </div>

    <!-- Service Contact Modal -->
    <AppServiceContactModal
      v-model="isContactModalOpen"
      :selectedService="service.name"
    />
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

const isContactModalOpen = ref(false)

const openContactModal = () => {
  isContactModalOpen.value = true
}
</script>
