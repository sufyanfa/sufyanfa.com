<template>
  <main>
    <article class="bg-white">
      <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div
          class="max-w-3xl mx-auto prose prose-neutral max-w-none prose-headings:text-ink prose-headings:font-bold prose-p:text-ink-soft prose-blockquote:not-italic prose-blockquote:border-r-4 prose-blockquote:border-l-0 prose-blockquote:border-ink prose-blockquote:pr-4 prose-blockquote:pl-0 prose-pre:bg-ink prose-pre:text-white prose-img:rounded-2xl prose-img:ring-1 prose-img:ring-black/5 prose-a:text-ink prose-a:underline hover:prose-a:opacity-70"
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

const { data: article } = await useAsyncData(`article-${slug}`, () =>
  queryContent("/articles").where({ _path: `/articles/${slug}` }).findOne()
);

const url = `https://sufyanfa.com/articles/${slug}`;
const ogImage = `https://sufyanfa.com/articles/${slug}.jpg`;
const title = article.value?.title
  ? `${article.value.title} | سفيان فارع`
  : "مقال | سفيان فارع";
const description = article.value?.description ?? "";
const published = article.value?.published
  ? new Date(article.value.published).toISOString()
  : undefined;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: url,
  ogImage,
  ogType: "article",
  ogLocale: "ar_SA",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: ogImage,
  twitterSite: "@sufyanfa",
  twitterCreator: "@sufyanfa",
  articleAuthor: "Sufyan Farea",
  articlePublishedTime: published,
});

useHead({
  link: [{ rel: "canonical", href: url }],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.value?.title,
        description,
        datePublished: published,
        author: {
          "@type": "Person",
          name: "سفيان فارع",
          url: "https://sufyanfa.com",
        },
        publisher: {
          "@type": "Person",
          name: "سفيان فارع",
          url: "https://sufyanfa.com",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        image: ogImage,
      }),
    },
  ],
});
</script>

<style>
.prose h2 a,
.prose h3 a {
  @apply no-underline;
}
</style>
