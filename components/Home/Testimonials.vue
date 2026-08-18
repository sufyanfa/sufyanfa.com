<template>
  <section class="bg-white py-16 sm:py-20 lg:py-24 border-b border-black/[0.04]">
    <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-12">
      <!-- Section Header -->
      <div class="text-right max-w-xl mb-12 sm:mb-14">
        <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-mute mb-3">
          <span class="w-1.5 h-1.5 rounded-full bg-ink"></span>
          <span>آراء الشركاء</span>
        </div>

        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink !leading-tight mb-3">
          قالوا عن التجربة
        </h2>

        <p class="text-[15px] sm:text-[16px] text-ink-soft leading-relaxed">
          انطباعات من مؤسسين وقادة عملت معهم على تحويل الفكرة إلى منتج فعلي.
        </p>
      </div>

      <!-- Testimonials Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="(t, i) in testimonials"
          :key="i"
          class="flex flex-col gap-4"
        >
          <!-- Speech Bubble Box -->
          <div
            class="rounded-[20px] rounded-br-[4px] bg-cream-deep border border-black/[0.03] p-7 sm:p-8 relative"
          >
            <p class="text-[15px] sm:text-[16px] text-ink leading-[1.8]">
              «{{ t.quote }}»
            </p>
          </div>

          <!-- Author Info -->
          <div class="flex items-center gap-3 px-2">
            <div
              class="w-10 h-10 rounded-full bg-cream-deep border border-black/[0.06] text-ink font-bold flex items-center justify-center text-xs flex-shrink-0"
            >
              {{ t.name?.charAt(0) ?? 'م' }}
            </div>
            <div>
              <div class="text-[14px] font-bold text-ink">{{ t.name }}</div>
              <div class="text-xs text-ink-mute">{{ t.role }} · {{ t.context }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: testimonials } = await useAsyncData("home-testimonials", () =>
  queryContent("/testimonials").find()
);
</script>
