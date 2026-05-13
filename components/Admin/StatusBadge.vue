<template>
  <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold', cls]">
    <span :class="['w-1.5 h-1.5 rounded-full', dot]"></span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ status: string }>()

const config: Record<string, { label: string; cls: string; dot: string }> = {
  draft:    { label: 'مسوّدة',  cls: 'bg-black/[0.06] text-ink-soft',          dot: 'bg-ink-mute/50' },
  sent:     { label: 'مُرسل',    cls: 'bg-black/[0.06] text-ink-soft',          dot: 'bg-ink-mute' },
  viewed:   { label: 'مُشاهَد',   cls: 'bg-[#15803D]/10 text-[#15803D]',         dot: 'bg-[#15803D]' },
  accepted: { label: 'مقبول',    cls: 'bg-[#15803D]/10 text-[#15803D]',         dot: 'bg-[#15803D]' },
  declined: { label: 'مرفوض',    cls: 'bg-red-50 text-red-700',                 dot: 'bg-red-500' },
  expired:  { label: 'منتهٍ',     cls: 'bg-black/[0.04] text-ink-mute',          dot: 'bg-ink-mute/40' }
}

const label = computed(() => config[props.status]?.label ?? props.status)
const cls = computed(() => config[props.status]?.cls ?? 'bg-black/[0.06] text-ink-soft')
const dot = computed(() => config[props.status]?.dot ?? 'bg-ink-mute')
</script>
