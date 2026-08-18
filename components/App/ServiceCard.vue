<template>
  <article
    class="flex flex-col justify-between rounded-[20px] bg-cream-deep hover:bg-[#ECECED] border border-black/[0.03] p-7 sm:p-8 h-full transition-all duration-300"
  >
    <div>
      <div class="flex items-center justify-between gap-2 mb-5">
        <span
          class="inline-block rounded-full px-3 py-1 text-[11px] font-semibold bg-white text-ink shadow-[0_1px_4px_rgba(0,0,0,0.03)]"
        >
          {{ service.order }} · {{ service.tag }}
        </span>
        <span class="text-xs font-medium text-ink-mute">{{ service.timing }}</span>
      </div>

      <h3 class="text-xl font-bold text-ink leading-snug mb-2.5">{{ service.name }}</h3>
      <p class="text-[14px] text-ink-soft leading-[1.7] mb-6">{{ service.tagline }}</p>

      <div
        v-if="service.deliverables?.length"
        class="text-[11px] font-semibold tracking-wider uppercase text-ink-mute mb-3"
      >
        ما ستحصل عليه:
      </div>
      <ul class="space-y-2 text-[13px] text-ink-soft leading-relaxed mb-6">
        <li v-for="item in service.deliverables" :key="item" class="flex items-start gap-2">
          <span class="text-ink font-bold text-xs mt-0.5">✓</span>
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>

    <div
      class="pt-5 border-t border-black/[0.05] flex items-center justify-between"
    >
      <button
        v-if="service.linkType === 'modal'"
        type="button"
        class="text-[13px] font-semibold text-ink hover:opacity-60 transition-opacity inline-flex items-center gap-1.5"
        @click="$emit('inquiry', service)"
      >
        <span>{{ ctaLabel }}</span>
        <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
      </button>

      <NuxtLink
        v-else
        :to="service.linkType === 'external' ? service.linkUrl : service.url"
        :target="service.linkType === 'external' ? '_blank' : undefined"
        :external="service.linkType === 'external' || undefined"
        class="text-[13px] font-semibold text-ink hover:opacity-60 transition-opacity inline-flex items-center gap-1.5"
      >
        <span>{{ ctaLabel }}</span>
        <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
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
