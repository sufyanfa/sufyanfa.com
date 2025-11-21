<template>
  <main class="min-h-screen">
    <AppHeader class="mb-8" title="المراجع" :description="description" />
    <ul class="space-y-2">
      <li v-for="bookmark in bookmarks" :key="bookmark.id">
        <a
          :href="bookmark.url"
          target="_blank"
          class="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-white/10 p-2 rounded-lg -m-2 text-sm min-w-0"
        >
          <UAvatar
            :src="getThumbnail(bookmark.url)"
            :alt="bookmark.label"
            :ui="{ rounded: 'rounded-md' }"
          />
          <p class="truncate text-gray-700 dark:text-gray-200">
            {{ bookmark.label }}
          </p>
          <span class="flex-1"></span>
          <span class="text-xs font-medium text-gray-400 dark:text-gray-600">
            {{ getHost(bookmark.url) }}
          </span>
        </a>
      </li>
    </ul>
  </main>
</template>

<script setup>
const title = "المراجع | أدوات وموارد تطوير الويب | سفيان فارع";
const description = "مجموعة مختارة من أفضل الأدوات والموارد التقنية: منصات التطوير، أدوات التصميم، خدمات السحابة، والمصادر المفيدة لبناء منتجات رقمية احترافية.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://sufyanfa.com/preview.png',
  ogUrl: 'https://sufyanfa.com/bookmarks',
  ogType: 'website',
  ogLocale: 'ar_SA',
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: 'https://sufyanfa.com/preview.png',
});

useHead({
  link: [
    { rel: 'canonical', href: 'https://sufyanfa.com/bookmarks' }
  ]
});

const bookmarks = [
  {
    id: 1,
    label: "Fast deployment for web apps",
    url: "https://vercel.com/"
  },
  {
    id: 2,
    label: "Collaborative UI/UX design tool",
    url: "https://www.figma.com/"
  },
  {
    id: 3,
    label: "API testing and documentation",
    url: "https://httpie.io/"
  },
  {
    id: 4,
    label: "Speed. Security. Global scale.",
    url: "https://cloudflare.com/"
  },
  {
    id: 5,
    label: "Free and open-source web analytics",
    url: "https://umami.is/"
  },
  {
    id: 6,
    label: "Open-source alternatives, beautifully curated",
    url: "https://openalternative.co/"
  },
  {
    id: 7,
    label: "UI components built with Tailwind CSS",
    url: "https://ui.shadcn.com/"
  },
  {
    id: 8,
    label: "Linear - Issue tracking and project management",
    url: "https://linear.app/"
  },
  {
    id: 9,
    label: "Open-source Firebase alternative",
    url: "https://supabase.com/"
  },
];

function getHost(url) {
  const parsedUrl = new URL(url);
  let host = parsedUrl.host;
  if (host.startsWith("www.")) {
    host = host.substring(4);
  }
  return host;
}

function getThumbnail(url) {
  const host = getHost(url);
  return `https://logo.clearbit.com/${host}`;
}
</script>
