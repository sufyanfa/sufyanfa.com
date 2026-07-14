<script setup lang="ts">
import { renderMarkdown } from '~/composables/useMarkdown'

definePageMeta({ layout: 'bare' })

const route = useRoute()
const slug = route.params.slug as string

interface DoneData {
  project: { name: string; slug: string }
  customer: { name: string }
  completion_md: string
  settings: { business_name: string; logo_url: string | null }
}

const { data, error } = await useFetch<DoneData>(`/api/done/${slug}`)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'الصفحة غير موجودة', fatal: true })
}

const renderedBody = computed(() => data.value ? renderMarkdown(data.value.completion_md) : '')

useHead(() => ({
  title: data.value ? `${data.value.project.name} — اكتمال المشروع` : 'اكتمال المشروع',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
}))

function printIt() { window.print() }
</script>

<template>
  <div v-if="data" class="min-h-screen bg-cream py-10 px-4">
    <article class="completion mx-auto max-w-3xl bg-white rounded-2xl border border-black/10 p-8 sm:p-10">
      <header class="text-center mb-10 pb-8 border-b border-black/10">
        <img v-if="data.settings.logo_url" :src="data.settings.logo_url" alt="" class="h-8 w-auto mx-auto mb-6" />
        <div v-else class="text-lg font-bold mb-6">{{ data.settings.business_name }}</div>
        <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-4">
          <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
          تم إنجاز المشروع
        </div>
        <h1 class="text-2xl font-bold">{{ data.project.name }}</h1>
        <p class="text-sm text-gray-600 mt-1">{{ data.customer.name }}</p>
      </header>

      <div class="completion-prose text-ink-soft text-[15px] leading-[1.85]" v-html="renderedBody"></div>
    </article>

    <div class="max-w-3xl mx-auto mt-6 text-center no-print">
      <button @click="printIt" class="px-5 py-2 bg-black text-white rounded-lg text-sm">اطبع / احفظ PDF</button>
    </div>
  </div>
</template>

<style>
@media print {
  @page { size: A4; margin: 16mm; }
  body { background: white !important; }
  .no-print { display: none !important; }
  .completion { box-shadow: none !important; border: none !important; }
  a { color: inherit; text-decoration: none; }
}

.completion-prose {
  font-feature-settings: "tnum" 1, "ss01" 1;
}
.completion-prose h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.03em;
  line-height: 1.25;
  margin: 0 0 1rem;
}
.completion-prose h2 {
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
.completion-prose > h2:first-child,
.completion-prose > hr + h2 {
  margin-top: 0.5rem;
  padding-top: 0;
  border-top: 0;
}
.completion-prose h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.02em;
  margin-top: 2rem;
  margin-bottom: 0.625rem;
}
.completion-prose h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #000;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
.completion-prose p {
  margin-bottom: 1.15rem;
  color: #424245;
}
.completion-prose strong { color: #000; font-weight: 700; }
.completion-prose em { color: #000; font-style: italic; }
.completion-prose a {
  color: #15803D;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
  transition: opacity 0.15s;
}
.completion-prose a:hover { opacity: 0.7; }
.completion-prose blockquote {
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
.completion-prose blockquote p { margin: 0.25rem 0; }
.completion-prose blockquote p:first-child { margin-top: 0; }
.completion-prose blockquote p:last-child { margin-bottom: 0; }
.completion-prose blockquote strong { color: #000; font-weight: 600; }
.completion-prose ul {
  list-style: none;
  margin: 1.25rem 0;
  padding-inline-start: 0;
}
.completion-prose ul li {
  position: relative;
  padding-inline-start: 1.5rem;
  margin-bottom: 0.625rem;
  color: #424245;
}
.completion-prose ul li::before {
  content: "";
  position: absolute;
  inset-inline-start: 0.375rem;
  top: 0.75rem;
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
  background: #15803D;
}
.completion-prose ol {
  list-style: decimal;
  margin: 1.25rem 0;
  padding-inline-start: 1.75rem;
}
.completion-prose ol li {
  margin-bottom: 0.625rem;
  color: #424245;
  padding-inline-start: 0.375rem;
}
.completion-prose ol li::marker {
  color: #6E6E73;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.completion-prose table {
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
.completion-prose thead { background: #F5F5F7; }
.completion-prose thead th {
  font-weight: 600;
  color: #000;
  text-align: start;
  padding: 0.875rem 1.125rem;
  font-size: 0.8125rem;
  letter-spacing: 0.01em;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.completion-prose tbody td {
  padding: 1rem 1.125rem;
  color: #424245;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  vertical-align: top;
  line-height: 1.65;
}
.completion-prose tbody tr:last-child td { border-bottom: 0; }
.completion-prose tbody tr td:first-child {
  color: #000;
  font-weight: 500;
  width: 38%;
}
.completion-prose tbody td strong { color: #000; font-weight: 700; }
.completion-prose hr {
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
.completion-prose code {
  background: #F5F5F7;
  padding: 0.15rem 0.4rem;
  border-radius: 0.5rem;
  font-size: 0.875em;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: #000;
}
.completion-prose pre {
  background: #1D1D1F;
  color: #F5F5F7;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  overflow-x: auto;
  margin: 1.5rem 0;
  font-size: 0.875rem;
  line-height: 1.7;
}
.completion-prose pre code {
  background: transparent;
  padding: 0;
  border-radius: 0;
  color: inherit;
  font-size: inherit;
}
@media (max-width: 640px) {
  .completion-prose h2 { font-size: 1.375rem; margin-top: 2.5rem; padding-top: 1.5rem; }
  .completion-prose blockquote { padding: 1rem 1.125rem; border-radius: 1rem; }
  .completion-prose table { font-size: 0.875rem; }
  .completion-prose thead th { padding: 0.75rem 0.875rem; }
  .completion-prose tbody td { padding: 0.875rem; }
}
</style>
