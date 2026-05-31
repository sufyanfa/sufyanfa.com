<script setup lang="ts">
definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

const { data: settingsData } = await useFetch<{ settings: { default_due_days: number; default_notes: string | null } }>('/api/admin/settings')

const saving = ref(false)
const error = ref<string | null>(null)

async function onSubmit(payload: { status: 'draft' | 'sent'; data: any }) {
  saving.value = true
  error.value = null
  try {
    const res = await $fetch<{ ok: boolean; invoice: { id: number } }>('/api/admin/invoices', {
      method: 'POST',
      body: { ...payload.data, status: payload.status },
    })
    await navigateTo(`/admin/invoices/${res.invoice.id}`)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl p-6">
    <NuxtLink to="/admin/invoices" class="text-sm text-gray-500 mb-3 inline-block">← الفواتير</NuxtLink>
    <h1 class="text-2xl font-bold mb-6">فاتورة جديدة</h1>

    <div v-if="error" class="text-red-600 text-sm mb-3">{{ error }}</div>

    <AdminInvoiceForm
      :default-due-days="settingsData?.settings.default_due_days ?? 14"
      :default-notes="settingsData?.settings.default_notes ?? ''"
      :submit-labels="{ draft: 'حفظ كمسودة', sent: 'حفظ ووضع كمرسلة' }"
      @submit="onSubmit"
    />
  </div>
</template>
