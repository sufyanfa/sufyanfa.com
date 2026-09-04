<template>
  <NuxtLink
    :to="article._path"
    data-umami-event="article-card-click"
    :data-umami-event-title="article.title"
    class="block group rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-white"
  >
    <article
      :class="[
        'rounded-[20px] bg-cream-deep hover:bg-[#ECECED] border border-black/[0.03] transition-all duration-300 flex flex-col justify-between',
        featured ? 'p-6 sm:p-8' : 'p-5 sm:p-6',
      ]"
    >
      <div>
        <span
          v-if="featured"
          class="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-3"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-ink"></span>
          <span>الأحدث</span>
        </span>

        <div class="flex items-center justify-between gap-4 mb-2">
          <h3
            :class="[
              'font-bold text-ink leading-snug group-hover:text-black transition-colors',
              featured ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg',
            ]"
          >
            {{ article.title }}
          </h3>

          <span
            v-if="article.published"
            class="text-xs font-medium text-ink-mute whitespace-nowrap"
          >
            {{ getReadableDate(article.published) }}
          </span>
        </div>

        <p
          :class="[
            'text-ink-soft leading-[1.7] mb-3',
            featured ? 'text-[14px] sm:text-[15px] line-clamp-3' : 'text-[13px] sm:text-[14px] line-clamp-2',
          ]"
        >
          {{ article.description }}
        </p>
      </div>

      <div class="pt-2.5 border-t border-black/[0.05] flex items-center justify-between">
        <span
          class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink group-hover:opacity-60 transition-opacity"
        >
          <span>اقرأ المقال</span>
          <Icon
            name="lucide:arrow-left"
            class="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1"
          />
        </span>

        <span class="text-[11px] font-medium text-ink-mute flex items-center gap-1">
          <Icon name="lucide:clock" class="w-3 h-3" />
          <span>{{ readingTime }} دقيقة</span>
        </span>
      </div>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    article: {
      title: string;
      description: string;
      published?: string;
      _path: string;
      readingTime?: number;
    };
    index?: number;
    featured?: boolean;
  }>(),
  {
    index: 0,
    featured: false,
  }
);

const readingTime = computed(() => {
  if (props.article.readingTime) return props.article.readingTime;
  // Fallback for callers that haven't fetched `readingTime` from content yet.
  const words = (props.article.description ?? "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 40));
});

const getReadableDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", {
    year: "numeric",
    month: "long",
  });
};
</script>
