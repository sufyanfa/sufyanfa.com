<template>
  <div class="min-h-screen bg-white">
    <AdminHeader />
    <div class="max-w-6xl mx-auto px-6 sm:px-8 py-10">

      <!-- ─── Header ─── -->
      <header class="flex items-center justify-between mb-8">
        <div>
          <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
            لوحة التحكم
          </div>
          <h1 class="text-3xl font-bold text-ink tracking-tight">العروض</h1>
          <p class="text-sm text-ink-soft mt-1">
            {{ stats.total }} عرض
            <template v-if="stats.total > 0">
              · {{ stats.accepted }} مقبول ({{ stats.acceptanceRate }}%)
              · {{ stats.totalViews }} مشاهدة
            </template>
          </p>
        </div>
        <NuxtLink
          to="/admin/proposals/new"
          class="inline-flex items-center gap-2 bg-ink text-white rounded-full px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
          عرض جديد
        </NuxtLink>
      </header>

      <!-- ─── KPI Cards ─── -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <div class="bg-cream-deep rounded-2xl p-5">
          <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-1">إجمالي العروض</div>
          <div class="text-2xl font-bold text-ink tabular-nums">{{ stats.total }}</div>
        </div>
        <div class="bg-cream-deep rounded-2xl p-5">
          <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-1">المرسلة</div>
          <div class="text-2xl font-bold text-ink tabular-nums">{{ stats.sent + stats.viewed + stats.accepted + stats.declined }}</div>
          <div class="text-[11px] text-ink-mute mt-0.5">{{ stats.sent }} في الانتظار</div>
        </div>
        <div class="bg-cream-deep rounded-2xl p-5">
          <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-1">نسبة القبول</div>
          <div class="text-2xl font-bold tabular-nums" :class="stats.acceptanceRate >= 50 ? 'text-[#15803D]' : 'text-ink'">
            {{ stats.total > 0 ? stats.acceptanceRate : '—' }}<span v-if="stats.total > 0">%</span>
          </div>
          <div v-if="stats.decided > 0" class="text-[11px] text-ink-mute mt-0.5">
            {{ stats.accepted }} من {{ stats.decided }} قرّروا
          </div>
        </div>
        <div class="bg-cream-deep rounded-2xl p-5">
          <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-1">الإيرادات</div>
          <div class="text-2xl font-bold text-ink tabular-nums truncate" dir="ltr">{{ formatSAR(stats.totalRevenue) }}</div>
          <div v-if="stats.discountTotal > 0" class="text-[11px] text-ink-mute mt-0.5">خصم {{ formatSAR(stats.discountTotal) }}</div>
        </div>
        <div class="bg-cream-deep rounded-2xl p-5">
          <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-1">المشاهدات</div>
          <div class="text-2xl font-bold text-ink tabular-nums">{{ stats.totalViews }}</div>
          <div v-if="stats.avgViews > 0" class="text-[11px] text-ink-mute mt-0.5">معدل {{ stats.avgViews }}/عرض</div>
        </div>
      </div>

      <!-- ─── Status Distribution ─── -->
      <div v-if="stats.total > 0" class="bg-cream-deep rounded-2xl p-5 mb-6">
        <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-3">توزيع الحالات</div>
        <div class="flex h-2 rounded-full overflow-hidden bg-black/[0.06]">
          <div
            v-for="seg in statusSegments"
            :key="seg.status"
            :style="{ width: seg.pct + '%' }"
            :class="seg.barClass"
            class="h-full transition-all"
            :title="seg.label + ': ' + seg.count"
          ></div>
        </div>
        <div class="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[12px]">
          <div v-for="seg in statusSegments" :key="seg.status" class="inline-flex items-center gap-1.5">
            <span :class="['w-2 h-2 rounded-full', seg.dotClass]"></span>
            <span class="text-ink-soft">{{ seg.label }}</span>
            <span class="text-ink-mute tabular-nums">{{ seg.count }}</span>
          </div>
        </div>
      </div>

      <!-- ─── Expiring Soon Banner ─── -->
      <div
        v-if="expiringSoon.length > 0"
        class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3"
      >
        <Icon name="lucide:clock" class="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div class="text-sm text-amber-800">
          <span class="font-semibold">{{ expiringSoon.length }}</span> عروض على وشك الانتهاء:
          <span v-for="(p, i) in expiringSoon" :key="p.id">
            <NuxtLink :to="`/admin/proposals/${p.id}`" class="font-semibold underline hover:no-underline">{{ p.title }}</NuxtLink>{{ i < expiringSoon.length - 1 ? '، ' : '' }}
          </span>
        </div>
      </div>

      <!-- ─── Search + Filters ─── -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div class="relative w-full sm:w-64">
          <Icon name="lucide:search" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-mute pointer-events-none" />
          <input
            v-model="search"
            type="text"
            placeholder="ابحث بالعنوان أو اسم العميل…"
            class="w-full bg-cream-deep border border-transparent focus:border-black/[0.12] rounded-full px-4 py-2.5 pr-10 text-[13px] text-ink outline-none transition-all placeholder:text-ink-mute/60"
          />
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            v-for="f in filters"
            :key="f.value"
            @click="filter = f.value"
            :class="[
              'rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors',
              filter === f.value
                ? 'bg-ink text-white'
                : 'bg-cream-deep text-ink-soft hover:bg-black/[0.06]'
            ]"
          >
            {{ f.label }}
            <span class="text-[11px] opacity-70 me-0.5">{{ f.count }}</span>
          </button>
        </div>
      </div>

      <!-- ─── Loading ─── -->
      <div v-if="pending" class="text-ink-mute text-sm py-16 text-center">جارٍ التحميل…</div>

      <!-- ─── Empty ─── -->
      <div v-else-if="filteredProposals.length === 0" class="bg-cream-deep rounded-3xl p-16 text-center">
        <div class="text-ink-mute text-sm mb-4">
          <template v-if="search || filter !== 'all'">لا توجد عروض تطابق بحثك.</template>
          <template v-else>لا توجد عروض بعد.</template>
        </div>
        <NuxtLink
          to="/admin/proposals/new"
          class="inline-flex items-center gap-2 bg-ink text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
          أنشئ أول عرض
        </NuxtLink>
      </div>

      <!-- ─── Table ─── -->
      <div v-else class="bg-cream-deep rounded-3xl overflow-hidden">
        <div class="hidden sm:grid grid-cols-12 gap-3 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-ink-mute border-b border-black/[0.06]">
          <button @click="toggleSort('title')" class="col-span-4 flex items-center gap-1 text-start hover:text-ink transition-colors">
            العنوان <SortIcon :active="sortKey === 'title'" :dir="sortDir" />
          </button>
          <button @click="toggleSort('client_name')" class="col-span-2 flex items-center gap-1 text-start hover:text-ink transition-colors">
            العميل <SortIcon :active="sortKey === 'client_name'" :dir="sortDir" />
          </button>
          <div class="col-span-2">الحالة</div>
          <button @click="toggleSort('price_after_discount')" class="col-span-1 flex items-center gap-1 justify-end hover:text-ink transition-colors">
            السعر <SortIcon :active="sortKey === 'price_after_discount'" :dir="sortDir" />
          </button>
          <button @click="toggleSort('views_count')" class="col-span-1 flex items-center gap-1 justify-center hover:text-ink transition-colors">
            المشاهدات <SortIcon :active="sortKey === 'views_count'" :dir="sortDir" />
          </button>
          <button @click="toggleSort('proposal_date')" class="col-span-1 flex items-center gap-1 justify-end hover:text-ink transition-colors">
            التاريخ <SortIcon :active="sortKey === 'proposal_date'" :dir="sortDir" />
          </button>
          <div class="col-span-1"></div>
        </div>
        <ul>
          <li
            v-for="p in filteredProposals"
            :key="p.id"
          >
            <NuxtLink
              :to="`/admin/proposals/${p.id}`"
              class="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 px-6 py-4 items-center hover:bg-white transition-colors border-b border-black/[0.04] last:border-0"
            >
              <div class="col-span-4 min-w-0">
                <div class="text-sm font-semibold text-ink truncate">{{ p.title }}</div>
                <div class="text-[12px] text-ink-mute mt-0.5 truncate" dir="ltr">/p/{{ p.slug }}</div>
              </div>
              <div class="col-span-2 text-sm text-ink-soft truncate">{{ p.client_name }}</div>
              <div class="col-span-2">
                <AdminStatusBadge :status="p.status" />
                <span v-if="isExpired(p)" class="me-1.5">
                  <AdminStatusBadge status="expired" />
                </span>
              </div>
              <div class="col-span-1 text-end text-[12px] tabular-nums" dir="ltr">
                <template v-if="p.price !== null || p.price_after_discount !== null">
                  <span v-if="p.price_after_discount !== null && p.price_after_discount !== p.price" class="text-ink font-semibold">{{ formatSAR(p.price_after_discount) }}</span>
                  <span v-else class="text-ink font-semibold">{{ formatSAR(p.price ?? 0) }}</span>
                  <div v-if="p.price_after_discount !== null && p.price !== null && p.price_after_discount !== p.price" class="text-[11px] text-ink-mute line-through">{{ formatSAR(p.price) }}</div>
                </template>
                <span v-else class="text-ink-mute">—</span>
              </div>
              <div class="col-span-1 text-center text-sm font-semibold text-ink tabular-nums">{{ p.views_count }}</div>
              <div class="col-span-1 text-end text-[12px] text-ink-mute" dir="ltr">{{ formatDate(p.proposal_date) }}</div>
              <div class="col-span-1 hidden sm:flex justify-end">
                <Icon name="lucide:chevron-left" class="w-4 h-4 text-ink-mute/40" />
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- ─── Footer summary ─── -->
      <div v-if="filteredProposals.length > 0" class="text-center text-[12px] text-ink-mute mt-6">
        {{ filteredProposals.length }} من {{ stats.total }} عرض
        <template v-if="search || filter !== 'all'"> —  </template>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useMoney } from '~/composables/useMoney'

definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

const { formatSAR } = useMoney()

// ─── Data ───

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
  expires_at: number | null
  created_at: number
}

const { data, pending } = await useFetch<{ proposals: Proposal[] }>('/api/admin/proposals', { lazy: true })
const proposals = computed(() => data.value?.proposals ?? [])

// ─── KPI Stats ───

const stats = computed(() => {
  let draft = 0, sent = 0, viewed = 0, accepted = 0, declined = 0
  let totalViews = 0, totalRevenue = 0, grossRevenue = 0
  const now = Date.now()

  for (const p of proposals.value) {
    if (p.status === 'draft') draft++
    else if (p.status === 'sent') sent++
    else if (p.status === 'viewed') viewed++
    else if (p.status === 'accepted') accepted++
    else if (p.status === 'declined') declined++
    totalViews += p.views_count ?? 0
    grossRevenue += p.price ?? 0
    totalRevenue += p.price_after_discount ?? p.price ?? 0
  }

  const decided = accepted + declined
  const total = proposals.value.length
  const acceptanceRate = decided > 0 ? Math.round((accepted / decided) * 100) : 0
  const discountTotal = grossRevenue - totalRevenue
  const avgViews = total > 0 ? Math.round(totalViews / total) : 0

  return {
    total, draft, sent, viewed, accepted, declined,
    totalViews, totalRevenue, discountTotal, acceptanceRate, decided, avgViews
  }
})

// ─── Filter + Search + Sort ───

const filter = ref<string>('all')
const search = ref('')
const sortKey = ref<string>('created_at')
const sortDir = ref<'asc' | 'desc'>('desc')

function isExpired(p: Proposal): boolean {
  return !!(p.expires_at && p.expires_at < Date.now() && !['accepted', 'declined'].includes(p.status))
}

const filters = computed(() => {
  const c = (s: string) => s === 'all' ? proposals.value.length : proposals.value.filter(p => p.status === s).length
  const expiredCount = proposals.value.filter(p => isExpired(p)).length
  return [
    { value: 'all', label: 'الكل', count: proposals.value.length },
    { value: 'draft', label: 'مسوّدة', count: c('draft') },
    { value: 'sent', label: 'مُرسل', count: c('sent') },
    { value: 'viewed', label: 'مُشاهَد', count: c('viewed') },
    { value: 'accepted', label: 'مقبول', count: c('accepted') },
    { value: 'declined', label: 'مرفوض', count: c('declined') },
    { value: 'expired', label: 'منتهٍ', count: expiredCount }
  ]
})

const filteredProposals = computed(() => {
  let list = proposals.value

  if (filter.value !== 'all') {
    if (filter.value === 'expired') {
      list = list.filter(p => isExpired(p))
    } else {
      list = list.filter(p => p.status === filter.value)
    }
  }

  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.client_name.toLowerCase().includes(q)
    )
  }

  const sorted = [...list].sort((a, b) => {
    let aVal: unknown, bVal: unknown
    const sk = sortKey.value

    if (sk === 'title' || sk === 'client_name') {
      aVal = a[sk]; bVal = b[sk]
      return sortDir.value === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    }

    if (sk === 'price_after_discount') {
      aVal = a.price_after_discount ?? a.price ?? 0
      bVal = b.price_after_discount ?? b.price ?? 0
    } else if (sk === 'views_count') {
      aVal = a.views_count ?? 0; bVal = b.views_count ?? 0
    } else if (sk === 'proposal_date') {
      aVal = a.proposal_date; bVal = b.proposal_date
    } else {
      aVal = a.created_at; bVal = b.created_at
    }

    return sortDir.value === 'asc'
      ? Number(aVal) - Number(bVal)
      : Number(bVal) - Number(aVal)
  })

  return sorted
})

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
}

// ─── Status Distribution ───

const statusSegments = computed(() => {
  const map: Record<string, { label: string; barClass: string; dotClass: string }> = {
    draft:    { label: 'مسوّدة',  barClass: 'bg-black/[0.15]',    dotClass: 'bg-black/[0.3]' },
    sent:     { label: 'مُرسل',    barClass: 'bg-gray-400',        dotClass: 'bg-gray-400' },
    viewed:   { label: 'مُشاهَد',   barClass: 'bg-[#15803D]/60',   dotClass: 'bg-[#15803D]' },
    accepted: { label: 'مقبول',    barClass: 'bg-[#15803D]',      dotClass: 'bg-[#15803D]' },
    declined: { label: 'مرفوض',    barClass: 'bg-red-400',        dotClass: 'bg-red-500' },
  }
  const total = proposals.value.length
  if (total === 0) return []

  const segments: { status: string; label: string; count: number; pct: number; barClass: string; dotClass: string }[] = []
  for (const [status, cfg] of Object.entries(map)) {
    const count = proposals.value.filter(p => p.status === status).length
    if (count === 0) continue
    segments.push({ status, ...cfg, count, pct: Math.round((count / total) * 100) })
  }

  const expiredCount = proposals.value.filter(p => isExpired(p)).length
  if (expiredCount > 0) {
    segments.push({
      status: 'expired',
      label: 'منتهٍ',
      count: expiredCount,
      pct: Math.round((expiredCount / total) * 100),
      barClass: 'bg-ink-mute/40',
      dotClass: 'bg-ink-mute/50'
    })
  }

  return segments
})

// ─── Expiring Soon ───

const expiringSoon = computed(() => {
  const now = Date.now()
  const week = 7 * 24 * 60 * 60 * 1000
  return proposals.value.filter(p =>
    p.expires_at &&
    p.expires_at > now &&
    p.expires_at < now + week &&
    !['accepted', 'declined'].includes(p.status)
  )
})

// ─── Helpers ───

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('en-CA')
  } catch { return d }
}

useHead({
  title: 'العروض · لوحة التحكم',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>
