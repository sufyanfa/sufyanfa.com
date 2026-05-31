<template>
  <div class="min-h-screen bg-white">
    <AdminHeader />
    <div class="max-w-6xl mx-auto px-6 sm:px-8 py-10">
      <header class="flex items-center justify-between mb-10">
        <div>
          <NuxtLink to="/admin/proposals" class="inline-flex items-center gap-2 text-[13px] text-ink-mute hover:text-ink transition-colors mb-3">
            <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
            العروض
          </NuxtLink>
          <h1 class="text-3xl font-bold text-ink tracking-tight">عرض جديد</h1>
        </div>
      </header>

      <form @submit.prevent="save" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left: form -->
        <div class="space-y-5">
          <AdminProposalField label="العنوان">
            <input v-model="form.title" required class="input" placeholder="منصة الخدمات القانونية" />
          </AdminProposalField>

          <AdminProposalField label="الرابط (slug)">
            <div class="flex items-center gap-2">
              <span class="text-[12px] text-ink-mute" dir="ltr">/p/</span>
              <input v-model="form.slug" required class="input flex-1" placeholder="legal-platform" dir="ltr" pattern="[a-z0-9][a-z0-9-]*" />
            </div>
          </AdminProposalField>

          <div class="grid grid-cols-2 gap-4">
            <AdminProposalField label="اسم العميل">
              <input v-model="form.client_name" required class="input" placeholder="مكتب أصول للمحاماة" />
            </AdminProposalField>
            <AdminProposalField label="تاريخ العرض">
              <input v-model="form.proposal_date" type="date" required class="input" />
            </AdminProposalField>
          </div>

          <AdminProposalField label="بطاقة العميل (اختياري)">
            <input v-model="form.client_label" class="input" placeholder="إلى: شركاء الشركة" />
          </AdminProposalField>

          <AdminProposalField label="كلمة المرور للعميل">
            <div class="flex gap-2">
              <input v-model="form.password" required class="input flex-1" />
              <button type="button" @click="genPassword" class="bg-cream-deep hover:bg-black/[0.06] rounded-full px-4 text-[12px] font-semibold text-ink-soft transition-colors">توليد</button>
            </div>
          </AdminProposalField>

          <AdminProposalField label="تاريخ الانتهاء (اختياري)">
            <input v-model="expiresDate" type="date" class="input" />
          </AdminProposalField>

          <div class="grid grid-cols-2 gap-4">
            <AdminProposalField label="نص زر الإجراء (اختياري)">
              <input v-model="form.cta_label" class="input" placeholder="احجز جلسة" />
            </AdminProposalField>
            <AdminProposalField label="رابط زر الإجراء">
              <input v-model="form.cta_url" class="input" placeholder="https://cal.com/..." dir="ltr" />
            </AdminProposalField>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <AdminProposalField label="السعر (ر.س. — اختياري)">
              <input v-model="form.priceSAR" type="number" step="0.01" min="0" class="input" placeholder="0.00" dir="ltr" />
            </AdminProposalField>
            <AdminProposalField label="السعر بعد الخصم (ر.س. — اختياري)">
              <input v-model="form.priceAfterDiscountSAR" type="number" step="0.01" min="0" class="input" placeholder="0.00" dir="ltr" />
            </AdminProposalField>
          </div>

          <AdminProposalField label="المحتوى (Markdown)">
            <textarea
              v-model="form.content_md"
              required
              rows="20"
              class="w-full bg-white border border-black/[0.12] focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/15 rounded-2xl px-4 py-3 text-[13px] text-ink outline-none transition-all font-mono leading-[1.7] resize-y"
              placeholder="## 1.0 التحديات الحالية&#10;&#10;..."
            ></textarea>
          </AdminProposalField>

          <div v-if="error" class="bg-red-50 text-red-700 rounded-2xl p-4 text-sm">{{ error }}</div>

          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              :disabled="saving"
              class="bg-ink text-white rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {{ saving ? 'جارٍ الحفظ…' : 'حفظ كمسوّدة' }}
            </button>
            <NuxtLink
              to="/admin/proposals"
              class="bg-cream-deep hover:bg-black/[0.06] text-ink rounded-full px-6 py-3 text-sm font-semibold transition-colors"
            >
              إلغاء
            </NuxtLink>
          </div>
        </div>

        <!-- Right: preview -->
        <aside class="lg:sticky lg:top-6 lg:self-start">
          <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-3">معاينة</div>
          <div class="bg-cream-deep rounded-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div class="bg-white rounded-2xl p-6 mb-4">
              <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-2 inline-flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
                عرض
              </div>
              <div class="text-[12px] text-ink-soft mb-2">{{ form.proposal_date || '—' }} · {{ form.client_name || '—' }}</div>
              <h2 class="text-2xl font-bold text-ink leading-[1.3] tracking-tight">{{ form.title || 'عنوان العرض' }}</h2>
            </div>
            <div class="proposal-prose text-ink-soft text-[14px] leading-[1.85]" v-html="renderedPreview"></div>
          </div>
        </aside>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { renderMarkdown } from '~/composables/useMarkdown'

definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^؀-ۿa-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

const today = new Date().toISOString().slice(0, 10)
const form = reactive({
  title: '',
  slug: '',
  client_name: '',
  client_label: '',
  proposal_date: today,
  password: '',
  content_md: '',
  cta_label: '',
  cta_url: '',
  priceSAR: '' as string,
  priceAfterDiscountSAR: '' as string
})
const expiresDate = ref('')

watch(() => form.title, (t) => {
  if (!form.slug || form.slug === slugify(form.slug)) {
    // auto-generate slug from latin chars in title; admin can override
    const ascii = t.replace(/[؀-ۿ]/g, '').trim()
    if (ascii) form.slug = slugify(ascii)
  }
})

const error = ref('')
const saving = ref(false)

function genPassword() {
  const adjectives = ['noor', 'asaal', 'safa', 'amal', 'rida']
  const a = adjectives[Math.floor(Math.random() * adjectives.length)]
  const n = Math.floor(1000 + Math.random() * 9000)
  form.password = `${a}-${n}`
}

const renderedPreview = computed(() => renderMarkdown(form.content_md || '_ابدأ بكتابة محتوى العرض…_'))

async function save() {
  error.value = ''
  saving.value = true
  try {
    const expires_at = expiresDate.value ? new Date(expiresDate.value).getTime() : null
    const toHalalas = (s: string): number | null => {
      if (s === '' || s === null || s === undefined) return null
      const n = Number(s)
      if (!Number.isFinite(n)) return null
      return Math.round(n * 100)
    }
    const res = await $fetch<{ ok: boolean; id: number }>('/api/admin/proposals', {
      method: 'POST',
      body: {
        slug: form.slug,
        title: form.title,
        client_name: form.client_name,
        client_label: form.client_label || undefined,
        proposal_date: form.proposal_date,
        password: form.password,
        content_md: form.content_md,
        cta_label: form.cta_label || undefined,
        cta_url: form.cta_url || undefined,
        expires_at,
        price: toHalalas(form.priceSAR),
        price_after_discount: toHalalas(form.priceAfterDiscountSAR)
      }
    })
    await navigateTo(`/admin/proposals/${res.id}`)
  } catch (e: any) {
    if (e?.statusCode === 409) error.value = 'هذا الرابط مستخدم بالفعل. اختر slug آخر.'
    else if (e?.statusCode === 400) error.value = e?.statusMessage || 'بيانات غير صحيحة.'
    else error.value = 'حدث خطأ. حاول مرة أخرى.'
  } finally {
    saving.value = false
  }
}

useHead({
  title: 'عرض جديد · لوحة التحكم',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<style scoped>
.input {
  width: 100%;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #000;
  outline: none;
  transition: all 0.15s ease;
}
.input:focus {
  border-color: #15803D;
  box-shadow: 0 0 0 2px rgba(21, 128, 61, 0.15);
}
</style>

<style>
.proposal-prose h1, .proposal-prose h2, .proposal-prose h3, .proposal-prose h4 {
  color: #000;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}
.proposal-prose h1 { font-size: 1.5rem; }
.proposal-prose h2 { font-size: 1.25rem; }
.proposal-prose h3 { font-size: 1.05rem; }
.proposal-prose p { margin-bottom: 1rem; }
.proposal-prose strong { color: #000; font-weight: 700; }
.proposal-prose a { color: #15803D; text-decoration: underline; }
.proposal-prose ul, .proposal-prose ol { margin: 1rem 0; padding-inline-start: 1.5rem; }
.proposal-prose li { margin-bottom: 0.4rem; }
.proposal-prose ul { list-style: disc; }
.proposal-prose ol { list-style: decimal; }
.proposal-prose blockquote {
  border-inline-start: 3px solid #15803D;
  padding: 0.4rem 1rem;
  margin: 1rem 0;
  background: #F5F5F7;
  border-radius: 12px;
}
.proposal-prose table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9em; }
.proposal-prose th, .proposal-prose td { padding: 0.5rem 0.75rem; border: 1px solid rgba(0,0,0,0.08); text-align: start; }
</style>
