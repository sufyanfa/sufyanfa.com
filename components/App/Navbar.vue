<template>
  <nav class="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-black/[0.04] transition-all">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-12 h-[70px] flex items-center justify-between gap-6">
      <div class="flex items-center gap-8">
        <NuxtLink
          to="/"
          class="hover:opacity-80 transition-opacity flex items-center gap-2"
          aria-label="الصفحة الرئيسية"
        >
          <img src="/logo.svg" alt="سفيان فارع" class="h-6 sm:h-7 w-auto" />
        </NuxtLink>

        <ul class="hidden md:flex items-center gap-6 text-[14px] text-ink-soft">
          <li v-for="item in items" :key="item.path">
            <NuxtLink
              :to="item.path"
              data-umami-event="nav-link-click"
              :data-umami-event-target="item.path"
              class="hover:text-ink transition-colors font-medium py-1"
              active-class="text-ink font-semibold"
            >
              {{ item.name }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="flex items-center gap-4">
        <NuxtLink
          to="https://cal.com/sufyanfa/15min/"
          target="_blank"
          external
          data-umami-event="cta-book-call"
          data-umami-event-position="navbar-desktop"
          class="hidden sm:inline-flex items-center justify-center bg-ink hover:bg-black text-white rounded-full px-5 py-2 text-[13px] font-medium transition-all shadow-sm"
        >
          احجز جلسة
        </NuxtLink>

        <button
          class="md:hidden p-2 -mr-2 text-ink rounded-lg hover:bg-cream-deep transition-colors"
          aria-label="القائمة"
          data-umami-event="nav-mobile-menu-toggle"
          @click="open = !open"
        >
          <Icon :name="open ? 'lucide:x' : 'lucide:menu'" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div
      v-if="open"
      class="md:hidden bg-white border-t border-black/[0.04] px-6 py-4 shadow-lg"
    >
      <ul class="flex flex-col gap-1 text-[15px]">
        <li v-for="item in items" :key="item.path">
          <NuxtLink
            :to="item.path"
            data-umami-event="nav-link-click"
            :data-umami-event-target="item.path"
            class="block py-2.5 text-ink-soft hover:text-ink font-medium"
            active-class="text-ink font-semibold"
            @click="open = false"
          >
            {{ item.name }}
          </NuxtLink>
        </li>
        <li class="pt-3 mt-1 border-t border-black/[0.04]">
          <NuxtLink
            to="https://cal.com/sufyanfa/15min/"
            target="_blank"
            external
            data-umami-event="cta-book-call"
            data-umami-event-position="navbar-mobile"
            class="block bg-ink text-white text-center rounded-full px-5 py-2.5 text-[14px] font-medium"
            @click="open = false"
          >
            احجز جلسة
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
const open = ref(false);

const items = [
  { name: "عني", path: "/about" },
  { name: "الخدمات", path: "/services" },
  { name: "المشاريع", path: "/projects" },
  { name: "المدونة", path: "/articles" },
];

const route = useRoute();
watch(() => route.path, () => (open.value = false));
</script>
