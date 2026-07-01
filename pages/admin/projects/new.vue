<script setup lang="ts">
definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

const saving = ref(false)
const error = ref<string | null>(null)

const name = ref('')
const slug = ref('')
const customer_id = ref<number | null>(null)
const password = ref('')
const start_date = ref('')
const end_date = ref('')
const notes = ref('')

const slugDirty = ref(false)

function slugify(text: string) {
  return text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\u0600-\u06FF]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 120)
}

watch(name, (v) => {
  if (!slugDirty.value) {
    slug.value = slugify(v)
  }
})

async function submit() {
  if (!name.value.trim() || !customer_id.value) {
    error.value = 'الاسم والعميل مطلوبان'
    return
  }
  saving.value = true
  error.value = null
  try {
    const res = await $fetch<{ ok: boolean; id: number; slug: string }>('/api/admin/projects', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        slug: slug.value || undefined,
        customer_id: customer_id.value,
        password: password.value || undefined,
        start_date: start_date.value || undefined,
        end_date: end_date.value || undefined,
        notes: notes.value || undefined,
      },
    })
    await navigateTo(`/admin/projects/${res.id}`)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'حدث خطأ'
  } finally {
    saving.value = false
  }
}

useHead({ title: 'مشروع جديد · لوحة التحكم', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <div class="mx-auto max-w-3xl p-6">
    <NuxtLink to="/admin/projects" class="text-sm text-gray-500 mb-3 inline-block">&larr; المشاريع</NuxtLink>
    <h1 class="text-2xl font-bold mb-6">مشروع جديد</h1>

    <div v-if="error" class="text-red-600 text-sm mb-3">{{ error }}</div>

    <form @submit.prevent="submit" class="space-y-5">
      <div>
        <label class="text-sm font-semibold block mb-1.5">اسم المشروع</label>
        <input v-model="name" type="text" class="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm" />
      </div>

      <div>
        <label class="text-sm font-semibold block mb-1.5">رابط المشروع (slug)</label>
        <div class="flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm bg-white dir-ltr">
          <span class="text-ink-soft shrink-0 text-[13px]">sufyanfa.com/project/</span>
          <input v-model="slug" type="text" class="flex-1 border-0 outline-none p-0 bg-transparent" dir="ltr" @input="slugDirty = true" />
        </div>
        <p class="text-xs text-ink-mute mt-1">يسمح بالأحرف العربية واللاتينية والأرقام والشرطات فقط. الرابط اللي العميل يستخدمه.</p>
      </div>

      <div>
        <label class="text-sm font-semibold block mb-1.5">العميل</label>
        <AdminCustomerPicker v-model="customer_id" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-semibold block mb-1.5">تاريخ البداية</label>
          <input v-model="start_date" type="date" class="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm" dir="ltr" />
        </div>
        <div>
          <label class="text-sm font-semibold block mb-1.5">تاريخ النهاية</label>
          <input v-model="end_date" type="date" class="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm" dir="ltr" />
        </div>
      </div>

      <div>
        <label class="text-sm font-semibold block mb-1.5">كلمة مرور للمشاهدة العامة</label>
        <input v-model="password" type="text" class="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm" placeholder="اترك فارغاً إذا لا تحتاج حماية" />
        <p class="text-xs text-ink-mute mt-1">العميل يدخلها عشان يشوف البورد. إذا ما ضبطت كلمة، البورد ما ينعرض للعامة.</p>
      </div>

      <div>
        <label class="text-sm font-semibold block mb-1.5">ملاحظات</label>
        <textarea v-model="notes" rows="3" class="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm"></textarea>
      </div>

      <div class="flex gap-3 pt-2">
        <button type="submit" :disabled="saving" class="bg-ink text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">
          {{ saving ? 'جاري الحفظ...' : 'إنشاء المشروع' }}
        </button>
        <NuxtLink to="/admin/projects" class="border border-black/10 rounded-full px-6 py-2.5 text-sm font-semibold">إلغاء</NuxtLink>
      </div>
    </form>
  </div>
</template>
