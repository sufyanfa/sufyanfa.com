<template>
  <div class="min-h-screen bg-white">
    <AdminHeader />
    <div class="max-w-5xl mx-auto px-6 sm:px-8 py-10">
      <section class="bg-white border border-black/10 rounded-2xl p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">الفواتير</h2>
          <div class="flex gap-2">
            <NuxtLink to="/admin/whatsapp" class="text-sm text-gray-500 hover:underline">واتساب</NuxtLink>
            <span class="text-gray-300">·</span>
            <NuxtLink to="/admin/customers" class="text-sm text-gray-500 hover:underline">العملاء</NuxtLink>
            <span class="text-gray-300">·</span>
            <NuxtLink to="/admin/settings" class="text-sm text-gray-500 hover:underline">الإعدادات</NuxtLink>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-6 mb-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">المعلقة</div>
            <div class="text-xl font-bold" dir="ltr">{{ formatSAR(invStats.outstanding) }}</div>
            <div class="text-xs text-gray-500 mt-0.5">{{ invStats.outstandingCount }} فاتورة</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">المتأخرة</div>
            <div class="text-xl font-bold" :class="invStats.overdue > 0 ? 'text-red-600' : ''" dir="ltr">{{ formatSAR(invStats.overdue) }}</div>
            <div class="text-xs text-gray-500 mt-0.5">{{ invStats.overdueCount }} فاتورة</div>
          </div>
        </div>
        <NuxtLink to="/admin/invoices" class="text-sm text-[#15803D] hover:underline">عرض كل الفواتير ←</NuxtLink>
      </section>

      <section class="bg-white border border-black/10 rounded-2xl p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">إيرادات العروض</h2>
        <div class="grid grid-cols-3 gap-6">
          <div>
            <div class="text-xs text-gray-500 mb-1">الإجمالي</div>
            <div class="text-xl font-bold" dir="ltr">{{ formatSAR(proposalStats.gross) }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">بعد الخصم</div>
            <div class="text-xl font-bold text-[#15803D]" dir="ltr">{{ formatSAR(proposalStats.net) }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">مجموع الخصومات</div>
            <div class="text-xl font-bold text-gray-600" dir="ltr">{{ formatSAR(proposalStats.discount) }}</div>
          </div>
        </div>
      </section>

      <header class="flex items-center justify-between mb-10">
        <div>
          <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
            لوحة التحكم
          </div>
          <h1 class="text-3xl font-bold text-ink tracking-tight">العروض</h1>
        </div>
        <NuxtLink
          to="/admin/proposals/new"
          class="inline-flex items-center gap-2 bg-ink text-white rounded-full px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
          عرض جديد
        </NuxtLink>
      </header>

      <!-- Status filter -->
      <div class="flex flex-wrap items-center gap-2 mb-6">
        <button
          v-for="f in filters"
          :key="f.value"
          @click="filter = f.value"
          :class="[
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors',
            filter === f.value
              ? 'bg-ink text-white'
              : 'bg-cream-deep text-ink-soft hover:bg-black/[0.06]'
          ]"
        >
          {{ f.label }}
          <span class="text-[11px] opacity-70">{{ counts[f.value] ?? 0 }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="text-ink-mute text-sm py-12 text-center">جارٍ التحميل…</div>

      <!-- Empty -->
      <div v-else-if="filteredProposals.length === 0" class="bg-cream-deep rounded-3xl p-12 text-center">
        <div class="text-ink-mute text-sm">لا توجد عروض.</div>
        <NuxtLink
          to="/admin/proposals/new"
          class="inline-flex items-center gap-2 mt-5 bg-ink text-white rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          أنشئ أول عرض
        </NuxtLink>
      </div>

      <!-- Table -->
      <div v-else class="bg-cream-deep rounded-3xl overflow-hidden">
        <div class="grid grid-cols-12 gap-4 px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-mute border-b border-black/[0.06]">
          <div class="col-span-4">العنوان</div>
          <div class="col-span-3">العميل</div>
          <div class="col-span-2">الحالة</div>
          <div class="col-span-1 text-end">السعر</div>
          <div class="col-span-1 text-center">المشاهدات</div>
          <div class="col-span-1 text-end">التاريخ</div>
        </div>
        <ul>
          <li
            v-for="p in filteredProposals"
            :key="p.id"
          >
            <NuxtLink
              :to="`/admin/proposals/${p.id}`"
              class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white transition-colors border-b border-black/[0.04] last:border-0"
            >
              <div class="col-span-4">
                <div class="text-sm font-semibold text-ink truncate">{{ p.title }}</div>
                <div class="text-[12px] text-ink-mute mt-0.5" dir="ltr">/p/{{ p.slug }}</div>
              </div>
              <div class="col-span-3 text-sm text-ink-soft truncate">{{ p.client_name }}</div>
              <div class="col-span-2">
                <AdminStatusBadge :status="p.status" />
              </div>
              <div class="col-span-1 text-end text-[12px] text-ink tabular-nums" dir="ltr">
                <span v-if="(p.price_after_discount ?? p.price) !== null">{{ formatSAR(p.price_after_discount ?? p.price ?? 0) }}</span>
                <span v-else class="text-ink-mute">—</span>
              </div>
              <div class="col-span-1 text-center text-sm font-semibold text-ink tabular-nums">{{ p.views_count }}</div>
              <div class="col-span-1 text-end text-[12px] text-ink-mute" dir="ltr">{{ formatDate(p.proposal_date) }}</div>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMoney } from '~/composables/useMoney'

definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

interface InvoiceRow {
  id: number; status: string; due_date: string
  subtotal: number; adjustment: number
}

const { formatSAR } = useMoney()
const { data: invData } = await useFetch<{ invoices: InvoiceRow[] }>('/api/admin/invoices')
const today = new Date().toISOString().slice(0, 10)

const invStats = computed(() => {
  let outstanding = 0, outstandingCount = 0, overdue = 0, overdueCount = 0
  for (const inv of invData.value?.invoices ?? []) {
    if (inv.status !== 'sent') continue
    const total = inv.subtotal + (inv.adjustment ?? 0)
    outstanding += total; outstandingCount++
    if (inv.due_date < today) { overdue += total; overdueCount++ }
  }
  return { outstanding, outstandingCount, overdue, overdueCount }
})

interface Proposal {
  id: number
  slug: string
  title: string
  client_name: string
  proposal_date: string
  status: string
  views_count: number
  price: number | null
  price_after_discount: number | null
}

const filter = ref<'all' | 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined'>('all')
const filters = [
  { value: 'all', label: 'الكل' },
  { value: 'draft', label: 'مسوّدة' },
  { value: 'sent', label: 'مُرسل' },
  { value: 'viewed', label: 'مُشاهَد' },
  { value: 'accepted', label: 'مقبول' },
  { value: 'declined', label: 'مرفوض' }
] as const

const { data, pending } = await useFetch<{ proposals: Proposal[] }>('/api/admin/proposals', { lazy: true })

const proposals = computed(() => data.value?.proposals ?? [])
const counts = computed(() => {
  const c: Record<string, number> = { all: proposals.value.length }
  for (const p of proposals.value) c[p.status] = (c[p.status] ?? 0) + 1
  return c
})
const proposalStats = computed(() => {
  let gross = 0, net = 0
  for (const p of proposals.value) {
    gross += p.price ?? 0
    net   += p.price_after_discount ?? p.price ?? 0
  }
  return { gross, net, discount: gross - net }
})
const filteredProposals = computed(() =>
  filter.value === 'all' ? proposals.value : proposals.value.filter(p => p.status === filter.value)
)

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('en-CA') // YYYY-MM-DD
  } catch { return d }
}

useHead({
  title: 'العروض · لوحة التحكم',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>
