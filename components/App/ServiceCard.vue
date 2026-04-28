<template>
  <article
    class="flex flex-col rounded-3xl bg-white border border-black/[0.04] p-7 sm:p-8 h-full"
  >
    <span
      class="self-start rounded-full px-3 py-1 text-[11px] font-semibold mb-5 bg-cream text-ink"
    >
      {{ service.order }} - {{ service.tag }}
    </span>

    <h3 class="text-xl font-bold text-ink leading-tight mb-2.5">{{ service.name }}</h3>
    <p class="text-sm text-ink-soft leading-relaxed mb-6">{{ service.tagline }}</p>

    <div
      v-if="service.deliverables?.length"
      class="text-[11px] font-semibold tracking-[0.08em] uppercase text-ink-mute mb-3"
    >
      ما ستحصل عليه
    </div>
    <ul class="space-y-2 text-[13px] text-ink leading-relaxed mb-6">
      <li v-for="item in service.deliverables" :key="item" class="flex gap-2">
        <span class="text-success font-bold">✓</span>
        <span>{{ item }}</span>
      </li>
    </ul>

    <div
      class="mt-auto flex items-center justify-between pt-5 border-t border-dashed border-gray-200"
    >
      <span class="text-[13px] text-ink-mute">{{ service.timing }}</span>

      <button
        v-if="service.linkType === 'modal'"
        type="button"
        class="text-[13px] font-semibold text-ink hover:underline inline-flex items-center gap-1.5"
        @click="$emit('inquiry', service)"
      >
        {{ ctaLabel }}
        <span class="text-xs">←</span>
      </button>

      <NuxtLink
        v-else
        :to="service.linkType === 'external' ? service.linkUrl : service.url"
        :target="service.linkType === 'external' ? '_blank' : undefined"
        :external="service.linkType === 'external' || undefined"
        class="text-[13px] font-semibold text-ink hover:underline inline-flex items-center gap-1.5"
      >
        {{ ctaLabel }}
        <span class="text-xs">←</span>
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
type Service = {
  name: string;
  tagline?: string;
  description?: string;
  url: string;
  order: string;
  tag?: string;
  deliverables?: string[];
  timing?: string;
  cta?: string;
  linkType?: "modal" | "external" | "internal";
  linkUrl?: string;
  inquiryService?: string;
  inquiryPlaceholder?: string;
};

const props = defineProps<{ service: Service }>();

defineEmits<{
  inquiry: [service: Service];
}>();

const ctaLabel = computed(() => props.service.cta ?? "اعرف أكثر");
</script>
