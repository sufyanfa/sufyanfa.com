<script setup lang="ts">
import { useMoney } from '~/composables/useMoney'

definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

const route = useRoute()
const id = route.params.id

interface Invoice {
  id: number; slug: string; number: string
  status: 'draft' | 'sent' | 'partially_paid' | 'paid'
  customer_id: number
  issue_date: string; due_date: string
  adjustment: number; adjustment_label: string | null
  notes: string | null
}
interface ItemRow { id: number; position: number; description: string; amount: number }
interface Installment {
  id: number; position: number; label: string; percentage: number | null
  amount: number; due_date: string; status: 'pending' | 'paid'; paid_at: number | null
}

const { data, refresh } = await useFetch<{ invoice: Invoice; items: ItemRow[]; installments: Installment[]; customer: any }>(
  () => `/api/admin/invoices/${id}`,
)

const { formatSAR } = useMoney()

const statusLabels: Record<string, string> = {
  draft: 'مسودة', sent: 'مرسلة', partially_paid: 'مدفوعة جزئياً', paid: 'مكتملة',
}

const error = ref<string | null>(null)
const busy = ref(false)

const publicUrl = computed(() => {
  if (!data.value?.invoice?.slug) return ''
  if (typeof window === 'undefined') return `/i/${data.value.invoice.slug}`
  return `${window.location.origin}/i/${data.value.invoice.slug}`
})

const waOpen = ref(false)
const todayISO = new Date().toISOString().slice(0, 10)

async function onSubmit(payload: { status: 'draft' | 'sent'; data: any }) {
  busy.value = true; error.value = null
  try {
    await $fetch(`/api/admin/invoices/${id}`, { method: 'PUT', body: payload.data })
    // Edit page doesn't toggle status (mark-sent button does that). Refresh and continue.
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ'
  } finally { busy.value = false }
}

async function markSent() {
  busy.value = true; error.value = null
  try { await $fetch(`/api/admin/invoices/${id}/mark-sent`, { method: 'POST' }); await refresh() }
  catch (e: any) { error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ' }
  finally { busy.value = false }
}
async function markPaid() {
  busy.value = true; error.value = null
  try { await $fetch(`/api/admin/invoices/${id}/mark-paid`, { method: 'POST' }); await refresh() }
  catch (e: any) { error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ' }
  finally { busy.value = false }
}
const locked = computed(() => data.value?.installments?.some(i => i.status === 'paid') ?? false)

async function markInstallmentPaid(iid: number) {
  busy.value = true; error.value = null
  try { await $fetch(`/api/admin/invoices/${id}/installments/${iid}/mark-paid`, { method: 'POST' }); await refresh() }
  catch (e: any) { error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ' }
  finally { busy.value = false }
}
async function duplicate() {
  busy.value = true; error.value = null
  try {
    const res = await $fetch<{ ok: boolean; id: number }>(`/api/admin/invoices/${id}/duplicate`, { method: 'POST' })
    await navigateTo(`/admin/invoices/${res.id}`)
  } catch (e: any) { error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ' }
  finally { busy.value = false }
}
async function remove() {
  if (!confirm('هل تريد حذف هذه الفاتورة؟')) return
  busy.value = true; error.value = null
  try { await $fetch(`/api/admin/invoices/${id}`, { method: 'DELETE' }); await navigateTo('/admin/invoices') }
  catch (e: any) { error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ' }
  finally { busy.value = false }
}
async function copyLink() {
  if (!publicUrl.value) return
  try { await navigator.clipboard.writeText(publicUrl.value) } catch {}
}

const initial = computed(() => {
  if (!data.value) return undefined
  return {
    customer_id: data.value.invoice.customer_id,
    issue_date: data.value.invoice.issue_date,
    due_date: data.value.invoice.due_date,
    items: data.value.items.map(i => ({ description: i.description, amount: i.amount })),
    adjustment: data.value.invoice.adjustment,
    adjustment_label: data.value.invoice.adjustment_label ?? '',
    notes: data.value.invoice.notes ?? '',
    installments: data.value.installments.map(i => ({ label: i.label, percentage: i.percentage ?? 0, due_date: i.due_date })),
  }
})
</script>

<template>
  <div class="mx-auto max-w-3xl p-6" v-if="data">
    <NuxtLink to="/admin/invoices" class="text-sm text-gray-500 mb-3 inline-block">← الفواتير</NuxtLink>

    <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold font-mono">{{ data.invoice.number }}</h1>
        <div class="text-sm text-gray-500 mt-1">الحالة: {{ statusLabels[data.invoice.status] ?? data.invoice.status }}</div>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button type="button" @click="duplicate" :disabled="busy" class="px-3 py-1.5 text-sm border border-black/10 rounded-lg">تكرار للشهر القادم</button>
        <button v-if="data.invoice.status === 'draft'" type="button" @click="markSent" :disabled="busy" class="px-3 py-1.5 text-sm bg-black text-white rounded-lg">وضع كمرسلة</button>
        <button v-if="data.invoice.status === 'sent' || data.invoice.status === 'partially_paid'" type="button" @click="markPaid" :disabled="busy" class="px-3 py-1.5 text-sm bg-[#15803D] text-white rounded-lg">تسجيل الكل كمدفوع</button>
        <button v-if="data.invoice.status !== 'draft'" type="button" @click="waOpen = true" class="px-3 py-1.5 text-sm border border-[#25D366] text-[#15803D] hover:bg-[#25D366]/5 rounded-lg flex items-center gap-1.5">
          <Icon name="mdi:whatsapp" class="w-4 h-4 text-[#25D366]" />
          تذكير واتساب
        </button>
        <a v-if="data.invoice.status !== 'draft'" :href="publicUrl" target="_blank" class="px-3 py-1.5 text-sm border border-black/10 rounded-lg">عرض الفاتورة</a>
        <button v-if="data.invoice.status !== 'draft'" type="button" @click="copyLink" class="px-3 py-1.5 text-sm border border-black/10 rounded-lg">نسخ الرابط</button>
        <button v-if="data.invoice.status === 'draft'" type="button" @click="remove" :disabled="busy" class="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg">حذف</button>
      </div>
    </div>

    <div v-if="data.installments.length > 1" class="mb-6 border border-black/10 rounded-xl divide-y divide-black/5">
      <div v-for="inst in data.installments" :key="inst.id" class="flex items-center justify-between px-4 py-3 text-sm">
        <div>
          <div class="font-semibold">{{ inst.label }}<span v-if="inst.percentage" class="text-gray-500 font-normal"> ({{ inst.percentage }}%)</span></div>
          <div class="text-gray-500" dir="ltr">{{ formatSAR(inst.amount) }} — {{ inst.status === 'paid' ? `دُفعت` : `تستحق ${inst.due_date}` }}</div>
        </div>
        <button v-if="inst.status === 'pending'" type="button" @click="markInstallmentPaid(inst.id)" :disabled="busy" class="px-3 py-1.5 text-xs bg-[#15803D] text-white rounded-lg">تسجيل كمدفوعة</button>
        <span v-else class="text-xs text-[#15803D] font-semibold">✓ مدفوعة</span>
      </div>
    </div>

    <div v-if="error" class="text-red-600 text-sm mb-3">{{ error }}</div>

    <AdminInvoiceForm
      v-if="initial"
      :initial="initial"
      :locked="locked"
      :submit-labels="{ draft: 'حفظ التغييرات', sent: 'حفظ ووضع كمرسلة' }"
      :show-sent-button="data.invoice.status === 'draft'"
      @submit="onSubmit"
    />

    <AdminWhatsAppSendModal
      v-model="waOpen"
      :customer-id="data.customer.id"
      :customer-name="data.customer.name"
      :customer-phone="data.customer.phone"
      ref-type="invoice"
      :ref-id="data.invoice.id"
      :invoice-number="data.invoice.number"
      :amount="data.items.reduce((sum, i) => sum + i.amount, 0) + data.invoice.adjustment"
      :due-date="data.invoice.due_date"
      :link="publicUrl"
      :initial-template-type="data.invoice.status === 'sent' && data.invoice.due_date < todayISO ? 'invoice_overdue' : 'invoice_reminder'"
    />
  </div>
</template>
