<script setup lang="ts">
definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

interface Customer {
  id: number
  name: string
  email: string | null
  phone: string | null
  company: string | null
  invoice_count: number
  last_invoice_at: number | null
}

const { data } = await useFetch<{ customers: Customer[] }>('/api/admin/customers')

function fmtDate(ms: number | null): string {
  if (!ms) return '—'
  return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(new Date(ms))
}

useHead({
  title: 'العملاء · لوحة التحكم',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
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
          <h1 class="text-3xl font-bold text-ink tracking-tight">العملاء</h1>
        </div>
        <NuxtLink
          to="/admin/customers/new"
          class="inline-flex items-center gap-2 bg-ink text-white rounded-full px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          عميل جديد
        </NuxtLink>
      </div>

      <div v-if="!data?.customers?.length" class="bg-cream-deep rounded-3xl p-12 text-center">
        <div class="text-ink-mute text-sm">لا يوجد عملاء بعد.</div>
        <NuxtLink
          to="/admin/customers/new"
          class="inline-flex items-center gap-2 mt-5 bg-ink text-white rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          أنشئ أول عميل
        </NuxtLink>
      </div>

      <div v-else class="bg-cream-deep rounded-3xl overflow-hidden">
        <table class="w-full text-sm">
          <thead class="text-right">
            <tr class="grid grid-cols-12 gap-4 px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-mute border-b border-black/[0.06]">
              <th class="col-span-4 text-start font-semibold">الاسم</th>
              <th class="col-span-3 text-start font-semibold">البريد</th>
              <th class="col-span-2 text-start font-semibold">الهاتف</th>
              <th class="col-span-1 text-center font-semibold">الفواتير</th>
              <th class="col-span-2 text-end font-semibold">آخر فاتورة</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in data.customers"
              :key="c.id"
              class="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-black/[0.04] last:border-0 hover:bg-white transition-colors"
            >
              <td class="col-span-4">
                <NuxtLink :to="`/admin/customers/${c.id}`" class="font-semibold text-ink hover:underline">{{ c.name }}</NuxtLink>
                <div v-if="c.company" class="text-[12px] text-ink-mute mt-0.5">{{ c.company }}</div>
              </td>
              <td class="col-span-3 text-ink-soft truncate">{{ c.email || '—' }}</td>
              <td class="col-span-2 text-ink-soft" dir="ltr">{{ c.phone || '—' }}</td>
              <td class="col-span-1 text-center font-semibold text-ink tabular-nums">{{ c.invoice_count }}</td>
              <td class="col-span-2 text-end text-[12px] text-ink-mute">{{ fmtDate(c.last_invoice_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
