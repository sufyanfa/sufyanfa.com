<template>
  <NuxtLink
    class="flex items-end gap-4 group p-2 -m-2 rounded-lg"
    to="/services"
    external
  >
  <Icon aria-hidden="true" :name="service.icon" class="w-10 h-10" />
    <div class="max-w-md">
      <h3 class="text-sm font-medium group-hover:text-primary-600">
        {{ service.name }}
      </h3>
      <p class="text-gray-500 text-sm">{{ service.description }}</p>
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  service: {
    type: Object,
    required: true,
  },
});
</script>
