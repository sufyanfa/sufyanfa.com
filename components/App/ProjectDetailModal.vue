<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue && project"
        class="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition ease-out duration-250"
          enter-from-class="opacity-0 translate-y-4 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:scale-95"
        >
          <div
            v-if="modelValue && project"
            class="relative w-full sm:max-w-xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="`project-title-${uid}`"
          >
            <button
              type="button"
              class="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md text-ink-mute hover:text-ink p-2 rounded-lg transition-colors shadow-sm"
              aria-label="إغلاق"
              @click="close"
            >
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>

            <div class="overflow-y-auto">
              <!-- Hero Image -->
              <div class="relative aspect-[16/9] bg-cream-deep">
                <NuxtImg
                  v-if="project.thumbnail"
                  :src="project.thumbnail"
                  :alt="project.name"
                  class="w-full h-full object-cover"
                  sizes="600px"
                  format="webp"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                >
                  <span class="text-2xl font-bold text-ink/70">{{ project.name }}</span>
                </div>
              </div>

              <div class="px-6 sm:px-8 py-6 sm:py-7">
                <!-- Title -->
                <div
                  class="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase text-ink-mute mb-3"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-ink"></span>
                  <span>{{ project.role ?? "مشروع" }}</span>
                </div>
                <h2
                  :id="`project-title-${uid}`"
                  class="text-xl sm:text-2xl font-bold text-ink leading-tight tracking-tight mb-4"
                >
                  {{ project.name }}
                </h2>

                <!-- Services -->
                <div v-if="project.services?.length" class="flex flex-wrap gap-1.5 mb-5">
                  <span
                    v-for="service in project.services"
                    :key="service"
                    class="text-[11px] font-medium text-ink-soft bg-cream-deep rounded-full px-2.5 py-1"
                  >
                    {{ service }}
                  </span>
                </div>

                <!-- Long description -->
                <p class="text-[14px] text-ink-soft leading-[1.8] mb-2">
                  {{ project.outcome ?? project.tagline }}
                </p>
                <p v-if="project.result" class="text-[14px] text-ink-soft leading-[1.8]">
                  {{ project.result }}
                </p>

                <!-- Studio Images Gallery -->
                <div v-if="project.gallery?.length" class="grid grid-cols-2 gap-2 mt-6">
                  <div
                    v-for="(img, i) in project.gallery"
                    :key="i"
                    class="relative aspect-[4/3] rounded-xl overflow-hidden bg-cream-deep"
                  >
                    <NuxtImg
                      :src="img"
                      :alt="`${project.name} ${i + 1}`"
                      class="w-full h-full object-cover"
                      sizes="300px"
                      format="webp"
                      loading="lazy"
                    />
                  </div>
                </div>

                <!-- Visit Site -->
                <NuxtLink
                  v-if="project.url"
                  :to="project.url"
                  target="_blank"
                  external
                  class="inline-flex items-center gap-2 bg-ink hover:bg-black text-white rounded-full px-6 py-3 text-sm font-semibold transition-all mt-7"
                >
                  <span>زيارة الموقع</span>
                  <Icon name="lucide:arrow-up-left" class="w-4 h-4" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
type Project = {
  name: string;
  url?: string;
  tagline?: string;
  outcome?: string;
  result?: string;
  role?: string;
  thumbnail?: string;
  services?: string[];
  gallery?: string[];
};

const props = defineProps<{
  modelValue: boolean;
  project?: Project | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const uid = Math.random().toString(36).slice(2, 8);

const close = () => emit("update:modelValue", false);

watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
  }
);

const onEsc = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.modelValue) close();
};

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", onEsc);
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", onEsc);
  }
  if (typeof document !== "undefined") {
    document.body.style.overflow = "";
  }
});
</script>
