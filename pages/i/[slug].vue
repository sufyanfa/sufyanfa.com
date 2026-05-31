<script setup lang="ts">
import { useMoney } from '~/composables/useMoney'

definePageMeta({ layout: 'bare' })

const route = useRoute()
const slug = route.params.slug as string
const preview = route.query.preview === '1' ? '?preview=1' : ''

interface Invoice {
  id: number; slug: string; number: string
  status: 'draft' | 'sent' | 'paid'
  issue_date: string; due_date: string
  currency: string
  adjustment: number
  adjustment_label: string | null
  notes: string | null
}
interface Customer { name: string; email: string | null; phone: string | null; company: string | null }
interface ItemRow { id: number; position: number; description: string; amount: number }
interface Settings {
  business_name: string; logo_url: string | null
  email: string | null; phone: string | null; address: string | null
  bank_name: string | null; bank_account_name: string | null
  bank_account_number: string | null; bank_iban: string | null
}

const { data, error } = await useFetch<{
  invoice: Invoice; customer: Customer; items: ItemRow[]; settings: Settings
}>(`/api/i/${slug}${preview}`)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة', fatal: true })
}

const { formatSAR } = useMoney()

const subtotal = computed(() => (data.value?.items ?? []).reduce((s, i) => s + i.amount, 0))
const adjustment = computed(() => data.value?.invoice.adjustment ?? 0)
const total = computed(() => subtotal.value + adjustment.value)

const todayISO = new Date().toISOString().slice(0, 10)
const isOverdue = computed(() => data.value?.invoice.status === 'sent' && data.value.invoice.due_date < todayISO)
const isPaid = computed(() => data.value?.invoice.status === 'paid')

useHead(() => ({
  title: data.value ? `${data.value.invoice.number} — فاتورة` : 'فاتورة',
}))

function printIt() { window.print() }
</script>

<template>
  <div v-if="data" class="min-h-screen bg-cream py-10 px-4">
    <div class="invoice mx-auto max-w-3xl bg-white rounded-2xl border border-black/10 p-10 relative">

      <!-- Status ribbons (screen only) -->
      <div v-if="isPaid" class="ribbon absolute top-6 left-6 px-3 py-1 rounded-md bg-green-100 text-green-800 text-sm font-medium no-print">مدفوعة</div>
      <div v-else-if="isOverdue" class="ribbon absolute top-6 left-6 px-3 py-1 rounded-md bg-red-100 text-red-700 text-sm font-medium no-print">متأخرة</div>

      <!-- Header -->
      <header class="flex items-start justify-between mb-10 pb-6 border-b border-black/10">
        <div>
          <img v-if="data.settings.logo_url" :src="data.settings.logo_url" alt="" class="h-10 w-auto" />
          <div v-else class="text-lg font-bold">{{ data.settings.business_name }}</div>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold">فاتورة</div>
          <div class="font-mono text-sm mt-1">{{ data.invoice.number }}</div>
          <div class="text-sm text-gray-600 mt-1">تاريخ الإصدار: {{ data.invoice.issue_date }}</div>
          <div class="text-sm text-gray-600">تاريخ الاستحقاق: {{ data.invoice.due_date }}</div>
        </div>
      </header>

      <!-- From / To -->
      <section class="grid grid-cols-2 gap-6 mb-10">
        <div>
          <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">من</div>
          <div class="font-semibold">{{ data.settings.business_name }}</div>
          <div v-if="data.settings.email" class="text-sm text-gray-600">{{ data.settings.email }}</div>
          <div v-if="data.settings.phone" class="text-sm text-gray-600" dir="ltr">{{ data.settings.phone }}</div>
          <div v-if="data.settings.address" class="text-sm text-gray-600">{{ data.settings.address }}</div>
        </div>
        <div>
          <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">إلى</div>
          <div v-if="data.customer.company" class="font-semibold">{{ data.customer.company }}</div>
          <div :class="data.customer.company ? 'text-sm text-gray-700' : 'font-semibold'">{{ data.customer.name }}</div>
          <div v-if="data.customer.email" class="text-sm text-gray-600">{{ data.customer.email }}</div>
          <div v-if="data.customer.phone" class="text-sm text-gray-600" dir="ltr">{{ data.customer.phone }}</div>
        </div>
      </section>

      <!-- Items -->
      <section class="mb-10">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-black/10">
              <th class="text-right py-3 font-medium">البند</th>
              <th class="text-left py-3 font-medium w-40">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in data.items" :key="it.id" class="border-b border-black/5">
              <td class="py-3">{{ it.description }}</td>
              <td class="py-3 text-left" dir="ltr">{{ formatSAR(it.amount) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="ml-auto mt-6 max-w-xs space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">الإجمالي الفرعي</span>
            <span dir="ltr">{{ formatSAR(subtotal) }}</span>
          </div>
          <div v-if="adjustment !== 0" class="flex justify-between">
            <span class="text-gray-600">{{ data.invoice.adjustment_label || 'تعديل' }}</span>
            <span dir="ltr">{{ formatSAR(adjustment) }}</span>
          </div>
          <div class="flex justify-between text-base font-bold pt-3 border-t-2 border-[#15803D]">
            <span>الإجمالي</span>
            <span dir="ltr">{{ formatSAR(total) }}</span>
          </div>
        </div>
      </section>

      <!-- Bank -->
      <section v-if="data.settings.bank_name || data.settings.bank_iban" class="bg-cream rounded-xl p-5 mb-8">
        <h3 class="font-semibold mb-3">معلومات الدفع</h3>
        <dl class="grid grid-cols-[8rem_1fr] gap-y-1 text-sm">
          <dt class="text-gray-600">البنك</dt><dd>{{ data.settings.bank_name || '—' }}</dd>
          <dt class="text-gray-600">اسم الحساب</dt><dd>{{ data.settings.bank_account_name || '—' }}</dd>
          <dt v-if="data.settings.bank_account_number" class="text-gray-600">رقم الحساب</dt>
          <dd v-if="data.settings.bank_account_number" class="font-mono" dir="ltr">{{ data.settings.bank_account_number }}</dd>
          <dt v-if="data.settings.bank_iban" class="text-gray-600">الآيبان</dt>
          <dd v-if="data.settings.bank_iban" class="font-mono" dir="ltr">{{ data.settings.bank_iban }}</dd>
        </dl>
      </section>

      <!-- Notes -->
      <section v-if="data.invoice.notes" class="text-sm text-gray-700 whitespace-pre-wrap">
        <h3 class="font-semibold mb-2 text-gray-900">ملاحظات</h3>
        {{ data.invoice.notes }}
      </section>
    </div>

    <div class="max-w-3xl mx-auto mt-6 text-center no-print">
      <button @click="printIt" class="px-5 py-2 bg-black text-white rounded-lg text-sm">اطبع / احفظ PDF</button>
    </div>
  </div>
</template>

<style>
@media print {
  @page { size: A4; margin: 16mm; }
  body { background: white !important; }
  .no-print, .ribbon { display: none !important; }
  .invoice { box-shadow: none !important; border: none !important; }
  a { color: inherit; text-decoration: none; }
}
</style>
