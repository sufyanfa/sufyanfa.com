<template>
  <div>
    <h2 class="uppercase text-xs font-semibold text-gray-400 mb-6">
      الخدمات
    </h2>
    <div class="space-y-4">
      <AppServiceCard
        v-for="(service, id) in services"
        :key="id"
        :service="service"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const { data: services } = await useAsyncData("services-home", () =>
  queryContent("/services").limit(3).find()
);
</script>
