<template>
  <div class="min-h-screen bg-white">
    <AdminHeader />
    <div class="max-w-4xl mx-auto px-6 sm:px-8 py-10">
      
      <!-- Back and title -->
      <NuxtLink to="/admin/whatsapp" class="text-sm text-gray-500 mb-3 inline-block">← العودة إلى الواتساب</NuxtLink>

      <div class="flex items-center justify-between mb-8">
        <div>
          <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
            لوحة التحكم
          </div>
          <h1 class="text-3xl font-bold text-ink tracking-tight">إدارة قوالب الرسائل</h1>
        </div>
        <button
          @click="openCreate"
          class="inline-flex items-center gap-2 bg-ink text-white rounded-full px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
          قالب جديد
        </button>
      </div>

      <!-- Loading / Empty -->
      <div v-if="pending" class="text-center py-12 text-ink-soft text-sm">
        جارٍ تحميل القوالب...
      </div>

      <div v-else-if="!templates.length" class="text-center py-16 bg-cream-deep rounded-3xl text-ink-mute text-sm">
        لا توجد قوالب رسائل حالياً. اضغط على "قالب جديد" لإضافة أول قالب.
      </div>

      <!-- Templates List -->
      <div v-else class="space-y-4">
        <div
          v-for="t in templates"
          :key="t.id"
          class="bg-cream-deep rounded-3xl p-6 border border-black/[0.04] hover:border-black/[0.1] transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
        >
          <div class="space-y-3 flex-1">
            <div class="flex items-center gap-3">
              <h3 class="text-base font-bold text-ink">{{ t.name }}</h3>
              <span
                class="inline-block px-2 py-0.5 text-[10px] font-semibold rounded bg-white text-ink-soft border border-black/[0.06] font-mono"
              >
                {{ t.type }}
              </span>
            </div>
            
            <p class="text-sm text-ink-soft bg-white p-4 rounded-2xl border border-black/[0.04] whitespace-pre-wrap leading-relaxed">
              {{ t.body }}
            </p>
          </div>

          <!-- Action buttons -->
          <div class="flex md:flex-col gap-2 flex-shrink-0">
            <button
              @click="openEdit(t)"
              class="inline-flex items-center justify-center gap-1.5 bg-white border border-black/10 hover:bg-cream-deep text-ink-soft rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
            >
              <Icon name="lucide:edit-2" class="w-3.5 h-3.5" />
              تعديل
            </button>
            <button
              @click="deleteTemplate(t.id)"
              class="inline-flex items-center justify-center gap-1.5 bg-white border border-red-100 hover:bg-red-50 text-red-600 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
            >
              <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
              حذف
            </button>
          </div>
        </div>
      </div>

      <!-- Variable Info Box -->
      <section class="mt-10 bg-cream-deep/40 rounded-3xl p-6 border border-black/[0.06]">
        <h2 class="text-sm font-bold text-ink mb-2">💡 دليل المتغيرات الذكية</h2>
        <p class="text-xs text-ink-soft leading-relaxed mb-4">
          يمكنك تضمين المتغيرات التالية داخل نص القالب، وسيتم استبدالها تلقائياً بالقيم الصحيحة عند تجهيز الرسالة للإرسال:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div class="flex items-start gap-2">
            <code class="font-mono bg-white px-1.5 py-0.5 rounded border border-black/5 text-[#15803D]">{customer_name}</code>
            <span class="text-ink-soft">الاسم الكامل للعميل</span>
          </div>
          <div class="flex items-start gap-2">
            <code class="font-mono bg-white px-1.5 py-0.5 rounded border border-black/5 text-[#15803D]">{invoice_number}</code>
            <span class="text-ink-soft">رقم الفاتورة (مثال: INV-2026-0001)</span>
          </div>
          <div class="flex items-start gap-2">
            <code class="font-mono bg-white px-1.5 py-0.5 rounded border border-black/5 text-[#15803D]">{amount}</code>
            <span class="text-ink-soft">المبلغ الإجمالي للفاتورة بالريال السعودي</span>
          </div>
          <div class="flex items-start gap-2">
            <code class="font-mono bg-white px-1.5 py-0.5 rounded border border-black/5 text-[#15803D]">{due_date}</code>
            <span class="text-ink-soft">تاريخ استحقاق الفاتورة</span>
          </div>
          <div class="flex items-start gap-2">
            <code class="font-mono bg-white px-1.5 py-0.5 rounded border border-black/5 text-[#15803D]">{offer_title}</code>
            <span class="text-ink-soft">عنوان عرض السعر</span>
          </div>
          <div class="flex items-start gap-2">
            <code class="font-mono bg-white px-1.5 py-0.5 rounded border border-black/5 text-[#15803D]">{link}</code>
            <span class="text-ink-soft">رابط الفاتورة أو رابط عرض السعر المباشر</span>
          </div>
        </div>
      </section>

      <!-- Create / Edit Modal -->
      <div v-if="editorOpen" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="editorOpen = false">
        <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl">
          <h3 class="text-lg font-bold mb-4 text-ink">
            {{ isEditing ? 'تعديل قالب رسالة' : 'إنشاء قالب رسالة جديد' }}
          </h3>
          
          <form @submit.prevent="saveTemplate" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-ink-soft mb-1">اسم القالب *</label>
              <input
                v-model="form.name"
                required
                placeholder="مثال: تذكير الفواتير المتأخرة"
                class="w-full px-4 py-2 border border-black/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-ink text-sm"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-ink-soft mb-1">نوع القالب *</label>
              <select
                v-model="form.type"
                required
                class="w-full px-4 py-2 border border-black/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-ink text-sm bg-white"
              >
                <option value="invoice_overdue">تذكير فاتورة متأخرة (invoice_overdue)</option>
                <option value="invoice_reminder">تذكير فاتورة مستحقة قريباً (invoice_reminder)</option>
                <option value="offer_new">إرسال عرض سعر جديد (offer_new)</option>
                <option value="offer_expired">تذكير عرض سعر منتهي (offer_expired)</option>
                <option value="custom">قالب مخصص آخر (custom)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-ink-soft mb-1">نص الرسالة *</label>
              <textarea
                v-model="form.body"
                required
                rows="5"
                placeholder="مرحباً {customer_name}..."
                class="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-ink text-sm resize-none"
              ></textarea>
            </div>

            <div v-if="error" class="text-red-600 text-xs mt-1">{{ error }}</div>

            <div class="flex gap-3 mt-6 justify-end">
              <button
                type="submit"
                :disabled="saving"
                class="px-5 py-2.5 bg-ink text-white rounded-full text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {{ saving ? 'جارٍ الحفظ…' : 'حفظ القالب' }}
              </button>
              <button
                type="button"
                @click="editorOpen = false"
                class="px-5 py-2.5 bg-cream hover:bg-cream-deep text-ink rounded-full text-xs font-semibold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

interface Template {
  id: number
  name: string
  type: string
  body: string
}

const { data, pending, refresh } = await useFetch<{ templates: Template[] }>('/api/admin/whatsapp/templates')
const templates = computed(() => data.value?.templates ?? [])

const editorOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  name: '',
  type: 'custom',
  body: ''
})

function openCreate() {
  isEditing.value = false
  editingId.value = null
  form.name = ''
  form.type = 'custom'
  form.body = ''
  error.value = null
  editorOpen.value = true
}

function openEdit(t: Template) {
  isEditing.value = true
  editingId.value = t.id
  form.name = t.name
  form.type = t.type
  form.body = t.body
  error.value = null
  editorOpen.value = true
}

async function saveTemplate() {
  saving.value = true
  error.value = null
  try {
    if (isEditing.value && editingId.value) {
      await $fetch(`/api/admin/whatsapp/templates/${editingId.value}`, {
        method: 'PUT',
        body: form
      })
    } else {
      await $fetch('/api/admin/whatsapp/templates', {
        method: 'POST',
        body: form
      })
    }
    editorOpen.value = false
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ أثناء حفظ القالب'
  } finally {
    saving.value = false
  }
}

async function deleteTemplate(id: number) {
  if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return
  try {
    await $fetch(`/api/admin/whatsapp/templates/${id}`, {
      method: 'DELETE'
    })
    await refresh()
  } catch (e: any) {
    alert(e?.data?.statusMessage || e?.message || 'حدث خطأ أثناء حذف القالب')
  }
}

useHead({
  title: 'إدارة القوالب · واتساب · لوحة التحكم',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>
