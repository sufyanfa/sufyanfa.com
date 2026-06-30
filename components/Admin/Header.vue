<template>
  <header class="border-b border-black/[0.06] bg-white">
    <div class="max-w-5xl mx-auto px-6 sm:px-8 h-14 flex items-center justify-between">
      <NuxtLink to="/admin/proposals" class="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
        <img src="/logo.svg" alt="" class="h-6 w-auto" />
        <span class="text-[12px] font-semibold uppercase tracking-wide text-ink-mute">لوحة التحكم</span>
      </NuxtLink>
      <div class="flex items-center gap-4 text-[13px]">
        <span v-if="me?.email" class="text-ink-mute hidden sm:inline" dir="ltr">{{ me.email }}</span>
        <button
          @click="logout"
          class="text-ink-soft hover:text-ink transition-colors inline-flex items-center gap-1.5"
        >
          <Icon name="lucide:log-out" class="w-4 h-4" />
          خروج
        </button>
      </div>
    </div>
    <nav class="max-w-5xl mx-auto px-6 sm:px-8 flex items-center gap-1 text-[13px] pb-2">
      <NuxtLink to="/admin/proposals" class="px-3 py-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors">العروض</NuxtLink>
      <NuxtLink to="/admin/invoices" class="px-3 py-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors">الفواتير</NuxtLink>
      <NuxtLink to="/admin/projects" class="px-3 py-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors">المشاريع</NuxtLink>
      <NuxtLink to="/admin/customers" class="px-3 py-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors">العملاء</NuxtLink>
      <NuxtLink to="/admin/whatsapp" class="px-3 py-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors">واتساب</NuxtLink>
      <NuxtLink to="/admin/settings" class="px-3 py-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors">الإعدادات</NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
const { data: me } = await useFetch<{ id: number; email: string }>('/api/admin/me', { lazy: true })

async function logout() {
  try { await $fetch('/api/admin/logout', { method: 'POST' }) } catch {}
  await navigateTo('/admin/login')
}
</script>
