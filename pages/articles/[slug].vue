<template>
  <main>
    <article class="bg-white">
      <div class="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
        <div
          class="prose prose-neutral max-w-none prose-headings:text-ink prose-headings:font-bold prose-p:text-ink-soft prose-blockquote:not-italic prose-blockquote:border-r-4 prose-blockquote:border-l-0 prose-blockquote:border-forest prose-blockquote:pr-4 prose-blockquote:pl-0 prose-pre:bg-ink prose-pre:text-white prose-img:rounded-2xl prose-img:ring-1 prose-img:ring-black/5 prose-a:text-forest prose-a:no-underline hover:prose-a:underline"
        >
          <ContentDoc v-slot="{ doc }" tag="div">
            <h1 class="!mb-4">{{ doc.title }}</h1>
            <ContentRenderer :value="doc" />
            <AppSocialShare :title="doc.title" class="mt-12" />
          </ContentDoc>
        </div>
      </div>
    </article>
    <HomeFinalCTA />
  </main>
</template>

<script setup>
const route = useRoute();
const { slug } = route.params;
useSeoMeta({
  ogImage: `https://sufyanfa.com/articles/${slug}.jpg`,
  twitterCard: "summary_large_image",
  articleAuthor: "Sufyan Farea",
});
</script>

<style>
.prose h2 a,
.prose h3 a {
  @apply no-underline;
}
</style>
