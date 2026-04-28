<template>
  <NuxtLoadingIndicator color="#3B5A3B" />
  <AppNavbar />
  <main>
    <NuxtPage />
  </main>
  <AppFooter />
</template>

<script setup>
useSeoMeta({
  ogSiteName: "سفيان فارع",
  ogLocale: "ar_SA",
  twitterSite: "@sufyanfa",
  twitterCreator: "@sufyanfa",
});

useHead({
  htmlAttrs: { lang: "ar", dir: "rtl" },
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "سفيان فارع",
        alternateName: "Sufyan Farea",
        jobTitle: "شريك تقني لبناء منتجات رقمية",
        url: "https://sufyanfa.com",
        image: "https://sufyanfa.com/sufyan.jpeg",
        sameAs: [
          "https://x.com/sufyanfa",
          "https://www.linkedin.com/in/sufyanfa/",
          "https://github.com/sufyanfa",
        ],
        knowsAbout: [
          "Software Engineering",
          "Web Development",
          "Technical Consulting",
          "Product Development",
        ],
        worksFor: {
          "@type": "ProfessionalService",
          name: "سفيان فارع — شريك تقني",
          url: "https://sufyanfa.com",
          areaServed: "Saudi Arabia",
        },
      }),
    },
  ],
});
</script>

<style>
body {
  font-family: "Rubik", sans-serif;
}
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
</style>
