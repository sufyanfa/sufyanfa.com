<template>
  <main>
    <AppHeader title="من أنا" :description="description" eyebrow="عن سفيان" />

    <!-- Intro: photo, lead paragraph, proof stats -->
    <section class="bg-white pt-16 sm:pt-20 border-b border-black/[0.04]">
      <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-12">
        <div class="max-w-3xl text-right">
          <div class="flex flex-col sm:flex-row items-start gap-6 mb-8">
            <NuxtImg
              src="/sufyan.png"
              alt="سفيان فارع"
              class="w-24 h-24 sm:w-28 sm:h-28 rounded-[20px] object-cover ring-1 ring-black/[0.05] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] flex-shrink-0"
              format="webp"
              placeholder
            />
            <p class="text-ink text-base sm:text-lg leading-[1.8] font-medium">
             بدأت رحلتي مع البرمجة عام 2016 وأنا طالب في المتوسطة. كانت البداية مع مواقع بسيطة وتطبيقات تخدم بضعة مستخدمين، ومنذ تلك اللحظة عرفت أن هذا هو المسار الذي أريده.
            </p>
          </div>

          <div class="grid grid-cols-4 gap-3 sm:gap-5 pb-10 border-b border-black/[0.06]">
            <div>
              <div class="text-lg sm:text-2xl font-bold text-ink">120+</div>
              <div class="text-[10px] sm:text-xs text-ink-mute leading-snug">مؤسسة</div>
            </div>
            <div>
              <div class="text-lg sm:text-2xl font-bold text-ink">700K+</div>
              <div class="text-[10px] sm:text-xs text-ink-mute leading-snug">معاملة</div>
            </div>
            <div>
              <div class="text-lg sm:text-2xl font-bold text-ink">250K+</div>
              <div class="text-[10px] sm:text-xs text-ink-mute leading-snug">مستخدم</div>
            </div>
            <div>
              <div class="text-lg sm:text-2xl font-bold text-ink">2M+</div>
              <div class="text-[10px] sm:text-xs text-ink-mute leading-snug">إيرادات</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="bg-white py-14 sm:py-16 border-b border-black/[0.04]">
      <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-12">
        <div class="max-w-3xl text-right border-r-2 border-black/[0.08]">
          <div
            v-for="(entry, i) in timeline"
            :key="entry.title"
            class="relative pr-7 sm:pr-8"
            :class="i === timeline.length - 1 ? 'pb-0' : 'pb-10'"
          >
            <span
              class="absolute top-1.5 right-0 translate-x-1/2 w-3 h-3 rounded-full bg-ink ring-4 ring-white"
            ></span>
            <div class="text-xs font-semibold text-ink-mute mb-2">{{ entry.year }}</div>
            <h2 class="text-xl sm:text-2xl font-bold text-ink mb-2.5">{{ entry.title }}</h2>
            <p class="text-base text-ink-soft leading-[1.85]">{{ entry.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Closing note -->
    <section class="bg-white pb-16 sm:pb-20">
      <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-12">
        <div class="max-w-3xl text-right">
          <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-3">
            خارج العمل
          </div>
          <p class="text-[15px] text-ink-soft leading-[1.85]">
            أحب القراءة في ريادة الأعمال والتصميم، وأشارك ما أتعلمه عبر المقالات
            والأدلة التفاعلية. أؤمن أن أفضل طريقة لفهم شيء هي محاولة شرحه
            للآخرين.
          </p>
        </div>
      </div>
    </section>

    <HomeFinalCTA />
  </main>
</template>

<script setup lang="ts">
const title = "من أنا | سفيان فارع، رحلتي في بناء المنتجات الرقمية";
const description =
  "قصة رحلتي من طالب إلى باني منتجات رقمية لرواد الأعمال والمؤسسات.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "https://sufyanfa.com/preview.png",
  ogUrl: "https://sufyanfa.com/about",
  ogType: "profile",
  ogLocale: "ar_SA",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: "https://sufyanfa.com/preview.png",
});

useHead({
  link: [{ rel: "canonical", href: "https://sufyanfa.com/about" }],
});

const timeline = [
  {
    year: "2015 – 2019",
    title: "البدايات",
    body: "خلال سنوات الدراسة الجامعية، عملت على عدة مشاريع جانبية: بعضها فشل، وبعضها علّمني دروسًا لا تُنسى. أول عمل حقيقي كان تأسيس شركة ناشئة محلية، حيث تعلمت أن البرمجة وحدها لا تكفي؛ المنتج الناجح يحتاج فهمًا عميقًا للمستخدم والسوق.",
  },
  {
    year: "2019",
    title: "التحول",
    body: "عام 2019 كان نقطة تحول. انتقلت للعمل مع جهات حكومية وشركات كبرى في المملكة، من هيئة الغذاء والدواء إلى جامعة الملك خالد، وأدركت أن التحدي الأكبر ليس تقنيًا، بل في ترجمة الأفكار إلى منتجات يستخدمها الناس فعليًا.",
  },
  {
    year: "اليوم",
    title: "باني منتجات، وشريك تقني",
    body: "لاحظت نمطًا متكررًا: مؤسسون لديهم أفكار رائعة يضيعون أشهرًا، وأحيانًا سنوات، في بناء المنتج الخاطئ. قررت أن أبني منتجات تعمل من أول يوم، والتقنية هي الأداة التي أستخدمها لتحقيق ذلك. أعمل اليوم مع رواد أعمال ومؤسسين في مراحل مختلفة، بميزانية ووقت واقعيَّيْن.",
  },
];
</script>
