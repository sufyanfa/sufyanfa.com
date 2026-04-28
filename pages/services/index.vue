<template>
  <main>
    <AppHeader title="الخدمات" :description="description" eyebrow="ما أقدّمه" />

    <section class="bg-gray-50 border-y border-black/[0.04]">
      <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-20">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <AppServiceCard
            v-for="(service, id) in services"
            :key="id"
            :service="(service as any)"
            @inquiry="openInquiry"
          />
        </div>
      </div>
    </section>

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

useHead({
  link: [{ rel: "canonical", href: "https://sufyanfa.com/services" }],
});

const { data: services } = await useAsyncData("services-all", () =>
  queryContent("/services").sort({ order: 1 }).find()
);

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
