<template>
  <div class="min-h-screen flex items-center justify-center px-6 bg-white">
    <div class="w-full max-w-sm">
      <div class="text-center mb-10">
        <NuxtLink to="/" class="inline-block mb-8" aria-label="الصفحة الرئيسية">
          <img src="/logo.svg" alt="سفيان فارع" class="h-7 w-auto mx-auto" />
        </NuxtLink>
        <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-4">
          <span class="w-1.5 h-1.5 rounded-full bg-ink"></span>
          لوحة التحكم
        </div>
        <h1 class="text-2xl font-bold text-ink">تسجيل الدخول</h1>
      </div>

      <form @submit.prevent="submit" class="bg-cream-deep rounded-3xl p-6 sm:p-8 space-y-4">
        <div>
          <label class="block text-[12px] font-semibold text-ink mb-2">البريد الإلكتروني</label>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="w-full bg-white border border-black/[0.12] focus:border-ink focus:ring-2 focus:ring-black/5 rounded-2xl px-4 py-3 text-sm text-ink outline-none transition-all"
            dir="ltr"
          />
        </div>
        <div>
          <label class="block text-[12px] font-semibold text-ink mb-2">كلمة المرور</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full bg-white border border-black/[0.12] focus:border-ink focus:ring-2 focus:ring-black/5 rounded-2xl px-4 py-3 text-sm text-ink outline-none transition-all"
          />
        </div>
        <p v-if="error" class="text-[13px] text-red-600">{{ error }}</p>
        <button
          type="submit"
          :disabled="submitting"
          class="w-full bg-ink text-white rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {{ submitting ? 'جارٍ الدخول…' : 'دخول' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'bare' })

const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { email: email.value, password: password.value } })
    await navigateTo('/admin/proposals')
  } catch (e: any) {
    if (e?.statusCode === 429) error.value = 'محاولات كثيرة. حاول مرة أخرى لاحقًا.'
    else if (e?.statusCode === 401) error.value = 'بيانات الدخول غير صحيحة'
    else error.value = 'حدث خطأ. حاول مرة أخرى.'
  } finally {
    submitting.value = false
  }
}

useHead({
  title: 'تسجيل الدخول · لوحة التحكم',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>
