<script setup lang="ts">
import { useMoney } from '~/composables/useMoney'

interface Item { description: string; amount: number }
interface FormShape {
  customer_id: number | null
  issue_date: string
  due_date: string
  items: Item[]
  adjustment: number
  adjustment_label: string
  notes: string
}

const props = defineProps<{
  initial?: Partial<FormShape>
  defaultDueDays?: number
  defaultNotes?: string
  submitLabels: { draft: string; sent: string }
  showSentButton?: boolean
}>()
const emit = defineEmits<{
  (e: 'submit', body: { status: 'draft' | 'sent'; data: FormShape }): void
}>()

const { formatSAR } = useMoney()

function todayISO(): string { return new Date().toISOString().slice(0, 10) }
function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const issueInit = props.initial?.issue_date ?? todayISO()
const dueInit = props.initial?.due_date ?? addDaysISO(issueInit, props.defaultDueDays ?? 14)

const form = reactive<FormShape>({
  customer_id: props.initial?.customer_id ?? null,
  issue_date: issueInit,
  due_date: dueInit,
  items: props.initial?.items?.length
    ? props.initial.items.map(i => ({ description: i.description, amount: i.amount }))
    : [{ description: '', amount: 0 }],
  adjustment: props.initial?.adjustment ?? 0,
  adjustment_label: props.initial?.adjustment_label ?? '',
  notes: props.initial?.notes ?? props.defaultNotes ?? '',
})

const adjustmentOpen = ref((form.adjustment ?? 0) !== 0 || !!form.adjustment_label)
const saving = ref(false)
const error = ref<string | null>(null)

// Amounts edited as decimal SAR, stored as halalas.
const itemViews = reactive(form.items.map(i => ({ description: i.description, sar: i.amount / 100 })))
const adjustmentSAR = ref(form.adjustment / 100)

function addItem() { itemViews.push({ description: '', sar: 0 }) }
function removeItem(i: number) { itemViews.splice(i, 1) }

const subtotal = computed(() => itemViews.reduce((s, i) => s + Math.round((i.sar || 0) * 100), 0))
const adjustmentHalalas = computed(() => Math.round((adjustmentSAR.value || 0) * 100))
const total = computed(() => subtotal.value + adjustmentHalalas.value)

function buildBody(): FormShape {
  return {
    customer_id: form.customer_id,
    issue_date: form.issue_date,
    due_date: form.due_date,
    items: itemViews.map(i => ({ description: i.description.trim(), amount: Math.round((i.sar || 0) * 100) })),
    adjustment: adjustmentOpen.value ? adjustmentHalalas.value : 0,
    adjustment_label: adjustmentOpen.value ? form.adjustment_label.trim() : '',
    notes: form.notes,
  }
}

async function submit(status: 'draft' | 'sent') {
  if (!form.customer_id) { error.value = 'اختر عميلاً'; return }
  if (itemViews.length === 0) { error.value = 'أضف بنداً واحداً على الأقل'; return }
  if (form.due_date < form.issue_date) { error.value = 'تاريخ الاستحقاق قبل تاريخ الإصدار'; return }
  saving.value = true
  error.value = null
  try {
    emit('submit', { status, data: buildBody() })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form @submit.prevent="submit('draft')" class="space-y-6">
    <section class="bg-white border border-black/10 rounded-2xl p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">العميل *</label>
        <AdminCustomerPicker v-model="form.customer_id" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">تاريخ الإصدار</label>
          <input v-model="form.issue_date" type="date" required class="w-full px-3 py-2 border border-black/10 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">تاريخ الاستحقاق</label>
          <input v-model="form.due_date" type="date" required class="w-full px-3 py-2 border border-black/10 rounded-lg" />
        </div>
      </div>
    </section>

    <section class="bg-white border border-black/10 rounded-2xl p-6 space-y-3">
      <h2 class="text-sm font-semibold">البنود</h2>
      <div v-for="(it, idx) in itemViews" :key="idx" class="flex gap-3">
        <input v-model="it.description" placeholder="وصف البند" class="flex-1 px-3 py-2 border border-black/10 rounded-lg" />
        <input v-model.number="it.sar" type="number" step="0.01" min="0" placeholder="0.00" class="w-32 px-3 py-2 border border-black/10 rounded-lg text-left" dir="ltr" />
        <button type="button" @click="removeItem(idx)" class="px-3 py-2 border border-black/10 rounded-lg text-red-600">×</button>
      </div>
      <button type="button" @click="addItem" class="text-sm text-forest underline">+ إضافة بند</button>
    </section>

    <section class="bg-white border border-black/10 rounded-2xl p-6">
      <button v-if="!adjustmentOpen" type="button" @click="adjustmentOpen = true" class="text-sm text-forest underline">
        + إضافة خصم أو رسوم
      </button>
      <div v-else class="flex gap-3 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">وصف التعديل</label>
          <input v-model="form.adjustment_label" placeholder="مثلاً: خصم العميل المميز" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
        </div>
        <div class="w-40">
          <label class="block text-sm font-medium mb-1">المبلغ (موجب أو سالب)</label>
          <input v-model.number="adjustmentSAR" type="number" step="0.01" class="w-full px-3 py-2 border border-black/10 rounded-lg text-left" dir="ltr" />
        </div>
        <button type="button" @click="adjustmentOpen = false; adjustmentSAR = 0; form.adjustment_label = ''" class="px-3 py-2 border border-black/10 rounded-lg">إزالة</button>
      </div>
    </section>

    <section class="bg-white border border-black/10 rounded-2xl p-6">
      <label class="block text-sm font-medium mb-1">ملاحظات تظهر على الفاتورة</label>
      <textarea v-model="form.notes" rows="3" class="w-full px-3 py-2 border border-black/10 rounded-lg"></textarea>
    </section>

    <section class="bg-cream border border-black/10 rounded-2xl p-6 sticky bottom-4">
      <div class="flex justify-between text-sm">
        <span>الإجمالي الفرعي</span>
        <span dir="ltr">{{ formatSAR(subtotal) }}</span>
      </div>
      <div v-if="adjustmentOpen && adjustmentHalalas !== 0" class="flex justify-between text-sm mt-1">
        <span>{{ form.adjustment_label || 'تعديل' }}</span>
        <span dir="ltr">{{ formatSAR(adjustmentHalalas) }}</span>
      </div>
      <div class="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-black/10">
        <span>الإجمالي</span>
        <span class="text-forest" dir="ltr">{{ formatSAR(total) }}</span>
      </div>

      <div v-if="error" class="text-red-600 text-sm mt-3">{{ error }}</div>

      <div class="flex gap-3 mt-4">
        <button type="submit" :disabled="saving" class="px-5 py-2 border border-black/10 rounded-lg disabled:opacity-50">
          {{ submitLabels.draft }}
        </button>
        <button v-if="showSentButton !== false" type="button" @click="submit('sent')" :disabled="saving" class="px-5 py-2 bg-black text-white rounded-lg disabled:opacity-50">
          {{ submitLabels.sent }}
        </button>
      </div>
    </section>
  </form>
</template>
