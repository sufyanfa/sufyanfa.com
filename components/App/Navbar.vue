<template>
  <nav class="sticky top-0 z-50 bg-cream/90 backdrop-blur">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 h-[68px] flex items-center gap-7">
      <NuxtLink
        to="/"
        class="font-extrabold text-[15px] sm:text-base text-ink tracking-tight hover:opacity-80 transition-opacity"
        aria-label="الصفحة الرئيسية"
      >
        سفيان فارع
      </NuxtLink>

      <ul class="hidden md:flex items-center gap-7 text-sm text-ink-soft">
        <li v-for="item in items" :key="item.path">
          <NuxtLink
            :to="item.path"
            class="hover:text-ink transition-colors"
            active-class="text-ink font-semibold"
          >
            {{ item.name }}
          </NuxtLink>
        </li>
      </ul>

      <div class="flex-1"></div>

      <NuxtLink
        to="https://cal.com/sufyanfa/15min/"
        target="_blank"
        external
        class="hidden sm:inline-flex items-center gap-2 bg-ink text-white rounded-full px-5 py-2 text-[13px] font-semibold hover:bg-ink/90 transition-colors"
      >
        احجز جلسة مجانية
      </NuxtLink>

      <button
        class="md:hidden p-2 -mr-2 text-ink"
        aria-label="القائمة"
        @click="open = !open"
      >
        <Icon :name="open ? 'lucide:x' : 'lucide:menu'" class="w-6 h-6" />
      </button>
    </div>

    <div
      v-if="open"
      class="md:hidden bg-cream border-t border-cream-deep/40"
    >
      <ul class="px-6 py-4 flex flex-col gap-1 text-[15px]">
        <li v-for="item in items" :key="item.path">
          <NuxtLink
            :to="item.path"
            class="block py-3 text-ink-soft hover:text-ink"
            active-class="text-ink font-semibold"
            @click="open = false"
          >
            {{ item.name }}
          </NuxtLink>
        </li>
        <li class="pt-3">
          <NuxtLink
            to="https://cal.com/sufyanfa/15min/"
            target="_blank"
            external
            class="block bg-ink text-white text-center rounded-full px-5 py-3 text-[14px] font-semibold"
            @click="open = false"
          >
            احجز جلسة مجانية
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
const open = ref(false);

const items = [
  { name: "الخدمات", path: "/services" },
  { name: "المشاريع", path: "/projects" },
  { name: "المقالات", path: "/articles" },
];

const route = useRoute();
watch(() => route.path, () => (open.value = false));
</script>
