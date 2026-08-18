<template>
  <footer class="bg-white border-t border-black/[0.05] py-8">
    <div
      class="max-w-site mx-auto px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-5 text-sm text-ink-soft"
    >
      <div class="flex items-center gap-3.5 flex-wrap justify-center text-xs">
        <NuxtLink to="/" aria-label="الصفحة الرئيسية" class="hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="سفيان فارع" class="h-5 sm:h-6 w-auto" />
        </NuxtLink>
        <span class="text-black/20">·</span>
        <span class="text-ink-mute">© {{ year }} جميع الحقوق محفوظة</span>
      </div>

      <ul class="flex items-center gap-2">
        <li v-for="link in links" :key="link.name">
          <NuxtLink
            :to="link.url"
            target="_blank"
            external
            class="w-8 h-8 rounded-full bg-cream-deep hover:bg-ink hover:text-white flex items-center justify-center text-ink transition-all shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
            :aria-label="link.name"
          >
            <Icon :name="link.icon" class="w-3.5 h-3.5" />
          </NuxtLink>
        </li>
      </ul>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();

const links = [
  { name: "X", url: "https://x.com/sufyanfa", icon: "simple-icons:x" },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/sufyanfa/",
    icon: "mdi:linkedin",
  },
  { name: "GitHub", url: "https://github.com/sufyanfa", icon: "mdi:github" },
  { name: "البريد", url: "mailto:sfmu1998@gmail.com", icon: "lucide:mail" },
];
</script>
