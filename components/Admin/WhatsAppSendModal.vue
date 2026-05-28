<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition ease-out duration-250"
          enter-from-class="opacity-0 translate-y-4 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:scale-95"
        >
          <div
            v-if="modelValue"
            class="relative w-full sm:max-w-xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="`wa-modal-title`"
          >
            <div
              class="bg-white px-6 sm:px-8 py-5 border-b border-black/[0.06] flex items-start justify-between gap-4"
            >
              <div class="min-w-0 flex-1">
                <div
                  class="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase text-ink-mute mb-1"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
                  <span>واتساب</span>
                </div>
                <h2
                  id="wa-modal-title"
                  class="text-xl font-bold text-ink leading-tight tracking-tight"
                >
                  إرسال رسالة تذكيرية للعميل
                </h2>
              </div>
              <button
                type="button"
                class="text-ink-mute hover:text-ink p-2 -m-2 flex-shrink-0 rounded-lg transition-colors"
                aria-label="إغلاق"
                @click="close"
              >
                <Icon name="lucide:x" class="w-5 h-5" />
              </button>
            </div>

            <form
              class="p-6 sm:p-8 flex flex-col gap-4 overflow-y-auto"
              @submit.prevent="send"
            >
              <!-- Customer phone info -->
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <span class="text-[11px] font-semibold tracking-wide text-ink-soft">اسم العميل</span>
                  <input
                    type="text"
                    readonly
                    :value="customerName"
                    class="rounded-xl px-4 py-2 text-sm text-ink bg-cream-deep/40 border border-black/[0.06] outline-none"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[11px] font-semibold tracking-wide text-ink-soft">رقم الهاتف</span>
                  <input
                    type="text"
                    required
                    v-model="form.phone"
                    placeholder="9665XXXXXXXX"
                    class="rounded-xl px-4 py-2 text-sm text-ink border border-black/[0.12] hover:border-black/[0.2] focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/15 outline-none font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <!-- Template selector -->
              <div class="flex flex-col gap-1">
                <span class="text-[11px] font-semibold tracking-wide text-ink-soft">اختيار القالب</span>
                <select
                  v-model="selectedTemplateId"
                  @change="onTemplateChange"
                  class="rounded-xl px-4 py-2.5 text-sm text-ink border border-black/[0.12] hover:border-black/[0.2] focus:border-[#15803D] outline-none bg-white"
                >
                  <option :value="null">رسالة مخصصة (كتابة حرة)</option>
                  <option
                    v-for="t in templates"
                    :key="t.id"
                    :value="t.id"
                  >
                    {{ t.name }}
                  </option>
                </select>
              </div>

              <!-- Message body -->
              <div class="flex flex-col gap-1">
                <div class="flex justify-between items-center">
                  <span class="text-[11px] font-semibold tracking-wide text-ink-soft">نص الرسالة</span>
                  <span class="text-[10px] text-ink-mute">يدعم التعديل اليدوي</span>
                </div>
                <textarea
                  required
                  v-model="form.body"
                  rows="6"
                  class="rounded-xl px-4 py-3 text-sm text-ink border border-black/[0.12] hover:border-black/[0.2] focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/15 outline-none resize-none min-h-[140px]"
                  placeholder="اكتب رسالتك هنا..."
                ></textarea>
              </div>

              <!-- Variable list helper (small reminder) -->
              <div class="bg-cream-deep/30 rounded-xl p-3 text-[11px] text-ink-soft leading-relaxed border border-black/[0.04]">
                <span class="font-bold">المتغيرات المستبدلة تلقائياً: </span>
                <span class="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-black/5 mx-0.5">{customer_name}</span>
                <span v-if="refType === 'invoice'" class="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-black/5 mx-0.5">{invoice_number}</span>
                <span v-if="refType === 'invoice'" class="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-black/5 mx-0.5">{amount}</span>
                <span v-if="refType === 'invoice'" class="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-black/5 mx-0.5">{due_date}</span>
                <span v-if="refType === 'proposal'" class="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-black/5 mx-0.5">{offer_title}</span>
                <span class="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-black/5 mx-0.5">{link}</span>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center justify-between gap-4 pt-2 border-t border-black/[0.06]">
                <button
                  type="button"
                  class="bg-cream hover:bg-cream-deep text-ink rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                  @click="close"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  class="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Icon name="mdi:whatsapp" class="w-4 h-4" />
                  فتح واتساب وإرسال
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  customerId?: number | null
  customerName: string
  customerPhone?: string | null
  refType?: 'invoice' | 'proposal' | null
  refId?: number | null
  invoiceNumber?: string | null
  amount?: string | number | null
  dueDate?: string | null
  link?: string | null
  offerTitle?: string | null
  initialTemplateType?: 'invoice_overdue' | 'invoice_reminder' | 'offer_new' | 'offer_expired' | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'sent': []
}>()

const form = reactive({
  phone: '',
  body: ''
})

interface Template {
  id: number
  name: string
  type: string
  body: string
}

const templates = ref<Template[]>([])
const selectedTemplateId = ref<number | null>(null)

// Format KSA phone numbers to international standard 9665xxxxxxx
function formatPhone(phoneStr: string): string {
  let cleaned = phoneStr.replace(/\D/g, '') // remove non-digits
  if (cleaned.startsWith('05')) {
    cleaned = '9665' + cleaned.slice(2)
  } else if (cleaned.startsWith('5') && cleaned.length === 9) {
    cleaned = '966' + cleaned
  }
  return cleaned
}

// Replace template placeholders with prop values
function processTemplate(templateBody: string): string {
  let text = templateBody
  text = text.replace(/{customer_name}/g, props.customerName || '')
  text = text.replace(/{invoice_number}/g, props.invoiceNumber || '')
  
  let formattedAmount = ''
  if (props.amount !== undefined && props.amount !== null) {
    if (typeof props.amount === 'number') {
      // halalas to SAR
      formattedAmount = new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 2 }).format(props.amount / 100)
    } else {
      formattedAmount = String(props.amount)
    }
  }
  text = text.replace(/{amount}/g, formattedAmount)
  text = text.replace(/{due_date}/g, props.dueDate || '')
  text = text.replace(/{offer_title}/g, props.offerTitle || '')
  text = text.replace(/{link}/g, props.link || '')
  return text
}

async function fetchTemplates() {
  try {
    const data = await $fetch<{ templates: Template[] }>('/api/admin/whatsapp/templates')
    templates.value = data.templates

    // Auto-select template based on initialTemplateType or refType
    if (props.initialTemplateType) {
      const match = templates.value.find(t => t.type === props.initialTemplateType)
      if (match) {
        selectedTemplateId.value = match.id
        form.body = processTemplate(match.body)
        return
      }
    }

    if (props.refType === 'invoice') {
      // default invoice template
      const match = templates.value.find(t => t.type === 'invoice_reminder')
      if (match) {
        selectedTemplateId.value = match.id
        form.body = processTemplate(match.body)
      }
    } else if (props.refType === 'proposal') {
      const match = templates.value.find(t => t.type === 'offer_new')
      if (match) {
        selectedTemplateId.value = match.id
        form.body = processTemplate(match.body)
      }
    }
  } catch (e) {
    console.error('Failed to load templates', e)
  }
}

function onTemplateChange() {
  if (selectedTemplateId.value === null) {
    form.body = ''
    return
  }
  const match = templates.value.find(t => t.id === selectedTemplateId.value)
  if (match) {
    form.body = processTemplate(match.body)
  }
}

function close() {
  emit('update:modelValue', false)
}

async function send() {
  if (!form.phone.trim()) return
  if (!form.body.trim()) return

  // 1. Log in our database
  try {
    await $fetch('/api/admin/whatsapp/messages', {
      method: 'POST',
      body: {
        template_id: selectedTemplateId.value,
        customer_id: props.customerId || null,
        phone: form.phone,
        body: form.body,
        ref_type: props.refType || null,
        ref_id: props.refId || null
      }
    })
  } catch (e) {
    console.error('Failed to log WhatsApp message', e)
  }

  // 2. Open WhatsApp redirection in a new tab
  const internationalPhone = formatPhone(form.phone)
  const waUrl = `https://wa.me/${internationalPhone}?text=${encodeURIComponent(form.body)}`
  window.open(waUrl, '_blank')

  emit('sent')
  close()
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.phone = props.customerPhone || ''
      form.body = ''
      selectedTemplateId.value = null
      fetchTemplates()
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden'
      }
    } else if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
    }
  }
)

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>
