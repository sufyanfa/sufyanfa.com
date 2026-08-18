<template>
  <main>
    <article class="bg-white">
      <div class="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
        <div
          class="prose prose-neutral max-w-none prose-headings:text-ink prose-headings:font-bold prose-p:text-ink-soft prose-pre:bg-ink prose-pre:text-white prose-img:rounded-2xl prose-img:ring-1 prose-img:ring-black/5 prose-a:text-ink prose-a:underline hover:prose-a:opacity-70"
        >
          <ContentDoc v-slot="{ doc }" tag="div">
            <h1 class="!mb-4">{{ doc.title }}</h1>
            <ContentRenderer :value="doc" />
          </ContentDoc>
        </div>
      </div>
    </article>
    <HomeFinalCTA />
  </main>
</template>

<script setup>
const route = useRoute();
const { url } = route.params;
useSeoMeta({
  ogImage: `https://sufyanfa.com/preview.png`,
  twitterCard: "summary_large_image",
});
</script>

<style>
.prose h2 a,
.prose h3 a {
  @apply no-underline;
}
</style>
