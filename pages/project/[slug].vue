<script setup lang="ts">
definePageMeta({ layout: 'bare' })

const route = useRoute()
const slug = computed(() => String(route.params.slug))

type Status = 'loading' | 'locked' | 'unlocked' | 'notfound'
const status = ref<Status>('loading')

const meta = ref<{ name: string; customer_name: string; start_date: string | null; end_date: string | null } | null>(null)
const board = ref<any>(null)

const password = ref('')
const unlockError = ref('')
const submitting = ref(false)

const tab = ref<'board' | 'resources'>('board')
const listKeys = ['future', 'this_week', 'today', 'in_progress', 'done']

const listLabels: Record<string, string> = {
  future: 'مستقبلاً',
  this_week: 'هذا الأسبوع',
  today: 'اليوم',
  in_progress: 'قيد العمل',
  done: 'تم',
}

const listColors: Record<string, string> = {
  future: 'bg-gray-100',
  this_week: 'bg-blue-50',
  today: 'bg-amber-50',
  in_progress: 'bg-purple-50',
  done: 'bg-green-50',
}

const listHeaderColors: Record<string, string> = {
  future: 'text-gray-700 bg-gray-200/50',
  this_week: 'text-blue-700 bg-blue-200/50',
  today: 'text-amber-700 bg-amber-200/50',
  in_progress: 'text-purple-700 bg-purple-200/50',
  done: 'text-green-700 bg-green-200/50',
}

function getCards(listKey: string): any[] {
  return board.value?.lists?.[listKey]?.cards || []
}

function completedCount(card: any): number {
  return card.checklist?.filter((i: any) => i.is_complete).length || 0
}

function totalCount(card: any): number {
  return card.checklist?.length || 0
}

async function loadMeta() {
  try {
    const m = await $fetch(`/api/projects/${slug.value}/meta`)
    meta.value = m as any
    try {
      const b = await $fetch(`/api/projects/${slug.value}/board`)
      board.value = b as any
      status.value = 'unlocked'
    } catch {
      status.value = 'locked'
    }
  } catch {
    status.value = 'notfound'
  }
}

async function unlock() {
  unlockError.value = ''
  submitting.value = true
  try {
    await $fetch(`/api/projects/${slug.value}/unlock`, { method: 'POST', body: { password: password.value } })
    const b = await $fetch(`/api/projects/${slug.value}/board`)
    board.value = b as any
    status.value = 'unlocked'
    password.value = ''
  } catch (e: any) {
    if (e?.statusCode === 429) unlockError.value = 'محاولات كثيرة. حاول مرة أخرى لاحقًا.'
    else if (e?.statusCode === 401) unlockError.value = 'كلمة المرور غير صحيحة'
    else unlockError.value = 'حدث خطأ. حاول مرة أخرى.'
  } finally {
    submitting.value = false
  }
}

useHead({
  title: () => meta.value?.name ? `${meta.value.name} · مشروع` : 'مشروع',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

onMounted(loadMeta)
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Loading -->
    <div v-if="status === 'loading'" class="min-h-screen flex items-center justify-center">
      <div class="text-ink-mute text-sm">...</div>
    </div>

    <!-- Not found -->
    <div v-else-if="status === 'notfound'" class="min-h-screen flex items-center justify-center px-6">
      <div class="text-center max-w-md">
        <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-3">404</div>
        <h1 class="text-2xl font-bold text-ink mb-3">المشروع غير موجود</h1>
        <p class="text-ink-soft text-sm leading-[1.7]">قد يكون الرابط غير صحيح أو تمت أرشفة المشروع.</p>
        <NuxtLink to="/" class="inline-block mt-6 text-sm text-ink underline-offset-4 hover:underline">العودة إلى sufyanfa.com</NuxtLink>
      </div>
    </div>

    <!-- Locked: password gate -->
    <div v-else-if="status === 'locked'" class="min-h-screen flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-10">
          <NuxtLink to="/" class="inline-block mb-8" aria-label="الصفحة الرئيسية">
            <img src="/logo.svg" alt="سفيان فارع" class="h-7 w-auto mx-auto" />
          </NuxtLink>
          <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-5">
            <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
            مشروع
          </div>
          <h1 class="text-[26px] sm:text-[32px] font-bold text-ink leading-[1.5] tracking-tight mb-3">{{ meta?.name }}</h1>
          <p v-if="meta?.customer_name" class="text-ink-soft text-sm">{{ meta.customer_name }}</p>
        </div>

        <form @submit.prevent="unlock" class="bg-cream-deep rounded-3xl p-6 sm:p-8">
          <label class="block text-[12px] font-semibold text-ink mb-2">كلمة المرور</label>
          <input
            v-model="password"
            type="password"
            autocomplete="off"
            :disabled="submitting"
            placeholder="...&#8203;"
            class="w-full bg-white border border-black/[0.12] focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/15 rounded-2xl px-4 py-3 text-sm text-ink outline-none transition-all"
          />
          <p v-if="unlockError" class="text-[13px] text-red-600 mt-3">{{ unlockError }}</p>
          <button
            type="submit"
            :disabled="submitting || !password"
            class="w-full mt-5 bg-ink text-white rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
          >
            <span>{{ submitting ? 'جارٍ الفتح...' : 'فتح المشروع' }}</span>
            <Icon name="lucide:arrow-left" class="w-4 h-4" />
          </button>
        </form>

        <p class="text-center text-[12px] text-ink-mute mt-8">
          <span class="text-ink font-semibold">سفيان فارع</span> &middot; sufyanfa.com
        </p>
      </div>
    </div>

    <!-- Unlocked: Read-only board -->
    <div v-else-if="status === 'unlocked' && board" class="min-h-screen bg-white">
      <div class="px-6 sm:px-8 py-6">
        <div class="max-w-5xl mx-auto mb-6">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-2">
                <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
                مشروع
              </div>
              <h1 class="text-2xl font-bold text-ink">{{ board.project.name }}</h1>
              <p class="text-sm text-ink-soft mt-1">{{ board.customer_name }}</p>
            </div>
            <div class="text-sm text-ink-mute">
              <span v-if="board.project.start_date">{{ board.project.start_date }}</span>
              <span v-if="board.project.start_date && board.project.end_date">&rarr;</span>
              <span v-if="board.project.end_date">{{ board.project.end_date }}</span>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="max-w-5xl mx-auto mb-4 flex gap-1 border-b border-black/[0.06]">
          <button @click="tab = 'board'" :class="['px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-[1px]', tab === 'board' ? 'border-[#15803D] text-ink' : 'border-transparent text-ink-mute hover:text-ink']">
            البورد
          </button>
          <button @click="tab = 'resources'" :class="['px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-[1px]', tab === 'resources' ? 'border-[#15803D] text-ink' : 'border-transparent text-ink-mute hover:text-ink']">
            الموارد
            <span v-if="board.resources?.length" class="mr-1 text-xs font-normal opacity-60">{{ board.resources.length }}</span>
          </button>
        </div>

        <div v-if="tab === 'board'" class="max-w-5xl mx-auto flex gap-4 overflow-x-auto pb-4" style="min-height: 60vh;">
          <div v-for="listKey in listKeys" :key="listKey" class="flex-shrink-0 w-72">
            <div :class="['rounded-2xl overflow-hidden', listColors[listKey]]">
              <div :class="['px-4 py-3 text-sm font-bold', listHeaderColors[listKey]]">
                {{ listLabels[listKey] }}
                <span class="mr-1 text-xs font-normal opacity-70">{{ getCards(listKey).length }}</span>
              </div>

              <div class="p-2 space-y-2">
                <div v-for="card in getCards(listKey)" :key="card.id" class="bg-white rounded-xl p-3 shadow-sm border border-black/[0.04]">
                  <div class="text-sm font-semibold text-ink">{{ card.title }}</div>
                  <div v-if="card.person_name" class="text-[11px] text-ink-mute mt-1 inline-flex items-center gap-1">
                    <Icon name="lucide:user" class="w-3 h-3" />
                    {{ card.person_name }}
                  </div>
                  <div v-if="card.checklist?.length" class="mt-2">
                    <div class="flex items-center gap-2 text-[11px] text-ink-mute">
                      <div class="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div :style="{ width: `${totalCount(card) ? (completedCount(card) / totalCount(card)) * 100 : 0}%` }" class="h-full bg-[#15803D] rounded-full transition-all"></div>
                      </div>
                      <span class="whitespace-nowrap">{{ completedCount(card) }}/{{ totalCount(card) }}</span>
                    </div>
                    <div class="mt-2 space-y-1">
                      <div v-for="item in card.checklist" :key="item.id" class="flex items-start gap-2">
                        <div :class="['w-3.5 h-3.5 mt-0.5 rounded border-2 flex-shrink-0', item.is_complete ? 'bg-[#15803D] border-[#15803D]' : 'border-gray-300']">
                          <Icon v-if="item.is_complete" name="lucide:check" class="w-2.5 h-2.5 text-white" />
                        </div>
                        <div class="flex-1 min-w-0">
                          <div :class="['text-[12px]', item.is_complete ? 'line-through text-ink-mute/50' : 'text-ink']">{{ item.title }}</div>
                          <div v-if="item.assigned_to" class="text-[10px] text-ink-mute">{{ item.assigned_to }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Public Resources -->
        <div v-if="tab === 'resources'" class="max-w-5xl mx-auto">
          <div v-if="!board.resources?.length" class="text-center text-sm text-ink-mute py-8">
            لا توجد موارد.
          </div>
          <div v-else class="grid gap-3 sm:grid-cols-2">
            <a
              v-for="r in board.resources"
              :key="r.id"
              :href="r.url"
              target="_blank"
              class="bg-cream-deep rounded-2xl p-4 hover:shadow-sm transition-shadow block"
            >
              <div class="font-semibold text-ink text-sm underline underline-offset-2 decoration-[#15803D]/30">{{ r.name }}</div>
              <div v-if="r.description" class="text-xs text-ink-mute mt-1">{{ r.description }}</div>
              <div class="text-[11px] text-ink-mute/50 mt-1.5 truncate dir-ltr">{{ r.url }}</div>
            </a>
          </div>
        </div>

        <footer class="max-w-5xl mx-auto mt-8 pt-6 border-t border-black/[0.06] text-center text-[12px] text-ink-mute">
          <NuxtLink to="/" class="hover:opacity-80 transition-opacity inline-block mb-2">
            <img src="/logo.svg" alt="سفيان فارع" class="h-6 w-auto mx-auto" />
          </NuxtLink>
          <p>&copy; {{ new Date().getFullYear() }} &middot; sufyanfa.com</p>
        </footer>
      </div>
    </div>
  </div>
</template>
