<script setup lang="ts">
definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

interface ProjectRow {
  id: number
  slug: string
  name: string
  status: string
  start_date: string | null
  end_date: string | null
  created_at: number
  customer_id: number
  customer_name: string
}

const { data, refresh } = await useFetch<{ projects: ProjectRow[] }>('/api/admin/projects')

const deleting = ref<number | null>(null)

async function remove(id: number) {
  if (!confirm('حذف المشروع؟')) return
  deleting.value = id
  try {
    await $fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    await refresh()
  } catch {}
  deleting.value = null
}

const statusLabels: Record<string, string> = {
  active: 'نشط',
  paused: 'متوقف',
  completed: 'منتهي',
  cancelled: 'ملغي',
}

const statusColors: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-100',
  paused: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  completed: 'bg-blue-50 text-blue-700 border-blue-100',
  cancelled: 'bg-red-50 text-red-700 border-red-100',
}

function fmtDate(d: string | null): string {
  if (!d) return '—'
  return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(new Date(d + 'T00:00:00'))
}

useHead({ title: 'المشاريع · لوحة التحكم', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <div class="min-h-screen bg-white">
    <AdminHeader />
    <div class="mx-auto max-w-5xl px-6 sm:px-8 py-10">
      <div class="flex items-center justify-between mb-6">
        <div>
          <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
            لوحة التحكم
          </div>
          <h1 class="text-3xl font-bold text-ink tracking-tight">المشاريع</h1>
        </div>
        <NuxtLink
          to="/admin/projects/new"
          class="inline-flex items-center gap-2 bg-ink text-white rounded-full px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
          مشروع جديد
        </NuxtLink>
      </div>

      <div v-if="!data?.projects?.length" class="bg-cream-deep rounded-3xl p-12 text-center">
        <div class="text-ink-mute text-sm">لا توجد مشاريع بعد.</div>
        <NuxtLink
          to="/admin/projects/new"
          class="inline-flex items-center gap-2 mt-5 bg-ink text-white rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          أنشئ أول مشروع
        </NuxtLink>
      </div>

      <div v-else class="bg-cream-deep rounded-3xl overflow-hidden">
        <table class="w-full text-sm">
          <thead class="text-right">
            <tr class="grid grid-cols-12 gap-4 px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-mute border-b border-black/[0.06]">
              <th class="col-span-4 text-start font-semibold">المشروع</th>
              <th class="col-span-3 text-start font-semibold">العميل</th>
              <th class="col-span-2 text-start font-semibold">تاريخ البداية</th>
              <th class="col-span-1 text-center font-semibold">الحالة</th>
              <th class="col-span-2 text-end font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in data.projects"
              :key="p.id"
              class="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-black/[0.04] last:border-0 hover:bg-white transition-colors"
            >
              <td class="col-span-4">
                <NuxtLink :to="`/admin/projects/${p.id}`" class="font-semibold text-ink hover:underline">{{ p.name }}</NuxtLink>
              </td>
              <td class="col-span-3 text-ink-soft truncate">{{ p.customer_name }}</td>
              <td class="col-span-2 text-ink-mute text-[13px]">{{ fmtDate(p.start_date) }}</td>
              <td class="col-span-1 text-center">
                <span :class="['inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border', statusColors[p.status] || 'bg-gray-50 text-gray-700 border-gray-100']">
                  {{ statusLabels[p.status] || p.status }}
                </span>
              </td>
              <td class="col-span-2 text-end">
                <button @click="remove(p.id)" :disabled="deleting === p.id" class="text-xs text-red-500 hover:underline">
                  حذف
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
