<template>
  <div class="min-h-screen bg-white">
    <!-- Loading -->
    <div v-if="status === 'loading'" class="min-h-screen flex items-center justify-center">
      <div class="text-ink-mute text-sm">…</div>
    </div>

    <!-- Not found -->
    <div v-else-if="status === 'notfound'" class="min-h-screen flex items-center justify-center px-6">
      <div class="text-center max-w-md">
        <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-3">404</div>
        <h1 class="text-2xl font-bold text-ink mb-3">الاقتراح غير موجود</h1>
        <p class="text-ink-soft text-sm leading-[1.7]">قد يكون الرابط منتهيًا أو مكتوبًا بشكل خاطئ.</p>
        <NuxtLink to="/" class="inline-block mt-6 text-sm text-ink underline-offset-4 hover:underline">العودة إلى sufyanfa.com</NuxtLink>
      </div>
    </div>

    <!-- Expired -->
    <div v-else-if="status === 'expired'" class="min-h-screen flex items-center justify-center px-6">
      <div class="text-center max-w-md">
        <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-3">انتهت الصلاحية</div>
        <h1 class="text-2xl font-bold text-ink mb-3">هذا الاقتراح لم يعد متاحًا</h1>
        <p class="text-ink-soft text-sm leading-[1.7]">للحصول على نسخة محدّثة، تواصل معي مباشرة.</p>
        <a href="mailto:hi@sufyanfa.com" class="inline-flex items-center gap-2 mt-6 bg-ink text-white rounded-full px-5 py-2.5 text-sm">
          <Icon name="lucide:mail" class="w-4 h-4" /> hi@sufyanfa.com
        </a>
      </div>
    </div>

    <!-- Locked: password gate -->
    <div v-else-if="status === 'locked'" class="min-h-screen flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-10">
          <NuxtLink to="/" class="inline-block mb-8" aria-label="الصفحة الرئيسية">
            <img src="/logo.svg" alt="سفيان فارع" class="h-7 w-auto mx-auto" />
          </NuxtLink>
          <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-5">
            <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
            اقتراح خاص
          </div>
          <h1 class="text-[26px] sm:text-[32px] font-bold text-ink leading-[1.3] tracking-tight mb-3">{{ meta?.title }}</h1>
          <p v-if="meta?.client_label" class="text-ink-soft text-sm">{{ meta.client_label }} · {{ formattedDate }}</p>
          <p v-else class="text-ink-soft text-sm">{{ meta?.client_name }} · {{ formattedDate }}</p>
        </div>

        <form @submit.prevent="unlock" class="bg-cream-deep rounded-3xl p-6 sm:p-8">
          <label class="block text-[12px] font-semibold text-ink mb-2">كلمة المرور</label>
          <input
            v-model="password"
            type="password"
            autocomplete="off"
            :disabled="submitting"
            placeholder="••••••••"
            class="w-full bg-white border border-black/[0.12] focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/15 rounded-2xl px-4 py-3 text-sm text-ink outline-none transition-all"
          />
          <p v-if="unlockError" class="text-[13px] text-red-600 mt-3">{{ unlockError }}</p>
          <button
            type="submit"
            :disabled="submitting || !password"
            class="w-full mt-5 bg-ink text-white rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
          >
            <span>{{ submitting ? 'جارٍ الفتح…' : 'فتح الاقتراح' }}</span>
            <Icon name="lucide:arrow-left" class="w-4 h-4" />
          </button>
        </form>

        <p class="text-center text-[12px] text-ink-mute mt-8">
          اقتراح من <span class="text-ink font-semibold">سفيان فارع</span> · sufyanfa.com
        </p>
      </div>
    </div>

    <!-- Unlocked -->
    <article v-else-if="status === 'unlocked' && proposal" class="max-w-3xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
      <!-- Header card -->
      <header class="bg-cream-deep rounded-3xl p-8 sm:p-10 mb-10">
        <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
          اقتراح
        </div>
        <div class="text-[12px] text-ink-soft mb-3">{{ formattedDate }} · {{ proposal.client_name }}</div>
        <h1 class="text-[32px] sm:text-[44px] font-bold text-ink leading-[1.3] tracking-tight">
          {{ proposal.title }}
        </h1>
        <div class="text-[13px] text-ink-mute mt-5 pt-5 border-t border-black/[0.08]">
          اقتراح من <span class="text-ink font-semibold">سفيان فارع</span>
        </div>
      </header>

      <!-- Markdown body -->
      <div
        class="proposal-prose text-ink-soft text-[15px] sm:text-[16px] leading-[1.85]"
        v-html="renderedBody"
      ></div>

      <!-- CTA block -->
      <div v-if="proposal.cta_label && proposal.cta_url" class="mt-14 pt-10 border-t border-black/[0.08]">
        <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-4">
          <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
          الخطوة التالية
        </div>
        <a
          :href="proposal.cta_url"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 bg-ink text-white rounded-full px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {{ proposal.cta_label }}
          <Icon name="lucide:arrow-left" class="w-4 h-4" />
        </a>
      </div>

      <!-- Decision card -->
      <div v-if="!decisionMade" class="mt-14 pt-10 border-t border-black/[0.08]">
        <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-4">
          <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
          قرارك
        </div>
        <h2 class="text-xl font-bold text-ink mb-5">هل توافق على هذا الاقتراح؟</h2>
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="accept"
            :disabled="decisionSubmitting"
            class="inline-flex items-center justify-center gap-2 bg-ink text-white rounded-full px-6 py-3.5 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            <Icon name="lucide:check" class="w-4 h-4" />
            أوافق على الاقتراح
          </button>
          <button
            @click="declineOpen = true"
            :disabled="decisionSubmitting"
            class="inline-flex items-center justify-center gap-2 bg-white border border-black/[0.12] text-ink rounded-full px-6 py-3.5 text-sm font-semibold disabled:opacity-50 hover:bg-cream-deep transition-colors"
          >
            <Icon name="lucide:x" class="w-4 h-4" />
            غير مهتم
          </button>
        </div>

        <!-- Decline note dialog -->
        <div v-if="declineOpen" class="mt-5 bg-cream-deep rounded-3xl p-6">
          <label class="block text-[12px] font-semibold text-ink mb-2">سبب الرفض (اختياري)</label>
          <textarea
            v-model="declineNote"
            rows="3"
            placeholder="ملاحظاتك للاطلاع عليها لاحقًا…"
            class="w-full bg-white border border-black/[0.12] focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/15 rounded-2xl px-4 py-3 text-sm text-ink outline-none transition-all resize-none"
          ></textarea>
          <div class="flex gap-3 mt-4">
            <button
              @click="decline"
              :disabled="decisionSubmitting"
              class="bg-ink text-white rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              تأكيد الرفض
            </button>
            <button
              @click="declineOpen = false; declineNote = ''"
              :disabled="decisionSubmitting"
              class="bg-white border border-black/[0.12] text-ink rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>

      <!-- Post-decision state -->
      <div v-else class="mt-14 pt-10 border-t border-black/[0.08]">
        <div v-if="currentStatus === 'accepted'" class="bg-cream-deep rounded-3xl p-8 text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#15803D]/10 mb-4">
            <Icon name="lucide:check" class="w-6 h-6 text-[#15803D]" />
          </div>
          <h2 class="text-xl font-bold text-ink mb-2">تم قبول الاقتراح</h2>
          <p class="text-ink-soft text-sm leading-[1.7]">سأتواصل معك قريبًا للخطوة التالية.</p>
        </div>
        <div v-else class="bg-cream-deep rounded-3xl p-8 text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-black/[0.06] mb-4">
            <Icon name="lucide:x" class="w-6 h-6 text-ink-mute" />
          </div>
          <h2 class="text-xl font-bold text-ink mb-2">تم رفض الاقتراح</h2>
          <p class="text-ink-soft text-sm leading-[1.7]">شكرًا لوقتك. أتمنى لك التوفيق.</p>
        </div>
      </div>

      <!-- Footer -->
      <footer class="mt-16 pt-8 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-ink-mute">
        <NuxtLink to="/" class="hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="سفيان فارع" class="h-6 w-auto" />
        </NuxtLink>
        <span>© {{ new Date().getFullYear() }} · sufyanfa.com</span>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import { renderMarkdown } from '~/composables/useMarkdown'

definePageMeta({ layout: 'bare' })

const route = useRoute()
const slug = computed(() => String(route.params.slug))

type Status = 'loading' | 'locked' | 'unlocked' | 'notfound' | 'expired'
const status = ref<Status>('loading')

interface Meta {
  title: string
  client_name: string
  client_label: string | null
  proposal_date: string
  expired: boolean
  decided: boolean
  status: string
}
const meta = ref<Meta | null>(null)

interface Proposal {
  slug: string
  title: string
  client_name: string
  client_label: string | null
  proposal_date: string
  content_md: string
  cta_label: string | null
  cta_url: string | null
  status: string
  accepted_at: number | null
  declined_at: number | null
  decline_note: string | null
}
const proposal = ref<Proposal | null>(null)

const password = ref('')
const unlockError = ref('')
const submitting = ref(false)

const declineOpen = ref(false)
const declineNote = ref('')
const decisionSubmitting = ref(false)
const localDecision = ref<'accepted' | 'declined' | null>(null)

const currentStatus = computed(() => localDecision.value || proposal.value?.status)
const decisionMade = computed(() => currentStatus.value === 'accepted' || currentStatus.value === 'declined')

const formattedDate = computed(() => {
  const d = meta.value?.proposal_date || proposal.value?.proposal_date
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return d
  }
})

const renderedBody = computed(() => proposal.value ? renderMarkdown(proposal.value.content_md) : '')

async function loadMeta() {
  try {
    const m = await $fetch<Meta>(`/api/proposals/${slug.value}/meta`)
    meta.value = m
    if (m.expired) { status.value = 'expired'; return }
    // Try fetching the full proposal — if view cookie is valid we get it; otherwise 401
    try {
      const p = await $fetch<Proposal>(`/api/proposals/${slug.value}`)
      proposal.value = p
      status.value = 'unlocked'
    } catch {
      status.value = 'locked'
    }
  } catch (e: any) {
    if (e?.statusCode === 410) status.value = 'expired'
    else status.value = 'notfound'
  }
}

async function unlock() {
  unlockError.value = ''
  submitting.value = true
  try {
    await $fetch(`/api/proposals/${slug.value}/unlock`, {
      method: 'POST',
      body: { password: password.value }
    })
    const p = await $fetch<Proposal>(`/api/proposals/${slug.value}`)
    proposal.value = p
    status.value = 'unlocked'
    password.value = ''
  } catch (e: any) {
    if (e?.statusCode === 429) unlockError.value = 'محاولات كثيرة. حاول مرة أخرى لاحقًا.'
    else if (e?.statusCode === 410) { status.value = 'expired' }
    else if (e?.statusCode === 401) unlockError.value = 'كلمة المرور غير صحيحة'
    else unlockError.value = 'حدث خطأ. حاول مرة أخرى.'
  } finally {
    submitting.value = false
  }
}

async function accept() {
  decisionSubmitting.value = true
  try {
    await $fetch(`/api/proposals/${slug.value}/accept`, { method: 'POST' })
    localDecision.value = 'accepted'
  } catch {
    // silent — keep buttons visible
  } finally {
    decisionSubmitting.value = false
  }
}

async function decline() {
  decisionSubmitting.value = true
  try {
    await $fetch(`/api/proposals/${slug.value}/decline`, { method: 'POST', body: { note: declineNote.value || undefined } })
    localDecision.value = 'declined'
    declineOpen.value = false
  } catch {
    // silent
  } finally {
    decisionSubmitting.value = false
  }
}

useHead({
  title: () => meta.value?.title ? `${meta.value.title} · اقتراح` : 'اقتراح',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

onMounted(loadMeta)
</script>

<style>
.proposal-prose h1, .proposal-prose h2, .proposal-prose h3, .proposal-prose h4 {
  color: #000;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}
.proposal-prose h1 { font-size: 1.875rem; }
.proposal-prose h2 { font-size: 1.5rem; }
.proposal-prose h3 { font-size: 1.25rem; }
.proposal-prose h4 { font-size: 1.125rem; }
.proposal-prose p { margin-bottom: 1.25rem; }
.proposal-prose strong { color: #000; font-weight: 700; }
.proposal-prose a { color: #15803D; text-decoration: underline; text-underline-offset: 3px; }
.proposal-prose ul, .proposal-prose ol { margin: 1.25rem 0; padding-inline-start: 1.5rem; }
.proposal-prose li { margin-bottom: 0.5rem; }
.proposal-prose ul { list-style: disc; }
.proposal-prose ol { list-style: decimal; }
.proposal-prose blockquote {
  border-inline-start: 3px solid #15803D;
  padding: 0.5rem 1.25rem;
  margin: 1.5rem 0;
  background: #F5F5F7;
  border-radius: 12px;
  font-style: italic;
}
.proposal-prose table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95em; }
.proposal-prose thead { background: #F5F5F7; }
.proposal-prose th, .proposal-prose td { padding: 0.75rem 1rem; border: 1px solid rgba(0,0,0,0.08); text-align: start; }
.proposal-prose th { font-weight: 600; color: #000; }
.proposal-prose hr { border: 0; border-top: 1px solid rgba(0,0,0,0.08); margin: 2rem 0; }
.proposal-prose code {
  background: #F5F5F7;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  font-size: 0.9em;
  font-family: ui-monospace, SFMono-Regular, monospace;
}
</style>
