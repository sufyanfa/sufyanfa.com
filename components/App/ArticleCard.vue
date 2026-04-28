<template>
  <NuxtLink :to="article._path" class="block group h-full">
    <article
      class="rounded-3xl border border-black/[0.04] bg-white overflow-hidden h-full flex flex-col transition-shadow group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
    >
      <div
        class="relative aspect-[16/10] flex items-center justify-center p-6 overflow-hidden"
        :class="coverBg"
      >
        <span
          class="absolute top-3 right-4 text-lg opacity-30 select-none"
          aria-hidden="true"
        >
          ✦
        </span>
        <h3
          class="relative text-lg sm:text-xl font-extrabold text-ink leading-snug text-center tracking-h2 group-hover:underline"
        >
          {{ article.title }}
        </h3>
      </div>

      <div class="p-6 sm:p-7 flex flex-col gap-2.5 flex-1">
        <div class="text-xs font-semibold text-forest">
          {{ getReadableDate(article.published) }}
        </div>
        <p class="text-[13px] text-ink-soft leading-relaxed">{{ article.description }}</p>
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

const coverBg = computed(() => (props.index % 2 === 0 ? "bg-cream" : "bg-forest-soft"));

const getReadableDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", {
    year: "numeric",
    month: "long",
  });
};
</script>
