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
        <h1 class="text-2xl font-bold text-ink mb-3">العرض غير موجود</h1>
        <p class="text-ink-soft text-sm leading-[1.7]">قد يكون الرابط منتهيًا أو مكتوبًا بشكل خاطئ.</p>
        <NuxtLink to="/" class="inline-block mt-6 text-sm text-ink underline-offset-4 hover:underline">العودة إلى sufyanfa.com</NuxtLink>
      </div>
    </div>

    <!-- Expired -->
    <div v-else-if="status === 'expired'" class="min-h-screen flex items-center justify-center px-6">
      <div class="text-center max-w-md">
        <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-3">انتهت الصلاحية</div>
        <h1 class="text-2xl font-bold text-ink mb-3">هذا العرض لم يعد متاحًا</h1>
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
            عرض خاص
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
            <span>{{ submitting ? 'جارٍ الفتح…' : 'فتح العرض' }}</span>
            <Icon name="lucide:arrow-left" class="w-4 h-4" />
          </button>
        </form>

        <p class="text-center text-[12px] text-ink-mute mt-8">
          عرض من <span class="text-ink font-semibold">سفيان فارع</span> · sufyanfa.com
        </p>
      </div>
    </div>

    <!-- Unlocked -->
    <article v-else-if="status === 'unlocked' && proposal" class="max-w-3xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
      <!-- Header card -->
      <header class="bg-cream-deep rounded-3xl p-8 sm:p-10 mb-10">
        <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
          عرض
        </div>
        <div class="text-[12px] text-ink-soft mb-3">{{ formattedDate }} · {{ proposal.client_name }}</div>
        <h1 class="text-[32px] sm:text-[44px] font-bold text-ink leading-[1.3] tracking-tight">
          {{ proposal.title }}
        </h1>
        <div class="text-[13px] text-ink-mute mt-5 pt-5 border-t border-black/[0.08]">
          عرض من <span class="text-ink font-semibold">سفيان فارع</span>
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
        <h2 class="text-xl font-bold text-ink mb-5">هل توافق على هذا العرض؟</h2>
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="accept"
            :disabled="decisionSubmitting"
            class="inline-flex items-center justify-center gap-2 bg-ink text-white rounded-full px-6 py-3.5 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            <Icon name="lucide:check" class="w-4 h-4" />
            أوافق على العرض
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
          <h2 class="text-xl font-bold text-ink mb-2">تم قبول العرض</h2>
          <p class="text-ink-soft text-sm leading-[1.7]">سأتواصل معك قريبًا للخطوة التالية.</p>
        </div>
        <div v-else class="bg-cream-deep rounded-3xl p-8 text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-black/[0.06] mb-4">
            <Icon name="lucide:x" class="w-6 h-6 text-ink-mute" />
          </div>
          <h2 class="text-xl font-bold text-ink mb-2">تم رفض العرض</h2>
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
  title: () => meta.value?.title ? `${meta.value.title} · عرض` : 'عرض',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

onMounted(loadMeta)
</script>

<style>
.proposal-prose {
  font-feature-settings: "tnum" 1, "ss01" 1;
}

/* H1 in the body is suppressed — the page header already shows the proposal title */
.proposal-prose > h1:first-child { display: none; }
.proposal-prose h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.03em;
  line-height: 1.25;
  margin: 2rem 0 1rem;
}

/* Section heading — hairline + chapter breathing room */
.proposal-prose h2 {
  font-size: 1.625rem;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.03em;
  line-height: 1.3;
  margin-top: 3.25rem;
  padding-top: 1.75rem;
  margin-bottom: 1rem;
  border-top: 1px solid rgba(0,0,0,0.06);
}
.proposal-prose > h2:first-child,
.proposal-prose > hr + h2 {
  margin-top: 0.5rem;
  padding-top: 0;
  border-top: 0;
}

.proposal-prose h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.02em;
  margin-top: 2rem;
  margin-bottom: 0.625rem;
}
.proposal-prose h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #000;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

/* Body paragraph */
.proposal-prose p {
  margin-bottom: 1.15rem;
  color: #424245;
}

/* Inline emphasis */
.proposal-prose strong { color: #000; font-weight: 700; }
.proposal-prose em { color: #000; font-style: italic; }

/* Links */
.proposal-prose a {
  color: #15803D;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
  transition: opacity 0.15s;
}
.proposal-prose a:hover { opacity: 0.7; }

/* Blockquote = editorial info card (no italic, no left bar) */
.proposal-prose blockquote {
  background: #F5F5F7;
  border-radius: 1.25rem;
  padding: 1.25rem 1.5rem;
  margin: 1.5rem 0;
  border: 0;
  font-style: normal;
  font-size: 0.9375rem;
  color: #424245;
  line-height: 1.85;
}
.proposal-prose blockquote p { margin: 0.25rem 0; }
.proposal-prose blockquote p:first-child { margin-top: 0; }
.proposal-prose blockquote p:last-child { margin-bottom: 0; }
.proposal-prose blockquote strong { color: #000; font-weight: 600; }

/* Unordered list — green dot bullets match site pill style */
.proposal-prose ul {
  list-style: none;
  margin: 1.25rem 0;
  padding-inline-start: 0;
}
.proposal-prose ul li {
  position: relative;
  padding-inline-start: 1.5rem;
  margin-bottom: 0.625rem;
  color: #424245;
}
.proposal-prose ul li::before {
  content: "";
  position: absolute;
  inset-inline-start: 0.375rem;
  top: 0.75rem;
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
  background: #15803D;
}

/* Ordered list — tabular markers */
.proposal-prose ol {
  list-style: decimal;
  margin: 1.25rem 0;
  padding-inline-start: 1.75rem;
}
.proposal-prose ol li {
  margin-bottom: 0.625rem;
  color: #424245;
  padding-inline-start: 0.375rem;
}
.proposal-prose ol li::marker {
  color: #6E6E73;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* Table = editorial card */
.proposal-prose table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 1.75rem 0;
  font-size: 0.9375rem;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 1.25rem;
  overflow: hidden;
  background: #fff;
}
.proposal-prose thead { background: #F5F5F7; }
.proposal-prose thead th {
  font-weight: 600;
  color: #000;
  text-align: start;
  padding: 0.875rem 1.125rem;
  font-size: 0.8125rem;
  letter-spacing: 0.01em;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.proposal-prose tbody td {
  padding: 1rem 1.125rem;
  color: #424245;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  vertical-align: top;
  line-height: 1.65;
}
.proposal-prose tbody tr:last-child td { border-bottom: 0; }
.proposal-prose tbody tr td:first-child {
  color: #000;
  font-weight: 500;
  width: 38%;
}
.proposal-prose tbody td strong { color: #000; font-weight: 700; }

/* HR = three-dot ornament */
.proposal-prose hr {
  border: 0;
  margin: 2.75rem auto;
  width: 60px;
  height: 4px;
  background-image:
    radial-gradient(circle, #15803D 50%, transparent 55%),
    radial-gradient(circle, rgba(0,0,0,0.18) 50%, transparent 55%),
    radial-gradient(circle, rgba(0,0,0,0.18) 50%, transparent 55%);
  background-size: 4px 4px;
  background-repeat: no-repeat;
  background-position: 50% 0, 0 0, 100% 0;
  opacity: 0.8;
}

/* Inline code */
.proposal-prose code {
  background: #F5F5F7;
  padding: 0.15rem 0.4rem;
  border-radius: 0.5rem;
  font-size: 0.875em;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: #000;
}

/* Code block */
.proposal-prose pre {
  background: #1D1D1F;
  color: #F5F5F7;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  overflow-x: auto;
  margin: 1.5rem 0;
  font-size: 0.875rem;
  line-height: 1.7;
}
.proposal-prose pre code {
  background: transparent;
  padding: 0;
  border-radius: 0;
  color: inherit;
  font-size: inherit;
}

/* Mobile tightening */
@media (max-width: 640px) {
  .proposal-prose h2 { font-size: 1.375rem; margin-top: 2.5rem; padding-top: 1.5rem; }
  .proposal-prose blockquote { padding: 1rem 1.125rem; border-radius: 1rem; }
  .proposal-prose table { font-size: 0.875rem; }
  .proposal-prose thead th { padding: 0.75rem 0.875rem; }
  .proposal-prose tbody td { padding: 0.875rem; }
}
</style>
