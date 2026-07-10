<script setup lang="ts">
import { useMoney } from '~/composables/useMoney'

definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

interface InvoiceRow {
  id: number
  slug: string
  number: string
  status: 'draft' | 'sent' | 'partially_paid' | 'paid'
  issue_date: string
  due_date: string
  currency: string
  adjustment: number
  customer_id: number
  customer_name: string
  subtotal: number
  collected: number
  has_overdue: boolean
}
interface Stats {
  counts: { draft: number; sent: number; partially_paid: number; paid: number; overdue: number }
  totals: { invoiced: number; collected: number; outstanding: number }
}

const route = useRoute()
const router = useRouter()
const { formatSAR } = useMoney()

const filter = computed(() => (route.query.status as string) || 'all')
const month = computed(() => (route.query.month as string) || '')
const dateField = computed(() => (route.query.dateField as string) === 'due_date' ? 'due_date' : 'issue_date')

const queryParam = computed(() => {
  const params = new URLSearchParams()
  if (filter.value !== 'all') params.set('status', filter.value)
  if (month.value) {
    params.set('month', month.value)
    params.set('dateField', dateField.value)
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
})
const { data, refresh } = await useFetch<{ invoices: InvoiceRow[]; stats: Stats }>(
  () => `/api/admin/invoices${queryParam.value}`,
)

function currentQuery() {
  return { ...(filter.value !== 'all' ? { status: filter.value } : {}), ...(month.value ? { month: month.value, dateField: dateField.value } : {}) }
}
function setFilter(f: string) {
  const query = currentQuery()
  if (f === 'all') delete (query as any).status
  else (query as any).status = f
  router.push({ path: '/admin/invoices', query })
}
function setMonth(m: string) {
  const query = currentQuery()
  if (!m) { delete (query as any).month; delete (query as any).dateField }
  else { (query as any).month = m; (query as any).dateField = dateField.value }
  router.push({ path: '/admin/invoices', query })
}
function setDateField(f: string) {
  const query = currentQuery()
  if (month.value) (query as any).dateField = f
  router.push({ path: '/admin/invoices', query })
}

function isOverdue(inv: InvoiceRow): boolean {
  return (inv.status === 'sent' || inv.status === 'partially_paid') && inv.has_overdue
}

function badgeClass(inv: InvoiceRow): string {
  if (isOverdue(inv)) return 'bg-red-50 text-red-700 border-red-100'
  if (inv.status === 'paid') return 'bg-green-50 text-green-700 border-green-100'
  if (inv.status === 'partially_paid') return 'bg-amber-50 text-amber-700 border-amber-100'
  if (inv.status === 'sent') return 'bg-blue-50 text-blue-700 border-blue-100'
  return 'bg-gray-50 text-gray-700 border-gray-100'
}

function badgeText(inv: InvoiceRow): string {
  if (isOverdue(inv)) return 'متأخرة'
  if (inv.status === 'paid') return 'مكتملة'
  if (inv.status === 'partially_paid') return 'مدفوعة جزئياً'
  if (inv.status === 'sent') return 'مرسلة'
  return 'مسودة'
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <AdminHeader />
    <div class="max-w-5xl mx-auto px-6 sm:px-8 py-10">
      
      <!-- Back to proposals -->
      <NuxtLink to="/admin/proposals" class="inline-flex items-center gap-2 text-[13px] text-ink-mute hover:text-ink transition-colors mb-3">
        <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
        لوحة التحكم
      </NuxtLink>

      <div class="flex items-center justify-between mb-8">
        <div>
          <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
            لوحة التحكم
          </div>
          <h1 class="text-3xl font-bold text-ink tracking-tight">الفواتير</h1>
        </div>
        <NuxtLink to="/admin/invoices/new" class="inline-flex items-center gap-2 bg-ink text-white rounded-full px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
          <Icon name="lucide:plus" class="w-4 h-4" />
          فاتورة جديدة
        </NuxtLink>
      </div>

      <!-- Stats -->
      <div v-if="data?.stats" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div class="bg-cream-deep rounded-2xl p-4">
          <div class="text-[11px] text-ink-mute font-semibold uppercase tracking-wide mb-1">مسودة</div>
          <div class="text-xl font-bold text-ink">{{ data.stats.counts.draft }}</div>
        </div>
        <div class="bg-cream-deep rounded-2xl p-4">
          <div class="text-[11px] text-ink-mute font-semibold uppercase tracking-wide mb-1">مرسلة</div>
          <div class="text-xl font-bold text-ink">{{ data.stats.counts.sent }}</div>
        </div>
        <div class="bg-cream-deep rounded-2xl p-4">
          <div class="text-[11px] text-ink-mute font-semibold uppercase tracking-wide mb-1">مدفوعة جزئياً</div>
          <div class="text-xl font-bold text-ink">{{ data.stats.counts.partially_paid }}</div>
        </div>
        <div class="bg-cream-deep rounded-2xl p-4">
          <div class="text-[11px] text-ink-mute font-semibold uppercase tracking-wide mb-1">مكتملة</div>
          <div class="text-xl font-bold text-ink">{{ data.stats.counts.paid }}</div>
        </div>
        <div class="bg-red-50 rounded-2xl p-4">
          <div class="text-[11px] text-red-700 font-semibold uppercase tracking-wide mb-1">متأخرة</div>
          <div class="text-xl font-bold text-red-700">{{ data.stats.counts.overdue }}</div>
        </div>
        <div class="bg-cream-deep rounded-2xl p-4">
          <div class="text-[11px] text-ink-mute font-semibold uppercase tracking-wide mb-1">المتبقي</div>
          <div class="text-xl font-bold text-[#15803D]" dir="ltr">{{ formatSAR(data.stats.totals.outstanding) }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2 mb-6">
        <button v-for="opt in ['all', 'draft', 'sent', 'partially_paid', 'paid']" :key="opt"
          @click="setFilter(opt)"
          :class="[
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors',
            filter === opt ? 'bg-ink text-white' : 'bg-cream-deep text-ink-soft hover:bg-black/[0.06]'
          ]"
        >
          {{ ({ all: 'الكل', draft: 'مسودة', sent: 'مرسلة', partially_paid: 'مدفوعة جزئياً', paid: 'مكتملة' } as any)[opt] }}
        </button>

        <span class="w-px h-6 bg-black/10 mx-1"></span>

        <select :value="dateField" @change="setDateField(($event.target as HTMLSelectElement).value)"
          class="rounded-full bg-cream-deep text-ink-soft text-[13px] font-semibold px-3 py-2 border-0">
          <option value="issue_date">تاريخ الإصدار</option>
          <option value="due_date">تاريخ الاستحقاق</option>
        </select>
        <input type="month" :value="month" @change="setMonth(($event.target as HTMLInputElement).value)"
          class="rounded-full bg-cream-deep text-ink-soft text-[13px] font-semibold px-3 py-2 border-0" dir="ltr" />
        <button v-if="month" @click="setMonth('')" class="text-[13px] text-ink-mute hover:text-ink underline">
          مسح الشهر
        </button>
      </div>

      <div v-if="!data?.invoices?.length" class="bg-cream-deep rounded-3xl p-12 text-center text-ink-mute text-sm">
        لا توجد فواتير بعد.
      </div>

      <div v-else class="bg-cream-deep rounded-3xl overflow-hidden">
        <table class="w-full text-sm text-right">
          <thead>
            <tr class="grid grid-cols-12 gap-4 px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-ink-mute border-b border-black/[0.06]">
              <th class="col-span-2 text-start font-semibold">الرقم</th>
              <th class="col-span-3 text-start font-semibold">العميل</th>
              <th class="col-span-2 text-start font-semibold">الإصدار</th>
              <th class="col-span-2 text-start font-semibold">الاستحقاق</th>
              <th class="col-span-1 text-center font-semibold">الحالة</th>
              <th class="col-span-2 text-end font-semibold">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in data.invoices" :key="inv.id" class="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-black/[0.04] last:border-0 hover:bg-white transition-colors">
              <td class="col-span-2 font-mono text-ink font-semibold">
                <NuxtLink :to="`/admin/invoices/${inv.id}`" class="hover:underline">{{ inv.number }}</NuxtLink>
              </td>
              <td class="col-span-3 text-ink-soft font-semibold truncate">{{ inv.customer_name }}</td>
              <td class="col-span-2 text-ink-mute" dir="ltr">{{ inv.issue_date }}</td>
              <td class="col-span-2 text-ink-mute" dir="ltr">{{ inv.due_date }}</td>
              <td class="col-span-1 text-center">
                <span :class="['inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border', badgeClass(inv)]">
                  {{ badgeText(inv) }}
                </span>
              </td>
              <td class="col-span-2 text-end font-semibold text-ink" dir="ltr">{{ formatSAR(inv.subtotal + (inv.adjustment ?? 0)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
