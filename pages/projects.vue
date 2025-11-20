<template>
  <main class="min-h-screen">
    <AppHeader class="mb-12" title="المشاريع" :description="description" />
    <section class="mb-16">
      <div class="mb-8">
        <p class="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
          المؤسسات والشركات التي ساهمت في تطوير مشاريعها ودعمها تقنياً
        </p>
      </div>
      
      <div class="relative overflow-hidden" dir="ltr">
        <div class="companies-scroll inline-flex gap-8">
          <div 
            v-for="(company, index) in [...companies, ...companies]" 
            :key="`${company.name}-${index}`"
            class="flex-shrink-0"
          >
            <div class="w-32 h-32 flex items-center justify-center p-4 bg-transparent">
              <img 
                :src="company.logo" 
                :alt="`شعار ${company.name}`"
                class="w-full h-full object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 dark:invert dark:brightness-0 dark:contrast-200 dark:opacity-70 dark:hover:invert-0 dark:hover:brightness-100 dark:hover:contrast-100 dark:hover:opacity-100 transition-all duration-300"
                loading="lazy"
                width="128"
                height="128"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
    <section>    
      <div class="space-y-4">
        <AppProjectCard
          v-for="(project, id) in projects"
          :key="id"
          :project="project"
        />
      </div>
    </section>
  </main>
</template>

<script setup>
const title = "المشاريع التقنية | بناء مواقع وأنظمة | سفيان فارع";
const description =
  "مجموعة من المشاريع التقنية التي قمت بتطويرها، وتشمل مواقع الويب، الأنظمة الرقمية، تطوير الواجهات، إنشاء الخدمات، وتقديم حلول تقنية للجهات الحكومية والشركات.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://sufyanfa.com/projects.png',
  ogUrl: 'https://sufyanfa.com/projects',
  ogType: 'website',
  ogLocale: 'ar_SA',
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: 'https://sufyanfa.com/projects.png',
});

useHead({
  link: [
    { rel: 'canonical', href: 'https://sufyanfa.com/projects' }
  ]
});

const { data: projects } = await useAsyncData("projects-all", () =>
  queryContent("/projects").find()
);

const companies = [
  {
    name: "هيئة تطوير منطقة عسير",
    logo: "/companies/asser.svg"
  },
  {
    name: "مجلس الجمعيات الأهلية",
    logo: "/companies/ccsa.svg"
  },
  {
    name: "إمارة منطقة عسير",
    logo: "/companies/assir.svg"
  },
  {
    name: "هيئة الغذاء والدواء",
    logo: "/companies/sfda.svg"
  },
  {
    name: "جامعة الملك خالد",
    logo: "/companies/kku.svg"
  },
  {
    name: "الهيئة الملكية للجبيل وينبع",
    logo: "/companies/rcjy.svg"
  },
  {
    name: "جامعة الملك فهد للبترول والمعادن",
    logo: "/companies/kfupm.svg"
  },
  {
    name: "تراحم",
    logo: "/companies/trahum.svg"
  },
];
</script>

<style>
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