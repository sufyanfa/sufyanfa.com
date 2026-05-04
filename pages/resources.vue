<template>
  <main>
    <AppHeader title="موارد" :description="description" eyebrow="بنيتها لك" />

    <section class="bg-gray-50 border-y border-black/[0.04]">
      <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-20">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <a
            v-for="resource in resources"
            :key="resource.id"
            :href="resource.url"
            target="_blank"
            rel="noopener"
            class="group block bg-white border border-black/[0.04] hover:border-black/10 rounded-2xl p-6 sm:p-7 transition-colors"
          >
            <div class="flex items-start justify-between gap-4 mb-4">
              <div
                class="w-11 h-11 rounded-xl bg-cream flex items-center justify-center flex-shrink-0"
              >
                <Icon :name="resource.icon" class="w-5 h-5 text-ink" />
              </div>
              <Icon
                name="lucide:arrow-up-left"
                class="w-4 h-4 text-ink-mute group-hover:text-ink transition-colors flex-shrink-0 mt-1"
              />
            </div>

            <h3 class="text-lg font-bold text-ink mb-2 leading-snug">
              {{ resource.title }}
            </h3>
            <p class="text-sm text-ink-soft leading-relaxed mb-4">
              {{ resource.description }}
            </p>

            <div class="flex items-center gap-2 text-xs">
              <span
                class="px-2.5 py-1 rounded-full bg-cream text-ink-soft font-medium"
              >
                {{ resource.tag }}
              </span>
              <span class="text-ink-mute">{{ getHost(resource.url) }}</span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <HomeFinalCTA />
  </main>
</template>

<script setup lang="ts">
const title = "الموارد | محتوى وأدوات تساعدك | سفيان فارع";
const description =
  "محتوى وأدوات بنيتها لمساعدتك على بناء وإطلاق منتجاتك الرقمية بشكل أفضل.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "https://sufyanfa.com/preview.png",
  ogUrl: "https://sufyanfa.com/resources",
  ogType: "website",
  ogLocale: "ar_SA",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: "https://sufyanfa.com/preview.png",
});

useHead({
  link: [{ rel: "canonical", href: "https://sufyanfa.com/resources" }],
});

const resources = [
  {
    id: 1,
    title: "دليل الشركات الناشئة",
    description:
      "دليل تفاعلي لتعلم ريادة الأعمال وبناء Startup ناجح خطوة بخطوة. 8 فصول عملية مع اختبارات تفاعلية.",
    url: "https://startup.sufyanfa.com",
    tag: "دليل تفاعلي",
    icon: "lucide:rocket",
  },
  {
    id: 2,
    title: "اسأل",
    description:
      "أداة للمدربين والمحاضرين تتيح للجمهور طرح الأسئلة عبر مسح QR، بدون حسابات أو تطبيقات، مع وصولها فورًا وبشكل سري.",
    url: "https://asaal.sufyanfa.workers.dev",
    tag: "أداة مجانية",
    icon: "lucide:message-circle-question",
  },
];

function getHost(url: string) {
  const parsedUrl = new URL(url);
  let host = parsedUrl.host;
  if (host.startsWith("www.")) host = host.substring(4);
  return host;
}
</script>
