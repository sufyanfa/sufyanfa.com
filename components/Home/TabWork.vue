<template>
  <div>
    <div
      class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-6"
    >
      مختارة
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <AppProjectCard
        v-for="(project, i) in projects"
        :key="i"
        :project="(project as any)"
      />
    </div>

    <div class="mt-10 text-center">
      <NuxtLink
        to="/projects"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:opacity-60 transition-opacity"
      >
        كل المشاريع
        <span class="text-xs">←</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: projects } = await useAsyncData("home-tab-projects", () =>
  queryContent("/projects").sort({ order: 1 }).limit(4).find()
);
</script>
