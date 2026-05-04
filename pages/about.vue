<template>
  <main>
    <section class="bg-cream">
      <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-20 lg:py-24">
        <div class="max-w-3xl">
          <AppEyebrow tone="white" class="mb-6">رحلتي</AppEyebrow>
          <h1
            class="font-extrabold text-ink leading-tight tracking-display text-[36px] sm:text-[44px] lg:text-[52px] mb-5"
          >
            من أنا
          </h1>
          <p class="text-base sm:text-lg text-ink-soft leading-relaxed">
            {{ description }}
          </p>
        </div>
      </div>
    </section>

    <section class="bg-gray-50 border-y border-black/[0.04]">
      <div class="max-w-site mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-20">
        <article class="max-w-3xl prose-journey">
          <div class="flex items-start gap-5 sm:gap-6 mb-8">
            <NuxtImg
              src="/sufyan.jpeg"
              alt="سفيان فارع"
              class="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover ring-1 ring-black/[0.04] shadow-[0_20px_50px_-20px_rgba(59,90,59,0.25)] flex-shrink-0"
              format="webp"
              placeholder
            />
            <p class="lead !mb-0">
              بدأت رحلتي مع البرمجة عام 2015 وأنا طالب في جامعة الملك فهد للبترول
              والمعادن. كانت البداية مع موقع بسيط بُني في غرفة السكن الجامعي،
              ومنذ تلك اللحظة عرفت أن هذا هو المسار الذي أريده.
            </p>
          </div>

          <h2>البدايات</h2>
          <p>
            خلال سنوات الدراسة، عملت على عدة مشاريع جانبية - بعضها فشل، وبعضها
            علّمني دروسًا لا تُنسى. أول عمل حقيقي كان مع شركة ناشئة محلية، حيث
            تعلمت أن البرمجة وحدها لا تكفي؛ المنتج الناجح يحتاج فهمًا عميقًا
            للمستخدم والسوق.
          </p>

          <h2>التحول</h2>
          <p>
            عام 2019 كان نقطة تحول. انتقلت للعمل مع جهات حكومية وشركات كبرى في
            المملكة - من هيئة الغذاء والدواء إلى جامعة الملك خالد - وأدركت أن
            التحدي الأكبر ليس تقنيًا، بل في ترجمة الأفكار إلى منتجات يستخدمها
            الناس فعليًا.
          </p>

          <h2>الشريك التقني</h2>
          <p>
            بعد سنوات من العمل، لاحظت نمطًا متكررًا: مؤسسون لديهم أفكار رائعة
            لكنهم يضيعون أشهرًا - وأحيانًا سنوات - في بناء المنتج الخاطئ. قررت
            أن أتخصص في كوني شريكًا تقنيًا للمؤسسين، أساعدهم على اتخاذ القرارات
            الصحيحة من البداية.
          </p>

          <h2>اليوم</h2>
          <p>
            أعمل اليوم مع رواد أعمال ومؤسسين في مراحل مختلفة، أساعدهم على بناء
            منتجات رقمية بميزانية ووقت واقعيَّيْن. شاركت في بناء منتجات لأكثر من
            8 جهات، ولا أزال متحمسًا لكل فكرة جديدة كأول يوم.
          </p>

          <h2>خارج العمل</h2>
          <p>
            أحب القراءة في ريادة الأعمال والتصميم، وأشارك ما أتعلمه عبر المقالات
            والأدلة التفاعلية. أؤمن أن أفضل طريقة لفهم شيء هي محاولة شرحه
            للآخرين.
          </p>
        </article>
      </div>
    </section>

    <HomeFinalCTA />
  </main>
</template>

<script setup lang="ts">
const title = "من أنا | سفيان فارع - رحلتي في بناء المنتجات الرقمية";
const description =
  "قصة رحلتي في عالم البرمجة وريادة الأعمال - من طالب جامعي إلى شريك تقني لرواد الأعمال.";

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
</script>

<style scoped>
.prose-journey :deep(.lead) {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #1a1a1a;
  font-weight: 500;
  margin-bottom: 2.5rem;
}

.prose-journey :deep(h2) {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
}

.prose-journey :deep(p) {
  font-size: 1rem;
  line-height: 1.9;
  color: #4a4a4a;
  margin-bottom: 1.25rem;
}
</style>
