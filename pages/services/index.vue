<template>
  <main>
    <AppHeader title="كيف أساعدك؟" :description="description" eyebrow="الخدمات" />

    <section class="bg-white py-16 sm:py-20 border-b border-black/[0.04]">
      <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <AppServiceCard
            v-for="(service, id) in services"
            :key="id"
            :service="(service as any)"
            @inquiry="openInquiry"
          />
        </div>
      </div>
    </section>

    <HomeProcess />

    <HomeFinalCTA />

    <AppProjectInquiryModal
      v-model="modalOpen"
      :service="active.service"
      :eyebrow="active.eyebrow"
      :headline="active.headline"
      :message-placeholder="active.placeholder"
    />
  </main>
</template>

<script setup lang="ts">
const title = "الخدمات التقنية | سفيان فارع";
const description =
  "ثلاث طرق لمساعدتك: استشارة تقنية لخطة واضحة، تطوير منتج جاهز للإطلاق، أو إرشاد مستمر لشركتك الناشئة.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "https://sufyanfa.com/preview.png",
  ogUrl: "https://sufyanfa.com/services",
  ogType: "website",
  ogLocale: "ar_SA",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: "https://sufyanfa.com/preview.png",
});

const { data: services } = await useAsyncData("services-all", () =>
  queryContent("/services").sort({ order: 1 }).find()
);

useHead({
  link: [{ rel: "canonical", href: "https://sufyanfa.com/services" }],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: title,
        description,
        numberOfItems: services.value?.length ?? 0,
        itemListElement: (services.value ?? []).map((s: any, i: number) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Service",
            name: s.name,
            description: s.tagline ?? s.description,
            url: `https://sufyanfa.com${s.url}`,
            provider: {
              "@type": "Person",
              name: "سفيان فارع",
              url: "https://sufyanfa.com",
            },
          },
        })),
      }),
    },
  ],
});

const modalOpen = ref(false);
const active = ref({
  service: "",
  eyebrow: "",
  headline: "",
  placeholder: "",
});

const openInquiry = (s: any) => {
  active.value = {
    service: s.inquiryService ?? s.name,
    eyebrow: s.tag ?? "",
    headline: s.name,
    placeholder: s.inquiryPlaceholder ?? "اشرح لي مشروعك باختصار.",
  };
  modalOpen.value = true;
};
</script>
