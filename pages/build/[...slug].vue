<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="mb-8">
      <nav class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <NuxtLink to="/build" class="hover:text-gray-700 dark:hover:text-gray-200">Build</NuxtLink>
        <span>/</span>
        <span class="text-gray-900 dark:text-white">{{ projectName }}</span>
      </nav>
      
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ doc?.title || formatTitle(projectName) }}
      </h1>
      
      <div v-if="projectPages && projectPages.length > 1" class="flex flex-wrap gap-2">
        <NuxtLink 
          v-for="page in projectPages"
          :key="page._path"
          :to="page._path"
          class="px-3 py-1 text-sm rounded-full border transition-colors"
          :class="currentPath === page._path 
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'"
        >
          {{ formatPageName(page._path) }}
        </NuxtLink>
      </div>
    </div>

    <div v-if="doc" class="prose prose-gray dark:prose-invert max-w-none">
      <ContentRenderer :value="doc" />
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Content not found</p>
      <NuxtLink to="/build" class="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
        ← Back to Build Projects
      </NuxtLink>
    </div>

    <div v-if="projectPages && projectPages.length > 1" class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Other Pages</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NuxtLink 
          v-for="page in projectPages.filter(p => p._path !== currentPath)"
          :key="page._path"
          :to="page._path"
          class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <h4 class="font-medium text-gray-900 dark:text-white">
            {{ formatPageName(page._path) }}
          </h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ page.description || 'Documentation page' }}
          </p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const currentPath = `/build/${route.params.slug.join('/')}`
const projectName = route.params.slug[0]

// Get the current document
const { data: doc } = await useAsyncData(`build-${currentPath}`, () => 
  queryContent(currentPath).findOne()
)

// Get all pages in the current project
const { data: projectPages } = await useAsyncData(`build-project-${projectName}`, () => 
  queryContent(`/build/${projectName}`).find()
)

function formatTitle(title) {
  return title.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatPageName(path) {
  const parts = path.split('/')
  const filename = parts[parts.length - 1]
  return filename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

useSeoMeta({
  title: doc.value?.title || formatTitle(projectName),
  description: doc.value?.description || `Documentation for ${formatTitle(projectName)} project`
})
</script>