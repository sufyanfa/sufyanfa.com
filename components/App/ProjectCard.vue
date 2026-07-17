<template>
  <NuxtLink
    :to="project.url"
    target="_blank"
    external
    class="group rounded-2xl sm:rounded-3xl h-full flex flex-col bg-cream-deep border border-transparent overflow-hidden hover:border-black/[0.08] hover:bg-white hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300"
  >
    <div
      v-if="project.thumbnail"
      class="relative aspect-[16/10] overflow-hidden bg-cream-deep"
    >
      <NuxtImg
        :src="project.thumbnail"
        :alt="project.name"
        class="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
        sizes="500px sm:600px"
        format="webp"
        loading="lazy"
      />
      <span
        v-if="project.status === 'live'"
        class="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-semibold text-[#15803D] inline-flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      >
        حيّ
        <span class="relative flex w-1.5 h-1.5">
          <span
            class="absolute inline-flex h-full w-full rounded-full bg-[#15803D] opacity-60 animate-ping"
          ></span>
          <span class="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#15803D]"></span>
        </span>
      </span>
    </div>

    <div
      v-else
      class="relative aspect-[16/10] overflow-hidden flex items-center justify-center px-8"
      :class="toneBg"
    >
      <span
        class="w-1.5 h-1.5 rounded-full absolute top-4 right-4"
        :class="toneDot"
        aria-hidden="true"
      ></span>
      <span
        class="select-none text-center font-extrabold text-ink/85 leading-tight tracking-tight text-2xl sm:text-3xl transition-transform duration-500 group-hover:scale-[1.04]"
      >
        {{ project.name }}
      </span>
      <span
        v-if="project.status === 'live'"
        class="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-semibold text-[#15803D] inline-flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      >
        حيّ
        <span class="relative flex w-1.5 h-1.5">
          <span
            class="absolute inline-flex h-full w-full rounded-full bg-[#15803D] opacity-60 animate-ping"
          ></span>
          <span class="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#15803D]"></span>
        </span>
      </span>
    </div>

    <div class="p-7 sm:p-8 flex flex-col flex-1">
      <header class="flex justify-between items-start mb-5">
        <div class="flex items-center gap-3">
          <span class="text-[12px] font-bold text-ink-mute/40 tabular-nums">
            0{{ (index ?? 0) + 1 }}
          </span>
          <span class="w-px h-3 bg-ink-mute/20"></span>
          <span
            class="text-[11px] font-semibold tracking-wide uppercase text-ink-mute"
          >
            {{ project.role }} · {{ project.year }}
          </span>
        </div>
      </header>

      <h3
        class="text-xl sm:text-[22px] font-bold text-ink leading-tight tracking-tight mb-3"
      >
        {{ project.name }}.
      </h3>
      <p class="text-[14px] text-ink-soft leading-[1.7] mb-7 flex-1">
        {{ project.outcome }}
      </p>

      <div class="flex items-center justify-between">
        <span
          class="text-[13px] font-semibold text-ink inline-flex items-center gap-1.5 group-hover:opacity-60 transition-colors"
        >
          زيارة المشروع
          <Icon
            name="lucide:arrow-left"
            class="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5"
          />
        </span>

        <div
          class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-black/[0.06] group-hover:bg-ink group-hover:text-white group-hover:border-ink text-ink transition-all"
          aria-hidden="true"
        >
          <Icon
            name="lucide:arrow-up-left"
            class="w-4 h-4 transition-transform group-hover:rotate-[-12deg]"
          />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    project: {
      name: string;
      url: string;
      tagline?: string;
      outcome?: string;
      role?: string;
      year?: string;
      status?: string;
      tone?: string;
      thumbnail?: string;
    };
    index?: number;
  }>(),
  {
    index: 0,
  }
);

const toneBg = computed(() => {
  if (props.project.tone === "lavender") {
    return "bg-gradient-to-br from-[#EDE9FE] via-[#F1EEFB] to-cream-deep";
  }
  return "bg-gradient-to-br from-[#DCFCE7] via-[#E8F5EA] to-cream-deep";
});

const toneDot = computed(() => {
  if (props.project.tone === "lavender") return "bg-[#7C3AED]";
  return "bg-[#15803D]";
});
</script>
