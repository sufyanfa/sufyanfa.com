<template>
  <button type="button" class="group block text-right w-full" @click="emit('open', project)">
    <!-- Project Thumbnail Box -->
    <div
      class="relative aspect-[16/10] rounded-[20px] overflow-hidden bg-cream-deep border border-black/[0.05] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] mb-4 transition-all duration-300 group-hover:border-black/[0.12] group-hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.08)]"
    >
      <NuxtImg
        v-if="project.thumbnail"
        :src="project.thumbnail"
        :alt="project.name"
        class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
        sizes="480px sm:600px"
        format="webp"
        loading="lazy"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center p-8 bg-cream-deep transition-transform duration-500 group-hover:scale-[1.03]"
      >
        <span class="text-2xl sm:text-3xl font-bold text-ink/70 select-none">
          {{ project.name }}
        </span>
      </div>

      <!-- Live status badge (Monochrome) -->
      <span
        v-if="project.status === 'live'"
        class="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md rounded-full px-3 py-1 text-[11px] font-semibold text-ink inline-flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-black/[0.04]"
      >
        <span>LIVE</span>
        <span class="w-1.5 h-1.5 rounded-full bg-ink"></span>
      </span>
    </div>

    <!-- Project Meta & Info -->
    <div class="px-1">
      <div class="flex items-center justify-between gap-4 mb-2">
        <h3 class="text-lg sm:text-[19px] font-bold text-ink group-hover:text-black transition-colors">
          {{ project.name }}
        </h3>
        <span class="text-xs font-semibold text-ink-mute font-mono">
          #{{ project.role ?? 'مشروع' }}
        </span>
      </div>

      <p class="text-[14px] text-ink-soft leading-[1.7] line-clamp-2 mb-3">
        {{ project.outcome ?? project.tagline }}
      </p>

      <div v-if="project.services?.length" class="flex flex-wrap gap-1.5 mb-3">
        <span
          v-for="service in project.services"
          :key="service"
          class="text-[11px] font-medium text-ink-soft bg-cream-deep rounded-full px-2.5 py-1"
        >
          {{ service }}
        </span>
      </div>

      <div class="inline-flex items-center gap-1 text-xs font-semibold text-ink group-hover:opacity-70 transition-opacity">
        <span>عرض المشروع</span>
        <Icon name="lucide:arrow-left" class="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    project: {
      name: string;
      url: string;
      tagline?: string;
      outcome?: string;
      role?: string;
      year?: string;
      status?: string;
      tone?: string;
      thumbnail?: string;
      services?: string[];
      result?: string;
      gallery?: string[];
    };
    index?: number;
  }>(),
  {
    index: 0,
  }
);

const emit = defineEmits<{
  open: [project: unknown];
}>();
</script>
