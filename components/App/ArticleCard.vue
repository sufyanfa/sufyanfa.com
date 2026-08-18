<template>
  <NuxtLink :to="article._path" class="block group">
    <article
      class="rounded-[20px] bg-cream-deep hover:bg-[#ECECED] border border-black/[0.03] p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div class="flex items-center justify-between gap-4 mb-2">
          <h3
            class="text-base sm:text-lg font-bold text-ink leading-snug group-hover:text-black transition-colors"
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

        <p class="text-[13px] sm:text-[14px] text-ink-soft leading-[1.7] mb-3 line-clamp-2">
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
    };
    index?: number;
  }>(),
  {
    index: 0,
  }
);

const readingTime = computed(() => {
  const words = (props.article.description ?? "").split(/\s+/).length;
  return Math.max(3, Math.ceil(words / 40));
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
