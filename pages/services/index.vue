<template>
  <main class="min-h-screen">
    <AppHeader class="mb-12" title="الخدمات" :description="description" />
    <div class="space-y-8">
      <AppServiceCTA
        v-for="(service, id) in services"
        :key="id"
        :service="service"
      />
    </div>
  </main>
</template>

<script setup>
const description = "حلول تقنية متكاملة تساعدك في تحويل فكرتك إلى منتج رقمي ناجح. من الاستشارة إلى التطوير والإطلاق.";
useSeoMeta({
  title: "الخدمات | سفيان فارع",
  description
});

const { data: services } = await useAsyncData("services-all", () =>
  queryContent("/services").find()
);
</script>
