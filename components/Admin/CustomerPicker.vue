<script setup lang="ts">
interface Customer { id: number; name: string; company: string | null; email: string | null }

const props = defineProps<{ modelValue: number | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: number | null): void }>()

const { data, refresh } = await useFetch<{ customers: Customer[] }>('/api/admin/customers')

const query = ref('')
const open = ref(false)
const showNew = ref(false)
const newForm = reactive({ name: '', email: '', phone: '', company: '' })
const newError = ref<string | null>(null)
const newSaving = ref(false)

const filtered = computed(() => {
  const list = data.value?.customers ?? []
  const q = query.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.company ?? '').toLowerCase().includes(q) ||
    (c.email ?? '').toLowerCase().includes(q),
  )
})

const selected = computed(() => data.value?.customers.find(c => c.id === props.modelValue))

function pick(c: Customer) {
  emit('update:modelValue', c.id)
  open.value = false
  query.value = ''
}

async function createNew() {
  if (!newForm.name.trim()) { newError.value = 'الاسم مطلوب'; return }
  newSaving.value = true
  newError.value = null
  try {
    const res = await $fetch<{ ok: boolean; id: number }>('/api/admin/customers', {
      method: 'POST', body: newForm,
    })
    await refresh()
    emit('update:modelValue', res.id)
    showNew.value = false
    Object.assign(newForm, { name: '', email: '', phone: '', company: '' })
  } catch (e: any) {
    newError.value = e?.data?.statusMessage || e?.message || 'حدث خطأ'
  } finally {
    newSaving.value = false
  }
}
</script>

<template>
  <div class="relative">
    <div class="flex gap-2">
      <button
        type="button"
        @click="open = !open"
        class="flex-1 text-right px-3 py-2 border border-black/10 rounded-lg bg-white"
      >
        <span v-if="selected">{{ selected.name }}<span v-if="selected.company" class="text-gray-500"> — {{ selected.company }}</span></span>
        <span v-else class="text-gray-400">اختر عميلاً…</span>
      </button>
      <button type="button" @click="showNew = true" class="px-3 py-2 border border-black/10 rounded-lg">+ جديد</button>
    </div>

    <div v-if="open" class="absolute top-full right-0 left-0 mt-1 bg-white border border-black/10 rounded-lg shadow-lg z-10 max-h-80 overflow-auto">
      <input v-model="query" placeholder="ابحث…" class="w-full px-3 py-2 border-b border-black/10 focus:outline-none" />
      <button
        v-for="c in filtered"
        :key="c.id"
        type="button"
        @click="pick(c)"
        class="w-full text-right px-3 py-2 hover:bg-cream"
      >
        {{ c.name }}<span v-if="c.company" class="text-gray-500"> — {{ c.company }}</span>
      </button>
      <div v-if="!filtered.length" class="px-3 py-4 text-center text-sm text-gray-500">
        لا توجد نتائج
      </div>
    </div>

    <!-- Inline-create modal -->
    <div v-if="showNew" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="showNew = false">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">عميل جديد</h3>
        <div class="space-y-3">
          <input v-model="newForm.name" placeholder="الاسم *" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
          <input v-model="newForm.company" placeholder="الجهة" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
          <input v-model="newForm.email" placeholder="البريد" type="email" class="w-full px-3 py-2 border border-black/10 rounded-lg" />
          <input v-model="newForm.phone" placeholder="الهاتف" class="w-full px-3 py-2 border border-black/10 rounded-lg" dir="ltr" />
        </div>
        <div v-if="newError" class="text-red-600 text-sm mt-3">{{ newError }}</div>
        <div class="flex gap-3 mt-5">
          <button type="button" @click="createNew" :disabled="newSaving" class="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50">
            {{ newSaving ? 'جارٍ الحفظ…' : 'حفظ' }}
          </button>
          <button type="button" @click="showNew = false" class="px-4 py-2 border border-black/10 rounded-lg">إلغاء</button>
        </div>
      </div>
    </div>
  </div>
</template>
