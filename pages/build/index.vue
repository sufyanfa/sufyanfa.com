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
const title = "المختبر | تجارب ومشاريع تقنية تفاعلية | سفيان فارع";
const description = "مختبر المشاريع التقنية: أدوات وتطبيقات تفاعلية مبنية باستخدام أحدث التقنيات. استكشف حلول الذكاء الاصطناعي والأدوات المبتكرة.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://sufyanfa.com/preview.png',
  ogUrl: 'https://sufyanfa.com/build',
  ogType: 'website',
  ogLocale: 'ar_SA',
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: 'https://sufyanfa.com/preview.png',
});

useHead({
  link: [
    { rel: 'canonical', href: 'https://sufyanfa.com/build' }
  ]
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