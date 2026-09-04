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
            :aria-labelledby="`inquiry-title-${uid}`"
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
                  :id="`inquiry-title-${uid}`"
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

            <form
              v-if="!sent"
              class="p-6 sm:p-8 flex flex-col gap-5 overflow-y-auto"
              novalidate
              @submit.prevent="submit"
            >
              <div class="flex flex-col gap-1.5">
                <label
                  class="text-[11px] font-semibold tracking-wide text-ink-soft"
                  for="iq-name"
                >
                  الاسم
                </label>
                <input
                  id="iq-name"
                  v-model="form.name"
                  type="text"
                  required
                  autocomplete="name"
                  :class="inputClass(errors.name)"
                  placeholder="اسمك الكامل"
                  @blur="validateField('name')"
                />
                <p v-if="errors.name" class="text-[11px] text-red-600">{{ errors.name }}</p>
              </div>

              <div class="flex flex-col gap-1.5">
                <label
                  class="text-[11px] font-semibold tracking-wide text-ink-soft"
                  for="iq-email"
                >
                  البريد الإلكتروني
                </label>
                <input
                  id="iq-email"
                  v-model="form.email"
                  type="email"
                  required
                  autocomplete="email"
                  :class="inputClass(errors.email)"
                  placeholder="you@example.com"
                  dir="ltr"
                  @blur="validateField('email')"
                />
                <p v-if="errors.email" class="text-[11px] text-red-600">
                  {{ errors.email }}
                </p>
              </div>

              <div class="flex flex-col gap-1.5">
                <label
                  class="text-[11px] font-semibold tracking-wide text-ink-soft"
                  for="iq-phone"
                >
                  رقم الهاتف
                  <span class="text-ink-mute font-normal">(اختياري)</span>
                </label>
                <input
                  id="iq-phone"
                  v-model="form.phone"
                  type="tel"
                  autocomplete="tel"
                  :class="inputClass(errors.phone)"
                  placeholder="+966 5X XXX XXXX"
                  dir="ltr"
                  @blur="validateField('phone')"
                />
                <p v-if="errors.phone" class="text-[11px] text-red-600">
                  {{ errors.phone }}
                </p>
              </div>

              <div class="flex flex-col gap-1.5">
                <label
                  class="text-[11px] font-semibold tracking-wide text-ink-soft"
                  for="iq-message"
                >
                  تفاصيل مشروعك
                </label>
                <textarea
                  id="iq-message"
                  v-model="form.message"
                  required
                  rows="4"
                  :class="[inputClass(errors.message), 'resize-y min-h-[110px]']"
                  :placeholder="messagePlaceholder"
                  @blur="validateField('message')"
                ></textarea>
                <p v-if="errors.message" class="text-[11px] text-red-600">
                  {{ errors.message }}
                </p>
              </div>

              <div
                v-if="error"
                class="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col gap-3"
              >
                <p class="text-xs text-red-700 leading-relaxed">
                  تعذّر إرسال الرسالة الآن. تواصل معي مباشرة:
                </p>
                <div class="flex items-center gap-2.5 flex-wrap">
                  <NuxtLink
                    :to="whatsappLink"
                    target="_blank"
                    external
                    data-umami-event="inquiry-fallback-whatsapp-click"
                    :data-umami-event-service="service"
                    class="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-full px-4 py-2 text-[13px] font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Icon name="mdi:whatsapp" class="w-4 h-4" />
                    واتساب
                  </NuxtLink>
                  <NuxtLink
                    to="https://www.linkedin.com/in/sufyanfa/"
                    target="_blank"
                    external
                    data-umami-event="inquiry-fallback-linkedin-click"
                    :data-umami-event-service="service"
                    class="inline-flex items-center gap-2 bg-[#0A66C2] text-white rounded-full px-4 py-2 text-[13px] font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Icon name="mdi:linkedin" class="w-4 h-4" />
                    لينكدإن
                  </NuxtLink>
                </div>
              </div>

              <div class="flex items-center justify-between gap-4 pt-2">
                <p class="text-[11px] text-ink-mute leading-relaxed">
                  سرّية كاملة. أرد خلال 24 ساعة.
                </p>
                <button
                  type="submit"
                  :disabled="loading"
                  class="inline-flex items-center gap-2 bg-ink text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-ink/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  <span v-if="loading">جاري الإرسال…</span>
                  <span v-else>إرسال</span>
                  <span v-if="!loading" class="text-xs" aria-hidden="true">←</span>
                </button>
              </div>
            </form>

            <div
              v-else
              class="p-8 sm:p-10 text-center flex flex-col items-center gap-4"
            >
              <div
                class="w-14 h-14 rounded-full bg-cream-deep text-ink flex items-center justify-center"
              >
                <Icon name="lucide:check" class="w-7 h-7" stroke-width="2.5" />
              </div>
              <h3 class="text-xl font-bold text-ink">تم الاستلام، شكرًا!</h3>
              <p class="text-sm text-ink-soft leading-relaxed max-w-sm">
                وصلتني رسالتك، وسأرد عليك في أقرب وقت إن شاء الله.
              </p>

              <div class="w-full pt-5 mt-2 border-t border-cream-deep flex flex-col items-center gap-3">
                <p
                  class="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-mute"
                >
                  تواصل سريع
                </p>
                <div class="flex items-center gap-2.5 flex-wrap justify-center">
                  <NuxtLink
                    :to="whatsappLink"
                    target="_blank"
                    external
                    data-umami-event="inquiry-fallback-whatsapp-click"
                    :data-umami-event-service="service"
                    class="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-full px-4 py-2 text-[13px] font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Icon name="mdi:whatsapp" class="w-4 h-4" />
                    واتساب
                  </NuxtLink>
                  <NuxtLink
                    to="https://www.linkedin.com/in/sufyanfa/"
                    target="_blank"
                    external
                    data-umami-event="inquiry-fallback-linkedin-click"
                    :data-umami-event-service="service"
                    class="inline-flex items-center gap-2 bg-[#0A66C2] text-white rounded-full px-4 py-2 text-[13px] font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Icon name="mdi:linkedin" class="w-4 h-4" />
                    لينكدإن
                  </NuxtLink>
                </div>
              </div>

              <button
                type="button"
                class="mt-2 inline-flex items-center gap-2 bg-cream text-ink rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-cream-deep transition-colors"
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
  service: string;
  eyebrow: string;
  headline: string;
  messagePlaceholder?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const uid = Math.random().toString(36).slice(2, 8);

const PHONE_NUMBER = "966561652508";
const whatsappLink = `https://wa.me/${PHONE_NUMBER}`;

const form = ref({ name: "", email: "", phone: "", message: "" });
const errors = ref<Record<string, string>>({});

const loading = ref(false);
const error = ref(false);
const sent = ref(false);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s\-()]{6,}$/;

const validateField = (field: "name" | "email" | "phone" | "message") => {
  const v = form.value[field].trim();
  const next = { ...errors.value };
  delete next[field];
  if (field === "name" && v.length < 2) next.name = "الاسم قصير جدًا.";
  if (field === "email" && !EMAIL_RE.test(v)) next.email = "بريد إلكتروني غير صحيح.";
  if (field === "phone" && v && !PHONE_RE.test(v)) next.phone = "رقم هاتف غير صحيح.";
  if (field === "message" && v.length < 10)
    next.message = "اكتب على الأقل 10 أحرف عن مشروعك.";
  errors.value = next;
};

const validateAll = () => {
  validateField("name");
  validateField("email");
  validateField("phone");
  validateField("message");
  return Object.keys(errors.value).length === 0;
};

const { track } = useAnalytics();

const close = () => emit("update:modelValue", false);

const reset = () => {
  form.value = { name: "", email: "", phone: "", message: "" };
  errors.value = {};
  loading.value = false;
  error.value = false;
  sent.value = false;
};

const inputClass = (hasError?: string) => [
  "rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-mute/70 transition-all focus:outline-none bg-white",
  hasError
    ? "border border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
    : "border border-black/[0.12] hover:border-black/[0.2] focus:border-ink focus:ring-2 focus:ring-black/5",
];

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      reset();
      if (typeof document !== "undefined") {
        document.body.style.overflow = "hidden";
      }
    } else if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
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

const submit = async () => {
  if (!validateAll()) return;
  loading.value = true;
  error.value = false;
  try {
    await $fetch("/api/contact", {
      method: "POST",
      body: {
        service: props.service,
        name: form.value.name.trim(),
        email: form.value.email.trim(),
        phone: form.value.phone.trim(),
        message: form.value.message.trim(),
      },
    });
    sent.value = true;
    track("inquiry-form-submit", { service: props.service });
  } catch (e) {
    error.value = true;
    track("inquiry-form-error", { service: props.service });
  } finally {
    loading.value = false;
  }
};
</script>
