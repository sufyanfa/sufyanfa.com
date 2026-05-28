<script setup lang="ts">
import { useMoney } from '~/composables/useMoney'

definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

interface InvoiceRow {
  id: number
  slug: string
  number: string
  status: 'draft' | 'sent' | 'paid'
  issue_date: string
  due_date: string
  currency: string
  adjustment: number
  customer_id: number
  customer_name: string
  subtotal: number
}

const route = useRoute()
const router = useRouter()
const { formatSAR } = useMoney()

const filter = computed(() => (route.query.status as string) || 'all')

const queryParam = computed(() => filter.value === 'all' ? '' : `?status=${filter.value}`)
const { data, refresh } = await useFetch<{ invoices: InvoiceRow[] }>(
  () => `/api/admin/invoices${queryParam.value}`,
)

const todayISO = new Date().toISOString().slice(0, 10)

function setFilter(f: string) {
  router.push({ path: '/admin/invoices', query: f === 'all' ? {} : { status: f } })
}

function isOverdue(inv: InvoiceRow): boolean {
  return inv.status === 'sent' && inv.due_date < todayISO
}

function badgeClass(inv: InvoiceRow): string {
  if (isOverdue(inv)) return 'bg-red-50 text-red-700 border-red-100'
  if (inv.status === 'paid') return 'bg-green-50 text-green-700 border-green-100'
  if (inv.status === 'sent') return 'bg-blue-50 text-blue-700 border-blue-100'
  return 'bg-gray-50 text-gray-700 border-gray-100'
}

function badgeText(inv: InvoiceRow): string {
  if (isOverdue(inv)) return 'متأخرة'
  if (inv.status === 'paid') return 'مدفوعة'
  if (inv.status === 'sent') return 'مرسلة'
  return 'مسودة'
}

const totals = computed(() => {
  let outstanding = 0, overdue = 0, overdueCount = 0
  for (const inv of data.value?.invoices ?? []) {
    const total = inv.subtotal + (inv.adjustment ?? 0)
    if (inv.status === 'sent') {
      outstanding += total
      if (isOverdue(inv)) { overdue += total; overdueCount++ }
    }
  }
  return { outstanding, overdue, overdueCount }
})
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

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2 mb-6">
        <button v-for="opt in ['all', 'draft', 'sent', 'paid']" :key="opt"
          @click="setFilter(opt)"
          :class="[
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors',
            filter === opt ? 'bg-ink text-white' : 'bg-cream-deep text-ink-soft hover:bg-black/[0.06]'
          ]"
        >
          {{ ({ all: 'الكل', draft: 'مسودة', sent: 'مرسلة', paid: 'مدفوعة' } as any)[opt] }}
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
              <th class="col-span-4 text-start font-semibold">العميل</th>
              <th class="col-span-2 text-start font-semibold">الإصدار</th>
              <th class="col-span-2 text-start font-semibold">الاستحقاق</th>
              <th class="col-span-1 text-center font-semibold">الحالة</th>
              <th class="col-span-1 text-end font-semibold">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in data.invoices" :key="inv.id" class="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-black/[0.04] last:border-0 hover:bg-white transition-colors">
              <td class="col-span-2 font-mono text-ink font-semibold">
                <NuxtLink :to="`/admin/invoices/${inv.id}`" class="hover:underline">{{ inv.number }}</NuxtLink>
              </td>
              <td class="col-span-4 text-ink-soft font-semibold truncate">{{ inv.customer_name }}</td>
              <td class="col-span-2 text-ink-mute" dir="ltr">{{ inv.issue_date }}</td>
              <td class="col-span-2 text-ink-mute" dir="ltr">{{ inv.due_date }}</td>
              <td class="col-span-1 text-center">
                <span :class="['inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border', badgeClass(inv)]">
                  {{ badgeText(inv) }}
                </span>
              </td>
              <td class="col-span-1 text-end font-semibold text-ink" dir="ltr">{{ formatSAR(inv.subtotal + (inv.adjustment ?? 0)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
