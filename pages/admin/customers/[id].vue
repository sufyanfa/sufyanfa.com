<script setup lang="ts">
definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

const route = useRoute()
const id = route.params.id

interface Customer {
  id: number
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
}
interface InvoiceRow {
  id: number
  number: string
  status: string
  issue_date: string
  due_date: string
  slug: string
}

const { data, refresh } = await useFetch<{ customer: Customer; invoices: InvoiceRow[] }>(
  () => `/api/admin/customers/${id}`,
)

const form = reactive<Customer>({
  id: 0, name: '', email: '', phone: '', company: '', notes: '',
})

watchEffect(() => {
  if (data.value?.customer) Object.assign(form, data.value.customer)
})

const saving = ref(false)
const deleting = ref(false)
const error = ref<string | null>(null)

async function save() {
  saving.value = true
  error.value = null
  try {
    await $fetch(`/api/admin/customers/${id}`, { method: 'PUT', body: form })
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ'
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!confirm('هل تريد حذف هذا العميل؟')) return
  deleting.value = true
  error.value = null
  try {
    await $fetch(`/api/admin/customers/${id}`, { method: 'DELETE' })
    await navigateTo('/admin/customers')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ'
  } finally {
    deleting.value = false
  }
}

useHead({
  title: computed(() => `${form.name || 'عميل'} · لوحة التحكم`),
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
      <h1 class="text-3xl font-bold text-ink tracking-tight mb-8">{{ form.name }}</h1>

      <form @submit.prevent="save" class="space-y-4 bg-cream-deep rounded-3xl p-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-ink mb-1">الاسم *</label>
          <input v-model="form.name" required class="w-full px-3 py-2 border border-black/10 rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-ink" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink mb-1">الجهة</label>
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
          <label class="block text-sm font-medium text-ink mb-1">ملاحظات</label>
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
          <button
            type="button"
            :disabled="deleting || (data?.invoices?.length ?? 0) > 0"
            :title="(data?.invoices?.length ?? 0) > 0 ? 'لا يمكن حذف عميل لديه فواتير' : ''"
            @click="remove"
            class="px-5 py-2.5 border border-red-200 text-red-600 rounded-full text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            حذف
          </button>
        </div>
      </form>

      <section v-if="data?.invoices?.length">
        <h2 class="text-lg font-semibold text-ink mb-3">فواتير هذا العميل</h2>
        <div class="bg-cream-deep rounded-3xl overflow-hidden">
          <table class="w-full text-sm">
            <tbody>
              <tr
                v-for="inv in data.invoices"
                :key="inv.id"
                class="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-black/[0.04] last:border-0 hover:bg-white transition-colors"
              >
                <td class="col-span-4">
                  <NuxtLink :to="`/admin/invoices/${inv.id}`" class="font-semibold text-ink hover:underline">{{ inv.number }}</NuxtLink>
                </td>
                <td class="col-span-4 text-ink-soft">{{ inv.status }}</td>
                <td class="col-span-4 text-ink-mute text-[12px]" dir="ltr">{{ inv.issue_date }} → {{ inv.due_date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
