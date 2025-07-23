<template>
  <NuxtLink
    class="flex gap-4 group p-2 -m-2 rounded-lg"
    :class="{
      'items-center' : $route.path == '/projects',
      'items-end': $route.path !== '/projects',
    }"
    :to="project.url"
    target="_blank"
    external
  >
    <div class="max-w-sm">
      <h3 class="font-medium group-hover:text-primary-600">
        {{ project.name }} <span v-if="$route.path == '/projects'" class="text-gray-500 text-xs">({{ project.role }})</span>
      </h3>
      <p class="text-gray-400 text-sm">{{ project.description }}</p>
      <ul v-if="$route.path == '/projects'" class="mt-2 space-y-1">
        <li v-for="(feature, index) in project.features" :key="index" class="text-xs text-gray-500">
          - {{ feature }}
        </li>
      </ul>
    </div>
    <div
      class="flex-1 border-b border-dashed border-gray-300 dark:border-gray-800 group-hover:border-gray-700"
    ></div>
    <Icon aria-hidden="true" :name="project.icon" class="w-10 h-10" />
  </NuxtLink>
</template>

<script setup>
defineProps({
  project: {
    type: Object,
    required: true,
  },
});
</script>
