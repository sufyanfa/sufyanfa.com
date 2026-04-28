<template>
  <NuxtLink
    :to="project.url"
    target="_blank"
    external
    class="group rounded-3xl p-7 sm:p-8 h-full flex flex-col transition-transform hover:-translate-y-0.5"
    :class="project.tone === 'lavender' ? 'bg-forest-soft' : 'bg-cream'"
  >
    <header class="flex justify-between items-start mb-4">
      <span
        class="text-[11px] font-semibold tracking-[0.1em] uppercase"
        :class="project.tone === 'lavender' ? 'text-forest' : 'text-ink-soft'"
      >
        {{ project.role }} · {{ project.year }}
      </span>
      <span
        v-if="project.status === 'live'"
        class="text-[11px] font-semibold text-success inline-flex items-center gap-1.5"
      >
        حيّ <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
      </span>
    </header>

    <h3 class="text-xl sm:text-[22px] font-bold text-ink leading-tight tracking-tight mb-2.5">
      {{ project.name }}
    </h3>
    <p class="text-sm text-ink-soft leading-relaxed mb-5 flex-1">{{ project.outcome }}</p>

    <div
      class="self-start inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/60 group-hover:bg-ink group-hover:text-white text-ink transition-colors"
      aria-hidden="true"
    >
      <Icon name="lucide:arrow-up-left" class="w-4 h-4" />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
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
  };
}>();
</script>
