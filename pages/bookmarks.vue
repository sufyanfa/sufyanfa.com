<template>
  <main>
    <AppHeader title="المراجع" :description="description" eyebrow="أدوات أحبها" />

    <section class="bg-gray-50 border-y border-black/[0.04]">
      <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-20">
        <ul class="max-w-3xl mx-auto flex flex-col gap-2">
          <li v-for="bookmark in bookmarks" :key="bookmark.id">
            <a
              :href="bookmark.url"
              target="_blank"
              class="flex items-center gap-3 bg-white border border-black/[0.04] hover:border-black/10 p-3 rounded-2xl text-sm min-w-0 transition-colors"
            >
              <img
                :src="getThumbnail(bookmark.url)"
                :alt="bookmark.label"
                class="w-9 h-9 rounded-lg flex-shrink-0"
                loading="lazy"
              />
              <p class="truncate text-ink font-medium">{{ bookmark.label }}</p>
              <span class="flex-1"></span>
              <span class="text-xs font-medium text-ink-mute">{{ getHost(bookmark.url) }}</span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const title = "المراجع | أدوات وموارد تطوير الويب | سفيان فارع";
const description =
  "مجموعة مختارة من أفضل الأدوات والموارد التقنية لبناء منتجات رقمية احترافية.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "https://sufyanfa.com/preview.png",
  ogUrl: "https://sufyanfa.com/bookmarks",
  ogType: "website",
  ogLocale: "ar_SA",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: "https://sufyanfa.com/preview.png",
});

useHead({
  link: [{ rel: "canonical", href: "https://sufyanfa.com/bookmarks" }],
});

const bookmarks = [
  { id: 1, label: "Fast deployment for web apps", url: "https://vercel.com/" },
  { id: 2, label: "Collaborative UI/UX design tool", url: "https://www.figma.com/" },
  { id: 3, label: "API testing and documentation", url: "https://httpie.io/" },
  { id: 4, label: "Speed. Security. Global scale.", url: "https://cloudflare.com/" },
  { id: 5, label: "Free and open-source web analytics", url: "https://umami.is/" },
  { id: 6, label: "Open-source alternatives, beautifully curated", url: "https://openalternative.co/" },
  { id: 7, label: "UI components built with Tailwind CSS", url: "https://ui.shadcn.com/" },
  { id: 8, label: "Linear - issue tracking and project management", url: "https://linear.app/" },
  { id: 9, label: "Open-source Firebase alternative", url: "https://supabase.com/" },
];

function getHost(url: string) {
  const parsedUrl = new URL(url);
  let host = parsedUrl.host;
  if (host.startsWith("www.")) host = host.substring(4);
  return host;
}

function getThumbnail(url: string) {
  return `https://logo.clearbit.com/${getHost(url)}`;
}
</script>
