<template>
  <main class="min-h-screen">
    <AppHeader class="mb-12" title="المشاريع" :description="description" />
    
    <AppProjectCard
      v-for="(project, id) in projects"
      :key="id"
      :project="project"
    />
    
    <div v-if="!projects || projects.length === 0" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">No projects found. Add project folders in /content/build/</p>
    </div>
  </main>
</template>

<script setup>
const description = "حلول تقنية متكاملة تساعدك في تحويل فكرتك إلى منتج رقمي ناجح. من الاستشارة إلى التطوير والإطلاق.";
useSeoMeta({
  title: "المشاريع | سفيان فارع",
  description: description,
});

const projects  = [
  {
    name: "AI Agent",
    description: "كيل ذكاء صناعي يُساعد المستخدمين على تحسين صياغة رسائلهم وخطاباتهم بطريقة احترافية.",
    url: "/build/ai-agent-v1",
    icon: "solar:medal-ribbon-line-duotone",
  }
]
</script>