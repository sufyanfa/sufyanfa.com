<template>
  <main>
    <AppHeader title="المشاريع والأعمال" :description="description" eyebrow="ما بنيته" />

    <section class="bg-white py-16 sm:py-20 border-b border-black/[0.04]">
      <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-12">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          <AppProjectCard
            v-for="(project, id) in projects"
            :key="id"
            :project="(project as any)"
            :index="id"
            @open="openProject"
          />
        </div>
      </div>
    </section>

    <HomeFinalCTA />

    <AppProjectDetailModal v-model="modalOpen" :project="activeProject" />
  </main>
</template>

<script setup lang="ts">
const { track } = useAnalytics();

const modalOpen = ref(false);
const activeProject = ref<any>(null);

const openProject = (project: any) => {
  activeProject.value = project;
  modalOpen.value = true;
  track("project-modal-open", { source: "projects-page", project: project?.name ?? "" });
};

const title = "المشاريع التقنية | سفيان فارع";
const description =
  "مجموعة من المشاريع التقنية التي بنيتها: منتجات رقمية لمؤسسات حكومية وشركات ناشئة.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "https://sufyanfa.com/projects.png",
  ogUrl: "https://sufyanfa.com/projects",
  ogType: "website",
  ogLocale: "ar_SA",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: "https://sufyanfa.com/projects.png",
});

const { data: projects } = await useAsyncData("projects-all", () =>
  queryContent("/projects").sort({ order: 1 }).find()
);

useHead({
  link: [{ rel: "canonical", href: "https://sufyanfa.com/projects" }],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: title,
        description,
        numberOfItems: projects.value?.length ?? 0,
        itemListElement: (projects.value ?? []).map((p: any, i: number) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "CreativeWork",
            name: p.name,
            description: p.outcome ?? p.tagline,
            url: p.url,
          },
        })),
      }),
    },
  ],
});

const companies = [
  { name: "هيئة تطوير منطقة عسير", logo: "/companies/asser.svg" },
  { name: "مجلس الجمعيات الأهلية", logo: "/companies/ccsa.svg" },
  { name: "إمارة منطقة عسير", logo: "/companies/assir.svg" },
  { name: "هيئة الغذاء والدواء", logo: "/companies/sfda.svg" },
  { name: "جامعة الملك خالد", logo: "/companies/kku.svg" },
  { name: "الهيئة الملكية للجبيل وينبع", logo: "/companies/rcjy.svg" },
  { name: "جامعة الملك فهد للبترول والمعادن", logo: "/companies/kfupm.svg" },
  { name: "تراحم", logo: "/companies/trahum.svg" },
];
</script>

<style scoped>
@keyframes companies-scroll-animation {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
.companies-scroll {
  animation: companies-scroll-animation 40s linear infinite;
  will-change: transform;
}
.companies-scroll:hover {
  animation-play-state: paused;
}
</style>
