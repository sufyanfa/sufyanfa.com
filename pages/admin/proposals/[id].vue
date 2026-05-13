<template>
  <div class="min-h-screen bg-white">
    <AdminHeader />
    <div class="max-w-5xl mx-auto px-6 sm:px-8 py-10">
      <div v-if="pending" class="text-ink-mute text-sm py-12 text-center">جارٍ التحميل…</div>

      <div v-else-if="error" class="bg-red-50 text-red-700 rounded-3xl p-6 text-sm">{{ error }}</div>

      <div v-else-if="data">
        <header class="flex items-start justify-between gap-4 mb-8">
          <div class="flex-1 min-w-0">
            <NuxtLink to="/admin/proposals" class="inline-flex items-center gap-2 text-[13px] text-ink-mute hover:text-ink transition-colors mb-3">
              <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
              الاقتراحات
            </NuxtLink>
            <div class="flex items-center gap-3 mb-2 flex-wrap">
              <AdminStatusBadge :status="data.proposal.status" />
              <span class="text-[12px] text-ink-mute">آخر تحديث: {{ formatTime(data.proposal.updated_at) }}</span>
            </div>
            <h1 class="text-3xl font-bold text-ink tracking-tight">{{ data.proposal.title }}</h1>
            <p class="text-ink-soft text-sm mt-1">{{ data.proposal.client_name }} · {{ data.proposal.proposal_date }}</p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              v-if="data.proposal.status === 'draft'"
              @click="send"
              :disabled="sending"
              class="inline-flex items-center gap-2 bg-ink text-white rounded-full px-4 py-2.5 text-[13px] font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              <Icon name="lucide:send" class="w-3.5 h-3.5" />
              إرسال
            </button>
            <button
              @click="editing = !editing"
              class="inline-flex items-center gap-2 bg-cream-deep hover:bg-black/[0.06] text-ink rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors"
            >
              <Icon :name="editing ? 'lucide:x' : 'lucide:edit-2'" class="w-3.5 h-3.5" />
              {{ editing ? 'إغلاق' : 'تعديل' }}
            </button>
            <button
              @click="confirmDelete"
              class="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors"
            >
              <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
              حذف
            </button>
          </div>
        </header>

        <!-- Share box -->
        <div class="bg-cream-deep rounded-3xl p-6 mb-8">
          <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-4">المشاركة</div>
          <div class="space-y-3">
            <div class="flex items-center gap-3 bg-white rounded-2xl px-4 py-3">
              <span class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute w-16 flex-shrink-0">الرابط</span>
              <code class="flex-1 text-[13px] text-ink truncate" dir="ltr">{{ publicUrl }}</code>
              <button @click="copy(publicUrl, 'url')" class="text-[12px] font-semibold text-[#15803D] hover:opacity-70 transition-opacity">
                {{ copied === 'url' ? '✓ نُسخ' : 'نسخ' }}
              </button>
            </div>
            <div class="flex items-center gap-3 bg-white rounded-2xl px-4 py-3">
              <span class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute w-16 flex-shrink-0">كلمة المرور</span>
              <code class="flex-1 text-[13px] text-ink truncate" dir="ltr">
                {{ passwordRevealed ? newPassword || '…' : '••••••••' }}
              </code>
              <button v-if="newPassword" @click="copy(newPassword, 'pwd')" class="text-[12px] font-semibold text-[#15803D] hover:opacity-70 transition-opacity">
                {{ copied === 'pwd' ? '✓ نُسخ' : 'نسخ' }}
              </button>
              <button @click="passwordRevealed = !passwordRevealed" class="text-[12px] text-ink-mute hover:text-ink transition-colors">
                {{ passwordRevealed ? 'إخفاء' : 'إظهار' }}
              </button>
            </div>
            <p v-if="!newPassword" class="text-[12px] text-ink-mute pt-1">
              لأمانك، كلمة المرور لا تُحفظ بعد الإنشاء. عيّن كلمة جديدة من زر "تعديل" لإعادة المشاركة.
            </p>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="bg-cream-deep rounded-3xl p-6">
            <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-2">المشاهدات</div>
            <div class="text-3xl font-bold text-ink tabular-nums">{{ data.stats.count }}</div>
          </div>
          <div class="bg-cream-deep rounded-3xl p-6">
            <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-2">آخر مشاهدة</div>
            <div class="text-sm font-semibold text-ink">{{ data.stats.last_viewed_at ? formatTime(data.stats.last_viewed_at) : '—' }}</div>
          </div>
          <div class="bg-cream-deep rounded-3xl p-6">
            <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-2">القرار</div>
            <div class="text-sm font-semibold text-ink">
              <span v-if="data.proposal.status === 'accepted'">✓ مقبول · {{ formatTime(data.proposal.accepted_at) }}</span>
              <span v-else-if="data.proposal.status === 'declined'">× مرفوض · {{ formatTime(data.proposal.declined_at) }}</span>
              <span v-else class="text-ink-mute">في الانتظار</span>
            </div>
          </div>
        </div>

        <!-- Decline note -->
        <div v-if="data.proposal.decline_note" class="bg-cream-deep rounded-3xl p-6 mb-8">
          <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-2">ملاحظة العميل عند الرفض</div>
          <p class="text-sm text-ink-soft leading-[1.7]">{{ data.proposal.decline_note }}</p>
        </div>

        <!-- Edit form -->
        <div v-if="editing" class="bg-cream-deep rounded-3xl p-6 sm:p-8 mb-8">
          <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-5">تعديل</div>
          <form @submit.prevent="saveEdit" class="space-y-4">
            <AdminProposalField label="العنوان">
              <input v-model="edit.title" class="input" />
            </AdminProposalField>
            <div class="grid grid-cols-2 gap-4">
              <AdminProposalField label="اسم العميل">
                <input v-model="edit.client_name" class="input" />
              </AdminProposalField>
              <AdminProposalField label="تاريخ الاقتراح">
                <input v-model="edit.proposal_date" type="date" class="input" />
              </AdminProposalField>
            </div>
            <AdminProposalField label="بطاقة العميل">
              <input v-model="edit.client_label" class="input" />
            </AdminProposalField>
            <AdminProposalField label="كلمة مرور جديدة (اتركها فارغة للإبقاء على الحالية)">
              <input v-model="edit.password" class="input" />
            </AdminProposalField>
            <AdminProposalField label="تاريخ الانتهاء">
              <input v-model="edit.expiresDate" type="date" class="input" />
            </AdminProposalField>
            <div class="grid grid-cols-2 gap-4">
              <AdminProposalField label="نص زر الإجراء">
                <input v-model="edit.cta_label" class="input" />
              </AdminProposalField>
              <AdminProposalField label="رابط زر الإجراء">
                <input v-model="edit.cta_url" class="input" dir="ltr" />
              </AdminProposalField>
            </div>
            <AdminProposalField label="المحتوى (Markdown)">
              <textarea
                v-model="edit.content_md"
                rows="20"
                class="w-full bg-white border border-black/[0.12] focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/15 rounded-2xl px-4 py-3 text-[13px] text-ink outline-none transition-all font-mono leading-[1.7] resize-y"
              ></textarea>
            </AdminProposalField>
            <div v-if="editError" class="bg-red-50 text-red-700 rounded-2xl p-4 text-sm">{{ editError }}</div>
            <div class="flex gap-3 pt-2">
              <button
                type="submit"
                :disabled="savingEdit"
                class="bg-ink text-white rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {{ savingEdit ? 'جارٍ الحفظ…' : 'حفظ التعديلات' }}
              </button>
              <button
                type="button"
                @click="editing = false"
                class="bg-white border border-black/[0.12] text-ink rounded-full px-6 py-3 text-sm font-semibold"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>

        <!-- View log -->
        <section v-if="data.views.length">
          <h2 class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-4">سجل المشاهدات</h2>
          <ul class="bg-cream-deep rounded-3xl overflow-hidden">
            <li
              v-for="(v, i) in data.views"
              :key="i"
              class="px-6 py-3 flex items-center justify-between text-[13px] border-b border-black/[0.04] last:border-0"
            >
              <span class="text-ink font-semibold" dir="ltr">{{ formatTime(v.viewed_at) }}</span>
              <span class="text-ink-mute text-[12px] truncate ms-4">{{ v.user_agent || '—' }}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

const route = useRoute()
const id = computed(() => String(route.params.id))

interface Response {
  proposal: {
    id: number
    slug: string
    title: string
    client_name: string
    client_label: string | null
    proposal_date: string
    content_md: string
    cta_label: string | null
    cta_url: string | null
    status: string
    expires_at: number | null
    accepted_at: number | null
    declined_at: number | null
    decline_note: string | null
    created_at: number
    updated_at: number
  }
  views: Array<{ viewed_at: number; user_agent: string | null }>
  stats: { count: number; last_viewed_at: number | null }
}

const { data, pending, error: fetchError, refresh } = await useFetch<Response>(`/api/admin/proposals/${id.value}`, { lazy: true })
const error = computed(() => fetchError.value ? 'تعذّر تحميل الاقتراح' : '')

const editing = ref(false)
const savingEdit = ref(false)
const editError = ref('')
const sending = ref(false)
const copied = ref<string>('')
const passwordRevealed = ref(false)
const newPassword = ref('')

const edit = reactive({
  title: '',
  client_name: '',
  client_label: '',
  proposal_date: '',
  password: '',
  expiresDate: '',
  cta_label: '',
  cta_url: '',
  content_md: ''
})

watch(data, (d) => {
  if (!d) return
  const p = d.proposal
  edit.title = p.title
  edit.client_name = p.client_name
  edit.client_label = p.client_label || ''
  edit.proposal_date = p.proposal_date
  edit.cta_label = p.cta_label || ''
  edit.cta_url = p.cta_url || ''
  edit.content_md = p.content_md
  edit.expiresDate = p.expires_at ? new Date(p.expires_at).toISOString().slice(0, 10) : ''
}, { immediate: true })

const publicUrl = computed(() => {
  const origin = process.client ? window.location.origin : 'https://sufyanfa.com'
  return data.value ? `${origin}/p/${data.value.proposal.slug}` : ''
})

function formatTime(t: number | null | undefined) {
  if (!t) return '—'
  return new Date(t).toLocaleString('en-CA', { hour12: false }).replace(',', '')
}

async function copy(text: string, key: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = key
    setTimeout(() => { if (copied.value === key) copied.value = '' }, 2000)
  } catch {}
}

async function send() {
  if (!data.value) return
  sending.value = true
  try {
    await $fetch(`/api/admin/proposals/${data.value.proposal.id}/send`, { method: 'POST' })
    await refresh()
  } catch {} finally { sending.value = false }
}

async function saveEdit() {
  if (!data.value) return
  editError.value = ''
  savingEdit.value = true
  try {
    const body: Record<string, unknown> = {
      title: edit.title,
      client_name: edit.client_name,
      client_label: edit.client_label || null,
      proposal_date: edit.proposal_date,
      cta_label: edit.cta_label || null,
      cta_url: edit.cta_url || null,
      content_md: edit.content_md,
      expires_at: edit.expiresDate ? new Date(edit.expiresDate).getTime() : null
    }
    if (edit.password) {
      body.password = edit.password
      newPassword.value = edit.password
      passwordRevealed.value = true
    }
    await $fetch(`/api/admin/proposals/${data.value.proposal.id}`, { method: 'PATCH', body })
    edit.password = ''
    editing.value = false
    await refresh()
  } catch (e: any) {
    editError.value = e?.statusMessage || 'فشل الحفظ'
  } finally {
    savingEdit.value = false
  }
}

async function confirmDelete() {
  if (!data.value) return
  if (!confirm(`حذف الاقتراح "${data.value.proposal.title}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) return
  try {
    await $fetch(`/api/admin/proposals/${data.value.proposal.id}`, { method: 'DELETE' })
    await navigateTo('/admin/proposals')
  } catch {}
}

useHead({
  title: () => data.value ? `${data.value.proposal.title} · لوحة التحكم` : 'اقتراح',
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
