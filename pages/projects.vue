<template>
  <main class="min-h-screen">
    <AppHeader class="mb-12" title="المشاريع" :description="description" />
    <div class="space-y-4">
      <AppProjectCard
        v-for="(project, id) in projects"
        :key="id"
        :project="project"
      />
    </div>
  </main>
</template>

<script setup>
const description =
  "مجموعة من المشاريع التي ساهمت في تطويرها وإدارتها، تمثل رحلتي في مجالات التطوير والتصميم والتأسيس";
useSeoMeta({
  title: "المشاريع | سفيان فارع",
  description,
});

const { data: projects } = await useAsyncData("projects-all", () =>
  queryContent("/projects").find()
);
</script>
