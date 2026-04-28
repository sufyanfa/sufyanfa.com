<template>
  <main>
    <AppHeader title="المختبر" :description="description" eyebrow="تجارب تقنية" />

    <section class="bg-gray-50 border-y border-black/[0.04]">
      <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-20">
        <div v-if="projects.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NuxtLink
            v-for="(project, id) in projects"
            :key="id"
            :to="project.url"
            class="block bg-white border border-black/[0.04] hover:border-black/10 rounded-3xl p-7 sm:p-8 transition-colors"
          >
            <h3 class="text-xl font-bold text-ink leading-tight mb-2.5">
              {{ project.name }}
            </h3>
            <p class="text-sm text-ink-soft leading-relaxed">{{ project.description }}</p>
          </NuxtLink>
        </div>
        <p v-else class="text-center text-ink-mute">لا توجد تجارب متاحة حاليًا.</p>
      </div>
    </section>
  </main>
</template>

<script setup>
const title = "المختبر | تجارب ومشاريع تقنية تفاعلية | سفيان فارع";
const description =
  "مختبر التجارب التقنية: أدوات وتطبيقات تفاعلية مبنية لأرى كيف تعمل الفكرة قبل بنائها كاملة.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "https://sufyanfa.com/preview.png",
  ogUrl: "https://sufyanfa.com/build",
  ogType: "website",
  ogLocale: "ar_SA",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: "https://sufyanfa.com/preview.png",
});

useHead({
  link: [{ rel: "canonical", href: "https://sufyanfa.com/build" }],
});

const projects = [
  {
    name: "AI Agent",
    description:
      "وكيل ذكاء صناعي يُساعد المستخدمين على تحسين صياغة رسائلهم وخطاباتهم بطريقة احترافية.",
    url: "/build/ai-agent-v1",
  },
];
</script>
