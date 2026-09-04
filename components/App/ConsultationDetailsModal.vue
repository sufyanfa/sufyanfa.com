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
        v-if="modelValue"
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
            v-if="modelValue"
            class="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="`consultation-title-${uid}`"
          >
            <div
              class="bg-white px-6 sm:px-8 py-6 sm:py-7 border-b border-black/[0.06] flex items-start justify-between gap-4"
            >
              <div class="min-w-0 flex-1">
                <div
                  class="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase text-ink-mute mb-3"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-ink"></span>
                  <span>{{ eyebrow }}</span>
                </div>
                <h2
                  :id="`consultation-title-${uid}`"
                  class="text-xl sm:text-2xl font-bold text-ink leading-tight tracking-tight"
                >
                  {{ headline }}
                </h2>
              </div>
              <button
                type="button"
                class="text-ink-mute hover:text-ink p-2 -m-2 flex-shrink-0 rounded-lg transition-colors"
                aria-label="إغلاق"
                @click="close"
              >
                <Icon name="lucide:x" class="w-5 h-5" />
              </button>
            </div>

            <div class="p-6 sm:p-8 overflow-y-auto flex flex-col gap-6">
              <!-- Price + Timing -->
              <div
                class="flex items-center justify-between gap-4 bg-cream-deep rounded-2xl px-5 py-4"
              >
                <div>
                  <div class="text-[11px] font-semibold text-ink-mute mb-1">السعر</div>
                  <div class="text-2xl font-bold text-ink">{{ price }}</div>
                </div>
                <div class="text-left">
                  <div class="text-[11px] font-semibold text-ink-mute mb-1">مدة الجلسة</div>
                  <div class="text-sm font-semibold text-ink">{{ timing }}</div>
                </div>
              </div>

              <!-- Who it's for -->
              <div v-if="audience?.length">
                <div class="text-[11px] font-semibold tracking-wider uppercase text-ink-mute mb-3">
                  لمن هذه الاستشارة؟
                </div>
                <ul class="space-y-2 text-[13px] text-ink-soft leading-relaxed">
                  <li v-for="item in audience" :key="item" class="flex items-start gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-ink/40 mt-1.5 flex-shrink-0"></span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>

              <!-- Deliverables -->
              <div v-if="deliverables?.length">
                <div class="text-[11px] font-semibold tracking-wider uppercase text-ink-mute mb-3">
                  ماذا ستحصل عليه
                </div>
                <ul class="space-y-2 text-[13px] text-ink-soft leading-relaxed">
                  <li v-for="item in deliverables" :key="item" class="flex items-start gap-2">
                    <span class="text-ink font-bold text-xs mt-0.5">✓</span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>

              <p class="text-[11px] text-ink-mute leading-relaxed">
                احجز الوقت المناسب لك عبر Cal.com، والدفع بعد انتهاء الجلسة مباشرة.
              </p>
            </div>

            <div class="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 flex items-center gap-3">
              <NuxtLink
                :to="bookingUrl"
                target="_blank"
                external
                data-umami-event="consultation-details-confirm"
                :data-umami-event-service="headline"
                :data-umami-event-price="price"
                :data-umami-event-position="position"
                class="flex-1 inline-flex items-center justify-center gap-2 bg-ink hover:bg-black text-white rounded-full px-6 py-3 text-sm font-semibold transition-colors"
                @click="close"
              >
                <span>متابعة الحجز</span>
                <Icon name="lucide:arrow-left" class="w-4 h-4" />
              </NuxtLink>
              <button
                type="button"
                class="inline-flex items-center justify-center bg-cream text-ink rounded-full px-5 py-3 text-sm font-semibold hover:bg-cream-deep transition-colors"
                @click="close"
              >
                إغلاق
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  eyebrow: string;
  headline: string;
  price: string;
  timing?: string;
  audience?: string[];
  deliverables?: string[];
  bookingUrl: string;
  position?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const uid = Math.random().toString(36).slice(2, 8);

const close = () => emit("update:modelValue", false);

const onEsc = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.modelValue) close();
};

watch(
  () => props.modelValue,
  (open) => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = open ? "hidden" : "";
    }
  }
);

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
