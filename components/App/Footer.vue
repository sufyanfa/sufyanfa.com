<template>
  <footer class="bg-white border-t border-black/[0.06]">
    <div
      class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-7 flex flex-col items-center gap-5 sm:flex-row sm:justify-between sm:gap-4 text-sm"
    >
      <div class="flex items-center gap-3 flex-wrap justify-center sm:flex-nowrap">
        <span
          class="font-extrabold text-ink text-[15px] leading-[0.95] tracking-tight flex flex-col gap-[2px]"
        >
          <span>سفيان فارع</span>
        </span>
        <span class="text-ink-mute hidden sm:inline mx-1">·</span>
        <span class="text-ink-mute text-xs">© {{ year }}</span>
      </div>
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

const links = [
  { name: "X", url: "https://x.com/sufyanfa", icon: "mdi:twitter" },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/sufyanfa/",
    icon: "mdi:linkedin",
  },
  { name: "GitHub", url: "https://github.com/sufyanfa", icon: "mdi:github" },
  { name: "البريد", url: "mailto:hi@sufyanfa.com", icon: "lucide:mail" },
];
</script>
