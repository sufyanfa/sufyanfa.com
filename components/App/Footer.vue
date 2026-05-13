<template>
  <footer class="bg-white border-t border-black/[0.06]">
    <div
      class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-8 flex flex-col items-center gap-5 sm:flex-row sm:justify-between sm:gap-6 text-sm"
    >
      <div class="flex items-center gap-3 flex-wrap justify-center">
        <NuxtLink to="/" aria-label="الصفحة الرئيسية" class="hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="سفيان فارع" class="h-6 sm:h-7 w-auto" />
        </NuxtLink>
        <span class="text-ink-mute hidden sm:inline">·</span>
        <span class="text-ink-mute text-xs">© {{ year }}</span>
      </div>

      <ul class="flex items-center gap-5 sm:gap-6 text-ink-mute text-[13px]">
        <li v-for="page in pages" :key="page.name">
          <NuxtLink
            :to="page.path"
            class="hover:text-ink transition-colors"
          >
            {{ page.name }}
          </NuxtLink>
        </li>
      </ul>

      <ul class="flex items-center gap-5 text-ink-mute">
        <li v-for="link in links" :key="link.name">
          <NuxtLink
            :to="link.url"
            target="_blank"
            external
            class="hover:text-ink transition-colors block p-1 -m-1"
            :aria-label="link.name"
          >
            <Icon :name="link.icon" class="w-5 h-5" />
          </NuxtLink>
        </li>
      </ul>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();

const pages = [
  { name: "عني", path: "/about" },
  { name: "الموارد", path: "/resources" },
];

const links = [
  { name: "X", url: "https://x.com/sufyanfa", icon: "simple-icons:x" },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/sufyanfa/",
    icon: "mdi:linkedin",
  },
  { name: "GitHub", url: "https://github.com/sufyanfa", icon: "mdi:github" },
  { name: "البريد", url: "mailto:hi@sufyanfa.com", icon: "lucide:mail" },
];
</script>
