<script setup lang="ts">
definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

interface Settings {
  business_name: string
  logo_url: string | null
  email: string | null
  phone: string | null
  address: string | null
  bank_name: string | null
  bank_account_name: string | null
  bank_account_number: string | null
  bank_iban: string | null
  default_due_days: number
  default_notes: string | null
}

const { data, refresh } = await useFetch<{ settings: Settings }>('/api/admin/settings')

const form = reactive<Settings>({
  business_name: '', logo_url: '', email: '', phone: '', address: '',
  bank_name: '', bank_account_name: '', bank_account_number: '', bank_iban: '',
  default_due_days: 14, default_notes: '',
})

watchEffect(() => {
  if (data.value?.settings) Object.assign(form, data.value.settings)
})

const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)

async function save() {
  saving.value = true
  error.value = null
  saved.value = false
  try {
    await $fetch('/api/admin/settings', { method: 'PUT', body: form })
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ'
  } finally {
    saving.value = false
  }
}

useHead({
  title: 'إعدادات الفواتير · لوحة التحكم',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <AdminHeader />
    <div class="mx-auto max-w-2xl px-6 sm:px-8 py-10">
      <div class="mb-8">
        <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
          لوحة التحكم
        </div>
        <h1 class="text-3xl font-bold text-ink tracking-tight">إعدادات الفواتير</h1>
      </div>

      <form @submit.prevent="save" class="space-y-6 bg-cream-deep rounded-3xl p-6">

        <section class="space-y-3">
          <h2 class="text-[11px] font-semibold text-ink-mute uppercase tracking-wide">معلومات النشاط</h2>
          <div>
            <label class="block text-sm font-medium text-ink mb-1">اسم النشاط *</label>
            <input v-model="form.business_name" required class="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-ink" />
          </div>
          <div>
            <label class="block text-sm font-medium text-ink mb-1">رابط الشعار</label>
            <input v-model="form.logo_url" placeholder="/logo.svg" class="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-ink" dir="ltr" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-ink mb-1">البريد</label>
              <input v-model="form.email" type="email" class="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink mb-1">الهاتف</label>
              <input v-model="form.phone" class="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-ink" dir="ltr" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-ink mb-1">العنوان</label>
            <input v-model="form.address" class="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-ink" />
          </div>
        </section>

        <section class="space-y-3">
          <h2 class="text-[11px] font-semibold text-ink-mute uppercase tracking-wide">معلومات الدفع</h2>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-ink mb-1">البنك</label>
              <input v-model="form.bank_name" class="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink mb-1">اسم الحساب</label>
              <input v-model="form.bank_account_name" class="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-ink mb-1">رقم الحساب</label>
            <input v-model="form.bank_account_number" class="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-ink font-mono focus:outline-none focus:ring-1 focus:ring-ink" dir="ltr" />
          </div>
          <div>
            <label class="block text-sm font-medium text-ink mb-1">الآيبان</label>
            <input v-model="form.bank_iban" placeholder="SA..." class="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-ink font-mono focus:outline-none focus:ring-1 focus:ring-ink" dir="ltr" />
          </div>
        </section>

        <section class="space-y-3">
          <h2 class="text-[11px] font-semibold text-ink-mute uppercase tracking-wide">افتراضات الفاتورة</h2>
          <div>
            <label class="block text-sm font-medium text-ink mb-1">مدة الاستحقاق (أيام)</label>
            <input v-model.number="form.default_due_days" type="number" min="0" class="w-32 px-3 py-2 border border-black/10 rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-ink" />
          </div>
          <div>
            <label class="block text-sm font-medium text-ink mb-1">ملاحظات افتراضية تظهر على الفاتورة</label>
            <textarea v-model="form.default_notes" rows="3" class="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-ink"></textarea>
          </div>
        </section>

        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            :disabled="saving"
            class="px-5 py-2.5 bg-ink text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {{ saving ? 'جارٍ الحفظ…' : 'حفظ الإعدادات' }}
          </button>
          <span v-if="saved" class="text-[#15803D] text-sm font-medium">تم الحفظ</span>
        </div>
      </form>
    </div>
  </div>
</template>
