<template>
  <NuxtLink :to="article._path" class="block group h-full">
    <article
      class="rounded-2xl sm:rounded-3xl border border-black/[0.05] bg-white overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:border-black/[0.12] group-hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] group-hover:-translate-y-1"
    >
      <div class="p-7 sm:p-8 flex flex-col gap-4 flex-1">
        <header class="flex items-center justify-between">
          <div
            class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute"
          >
            <span class="w-1 h-1 rounded-full bg-[#15803D]"></span>
            <span>{{ getReadableDate(article.published) }}</span>
          </div>
          <span class="text-[11px] font-bold text-ink-mute/40 tabular-nums">
            0{{ (index ?? 0) + 1 }}
          </span>
        </header>

        <h3
          class="text-lg sm:text-xl font-bold text-ink leading-[1.5] tracking-tight"
        >
          {{ article.title }}
        </h3>

        <p class="text-[14px] text-ink-soft leading-[1.7]">
          {{ article.description }}
        </p>

        <div
          class="mt-auto pt-4 flex items-center justify-between border-t border-black/[0.05]"
        >
          <span
            class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink group-hover:opacity-60 transition-opacity"
          >
            اقرأ المقال
            <Icon
              name="lucide:arrow-left"
              class="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5"
            />
          </span>

          <span
            class="inline-flex items-center gap-1 text-[11px] text-ink-mute"
          >
            <Icon name="lucide:clock" class="w-3 h-3" />
            {{ readingTime }} د
          </span>
        </div>
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
  return Math.max(3, Math.ceil(words / 50));
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
