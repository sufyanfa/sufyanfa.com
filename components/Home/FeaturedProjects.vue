<template>
  <section class="bg-gray-50 border-y border-black/[0.04]">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-20 sm:py-24">
      <div class="text-center mb-12">
        <AppEyebrow tone="sage" class="mb-6">المشاريع</AppEyebrow>
        <h2
          class="font-extrabold text-ink leading-tight tracking-h2 text-[28px] sm:text-[36px] lg:text-[38px]"
        >
          أعمال مختارة
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppProjectCard
          v-for="(project, i) in projects"
          :key="i"
          :project="(project as any)"
        />
      </div>

      <div class="mt-10 text-center">
        <NuxtLink to="/projects" class="text-sm font-semibold text-ink hover:underline">
          كل المشاريع ←
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: projects } = await useAsyncData("projects-home", () =>
  queryContent("/projects").sort({ order: 1 }).limit(4).find()
);
</script>
