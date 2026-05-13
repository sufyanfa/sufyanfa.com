<template>
  <div class="flex justify-center">
    <div
      class="inline-flex items-center gap-1 p-1 bg-cream-deep rounded-full"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="px-5 sm:px-6 py-2 rounded-full text-[14px] font-medium transition-all"
        :class="
          modelValue === tab.id
            ? 'bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
            : 'text-ink-soft hover:text-ink'
        "
        @click="$emit('update:modelValue', tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  tabs: { id: string; label: string }[];
}>();

defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();
</script>
