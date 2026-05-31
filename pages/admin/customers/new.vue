<script setup lang="ts">
definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

const form = reactive({ name: '', email: '', phone: '', company: '', notes: '' })
const saving = ref(false)
const error = ref<string | null>(null)

async function save() {
  saving.value = true
  error.value = null
  try {
    const res = await $fetch<{ ok: boolean; id: number }>('/api/admin/customers', {
      method: 'POST',
      body: form,
    })
    await navigateTo(`/admin/customers/${res.id}`)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ'
  } finally {
    saving.value = false
  }
}

useHead({
  title: 'عميل جديد · لوحة التحكم',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <AdminHeader />
    <div class="mx-auto max-w-2xl px-6 sm:px-8 py-10">
      <NuxtLink to="/admin/customers" class="text-sm text-ink-mute mb-4 inline-block hover:text-ink transition-colors">
        العملاء
      </NuxtLink>
      <h1 class="text-3xl font-bold text-ink tracking-tight mb-8">عميل جديد</h1>

      <form @submit.prevent="save" class="space-y-4 bg-cream-deep rounded-3xl p-6">
        <div>
          <label class="block text-sm font-medium text-ink mb-1">الاسم *</label>
          <input v-model="form.name" required class="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-ink" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink mb-1">الجهة (اختياري)</label>
          <input v-model="form.company" class="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-ink" />
        </div>
        <div class="grid grid-cols-2 gap-4">
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
          <label class="block text-sm font-medium text-ink mb-1">ملاحظات خاصة (لا تُعرض على العميل)</label>
          <textarea v-model="form.notes" rows="3" class="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-ink"></textarea>
        </div>

        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

        <div class="flex gap-3 pt-2">
          <button
            type="submit"
            :disabled="saving"
            class="px-5 py-2.5 bg-ink text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {{ saving ? 'جارٍ الحفظ…' : 'حفظ' }}
          </button>
          <NuxtLink
            to="/admin/customers"
            class="px-5 py-2.5 border border-black/10 rounded-full text-sm font-semibold text-ink-soft hover:bg-black/[0.04] transition-colors"
          >
            إلغاء
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>
