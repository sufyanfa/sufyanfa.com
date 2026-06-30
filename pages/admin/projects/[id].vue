<script setup lang="ts">
definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

const route = useRoute()
const id = route.params.id as string

const { data, refresh } = await useFetch<any>(() => `/api/admin/projects/${id}`)
const board = ref(data)
watch(data, (v) => { board.value = v })

const addingCard = ref<string | null>(null)
const newCardTitle = ref('')
const expandedCard = ref<number | null>(null)
const addingChecklist = ref<number | null>(null)
const newChecklistTitle = ref('')
const newChecklistPerson = ref('')
const draggedCard = ref<{ id: number; fromList: string } | null>(null)
const saving = ref(false)
const editCardTitle = ref<{ id: number; title: string } | null>(null)
const editPersonName = ref<{ id: number; name: string } | null>(null)

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

const listDotColors: Record<string, string> = {
  future: 'bg-gray-400',
  this_week: 'bg-blue-500',
  today: 'bg-amber-500',
  in_progress: 'bg-purple-500',
  done: 'bg-green-500',
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

/* -------- drag & drop -------- */
function onDragStart(e: DragEvent, cardId: number, fromList: string) {
  draggedCard.value = { id: cardId, fromList }
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(cardId))
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

async function onDrop(e: DragEvent, toList: string) {
  e.preventDefault()
  if (!draggedCard.value) return
  const { id: cardId, fromList } = draggedCard.value
  draggedCard.value = null
  if (fromList === toList) return

  saving.value = true
  try {
    const cards = getCards(toList)
    const position = cards.length
    await $fetch(`/api/admin/cards/${cardId}`, { method: 'PUT', body: { list_key: toList, position } })
    await refresh()
  } catch {}
  saving.value = false
}

/* -------- cards -------- */
async function addCard(listKey: string) {
  if (!newCardTitle.value.trim()) return
  saving.value = true
  try {
    await $fetch('/api/admin/cards', { method: 'POST', body: { project_id: Number(id), title: newCardTitle.value.trim(), list_key: listKey } })
    newCardTitle.value = ''
    addingCard.value = null
    await refresh()
  } catch {}
  saving.value = false
}

async function updateCardTitle(cardId: number, title: string) {
  if (!title.trim()) return
  saving.value = true
  try {
    await $fetch(`/api/admin/cards/${cardId}`, { method: 'PUT', body: { title: title.trim() } })
    editCardTitle.value = null
    await refresh()
  } catch {}
  saving.value = false
}

async function updatePersonName(cardId: number, person_name: string) {
  saving.value = true
  try {
    await $fetch(`/api/admin/cards/${cardId}`, { method: 'PUT', body: { person_name } })
    editPersonName.value = null
    await refresh()
  } catch {}
  saving.value = false
}

const changingCard = ref<number | null>(null)

const progress = computed(() => {
  let done = 0, total = 0
  for (const key of listKeys) {
    for (const card of getCards(key)) {
      for (const item of card.checklist || []) {
        total++
        if (item.is_complete) done++
      }
    }
  }
  return total ? Math.round((done / total) * 100) : 0
})

async function moveCard(cardId: number, toList: string) {
  saving.value = true
  changingCard.value = cardId
  try {
    const cards = getCards(toList)
    const position = cards.length
    await $fetch(`/api/admin/cards/${cardId}`, { method: 'PUT', body: { list_key: toList, position } })
    await refresh()
  } catch {}
  changingCard.value = null
  saving.value = false
}

async function deleteCard(cardId: number) {
  if (!confirm('حذف البطاقة؟')) return
  saving.value = true
  try {
    await $fetch(`/api/admin/cards/${cardId}`, { method: 'DELETE' })
    if (expandedCard.value === cardId) expandedCard.value = null
    await refresh()
  } catch {}
  saving.value = false
}

/* -------- checklist -------- */
async function addChecklistItem(cardId: number) {
  if (!newChecklistTitle.value.trim()) return
  saving.value = true
  try {
    await $fetch('/api/admin/checklist', {
      method: 'POST',
      body: { card_id: cardId, title: newChecklistTitle.value.trim(), assigned_to: newChecklistPerson.value.trim() || undefined },
    })
    newChecklistTitle.value = ''
    newChecklistPerson.value = ''
    addingChecklist.value = null
    await refresh()
  } catch {}
  saving.value = false
}

async function toggleChecklist(item: any) {
  saving.value = true
  try {
    await $fetch(`/api/admin/checklist/${item.id}`, { method: 'PUT', body: { is_complete: !item.is_complete } })
    await refresh()
  } catch {}
  saving.value = false
}

async function deleteChecklistItem(itemId: number) {
  saving.value = true
  try {
    await $fetch(`/api/admin/checklist/${itemId}`, { method: 'DELETE' })
    await refresh()
  } catch {}
  saving.value = false
}

async function updateChecklistTitle(item: any) {
  if (!item.title.trim()) return
  saving.value = true
  try {
    await $fetch(`/api/admin/checklist/${item.id}`, { method: 'PUT', body: { title: item.title.trim() } })
    await refresh()
  } catch {}
  saving.value = false
}

useHead({ title: () => `${board.value?.project?.name || 'مشروع'} · لوحة التحكم`, meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <div class="min-h-screen bg-white" v-if="board">
    <AdminHeader />
    <div class="px-6 sm:px-8 py-6">
      <!-- Header -->
      <div class="max-w-5xl mx-auto mb-6">
        <NuxtLink to="/admin/projects" class="text-[13px] text-ink-mute hover:text-ink transition-colors inline-flex items-center gap-1.5 mb-3">
          <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
          المشاريع
        </NuxtLink>
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold text-ink">{{ board.project.name }}</h1>
            <p class="text-sm text-ink-soft mt-1">{{ board.customer?.name }}</p>
          </div>
          <div class="flex flex-col sm:items-end gap-2">
            <a v-if="board.project.slug" :href="`/p/${board.project.slug}`" target="_blank" class="text-[12px] text-ink-mute hover:text-[#15803D] transition-colors underline underline-offset-2">
              /p/{{ board.project.slug }}
            </a>
            <div class="flex items-center gap-2 text-sm text-ink-mute">
              <span v-if="board.project.start_date" class="text-[13px]">{{ board.project.start_date }}</span>
              <span v-if="board.project.start_date && board.project.end_date">&rarr;</span>
              <span v-if="board.project.end_date" class="text-[13px]">{{ board.project.end_date }}</span>
            </div>
            <div class="w-32">
              <div class="flex items-center justify-between text-[11px] text-ink-mute mb-1">
                <span>{{ progress }}%</span>
              </div>
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div :style="{ width: `${progress}%` }" class="h-full bg-[#15803D] rounded-full transition-all duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="flex gap-4 overflow-x-auto pb-4" style="min-height: 60vh;">
        <div v-for="listKey in listKeys" :key="listKey" class="flex-shrink-0 w-72">
          <div :class="['rounded-2xl overflow-hidden', listColors[listKey]]">
            <!-- Column Header -->
            <div :class="['px-4 py-3 text-sm font-bold', listHeaderColors[listKey]]">
              {{ board.lists?.[listKey]?.label || listKey }}
              <span class="mr-1 text-xs font-normal opacity-70">{{ getCards(listKey).length }}</span>
            </div>

            <!-- Cards -->
            <div
              class="p-2 space-y-2 min-h-[120px]"
              @dragover="onDragOver"
              @drop="(e) => onDrop(e, listKey)"
            >
              <div
                v-for="card in getCards(listKey)"
                :key="card.id"
                :draggable="true"
                @dragstart="(e) => onDragStart(e, card.id, listKey)"
                class="bg-white rounded-xl p-3 shadow-sm border border-black/[0.04] cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md"
              >
                <!-- Card Header -->
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <div v-if="editCardTitle?.id === card.id">
                      <input
                        v-model="editCardTitle.title"
                        @blur="updateCardTitle(card.id, editCardTitle.title)"
                        @keyup.enter="updateCardTitle(card.id, editCardTitle.title)"
                        @keyup.escape="editCardTitle = null"
                        class="w-full text-sm font-semibold border-b border-black/20 px-1 py-0.5 bg-transparent outline-none"
                        autofocus
                      />
                    </div>
                    <div v-else @click="editCardTitle = { id: card.id, title: card.title }" class="text-sm font-semibold text-ink cursor-text">
                      {{ card.title }}
                    </div>
                  </div>
                  <button @click.stop="deleteCard(card.id)" class="text-ink-mute hover:text-red-500 transition-colors flex-shrink-0">
                    <Icon name="lucide:x" class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Person Name -->
                <div v-if="editPersonName?.id === card.id" class="mt-2">
                  <input
                    v-model="editPersonName.name"
                    @blur="updatePersonName(card.id, editPersonName.name)"
                    @keyup.enter="updatePersonName(card.id, editPersonName.name)"
                    @keyup.escape="editPersonName = null"
                    class="w-full text-xs border border-black/10 rounded-lg px-2 py-1 bg-transparent outline-none"
                    autofocus
                    placeholder="اسم الشخص"
                  />
                </div>
                <div v-else @click="editPersonName = { id: card.id, name: card.person_name }" class="mt-1.5">
                  <span v-if="card.person_name" class="text-[11px] text-ink-mute inline-flex items-center gap-1 cursor-text">
                    <Icon name="lucide:user" class="w-3 h-3" />
                    {{ card.person_name }}
                  </span>
                  <span v-else class="text-[11px] text-ink-mute/40 cursor-text inline-flex items-center gap-1">
                    <Icon name="lucide:user-plus" class="w-3 h-3" />
                    أضف شخص
                  </span>
                </div>

                <!-- Card Status Selector -->
                <div class="mt-2">
                  <select
                    :value="card.list_key"
                    @change="moveCard(card.id, ($event.target as HTMLSelectElement).value)"
                    class="w-full text-[11px] border border-black/[0.06] rounded-lg px-2 py-1 bg-transparent outline-none cursor-pointer appearance-none"
                    :disabled="changingCard === card.id"
                  >
                    <option v-for="k in listKeys" :key="k" :value="k" class="text-ink">{{ listLabels[k] }}</option>
                  </select>
                </div>

                <!-- Checklist Summary -->
                <div v-if="card.checklist?.length" @click="expandedCard = expandedCard === card.id ? null : card.id" class="mt-2 cursor-pointer">
                  <div class="flex items-center gap-2 text-[11px] text-ink-mute">
                    <div class="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        :style="{ width: `${totalCount(card) ? (completedCount(card) / totalCount(card)) * 100 : 0}%` }"
                        class="h-full bg-[#15803D] rounded-full transition-all"
                      ></div>
                    </div>
                    <span class="whitespace-nowrap">{{ completedCount(card) }}/{{ totalCount(card) }}</span>
                  </div>
                </div>

                <!-- Expanded Checklist -->
                <div v-if="expandedCard === card.id" class="mt-3 space-y-1.5 border-t border-black/[0.04] pt-3" @click.stop>
                  <div v-for="item in card.checklist" :key="item.id" class="flex items-start gap-2 group">
                    <button @click="toggleChecklist(item)" :class="['w-4 h-4 mt-0.5 rounded border-2 flex-shrink-0 transition-colors', item.is_complete ? 'bg-[#15803D] border-[#15803D]' : 'border-gray-300 hover:border-gray-400']">
                      <Icon v-if="item.is_complete" name="lucide:check" class="w-3 h-3 text-white" />
                    </button>
                    <div class="flex-1 min-w-0">
                      <div :class="['text-[13px]', item.is_complete ? 'line-through text-ink-mute/50' : 'text-ink']">
                        {{ item.title }}
                      </div>
                      <div v-if="item.assigned_to" class="text-[11px] text-ink-mute mt-0.5">
                        {{ item.assigned_to }}
                      </div>
                    </div>
                    <button @click="deleteChecklistItem(item.id)" class="opacity-0 group-hover:opacity-100 text-ink-mute hover:text-red-500 transition-all">
                      <Icon name="lucide:x" class="w-3 h-3" />
                    </button>
                  </div>

                  <!-- Add checklist item -->
                  <div v-if="addingChecklist === card.id" class="mt-2">
                    <input
                      v-model="newChecklistTitle"
                      @keyup.enter="addChecklistItem(card.id)"
                      @keyup.escape="addingChecklist = null"
                      class="w-full text-xs border border-black/10 rounded-lg px-3 py-1.5 outline-none"
                      placeholder="عنوان المهمة"
                      autofocus
                    />
                    <input
                      v-model="newChecklistPerson"
                      @keyup.enter="addChecklistItem(card.id)"
                      class="w-full text-xs border border-black/10 rounded-lg px-3 py-1.5 outline-none mt-1"
                      placeholder="اسم الشخص (اختياري)"
                    />
                  </div>
                  <button v-else @click="addingChecklist = card.id; newChecklistTitle = ''; newChecklistPerson = ''" class="text-xs text-ink-mute hover:text-ink transition-colors inline-flex items-center gap-1">
                    <Icon name="lucide:plus" class="w-3 h-3" />
                    أضف مهمة
                  </button>
                </div>
              </div>
            </div>

            <!-- Add Card Input -->
            <div v-if="addingCard === listKey" class="p-2 pt-0">
              <input
                v-model="newCardTitle"
                @keyup.enter="addCard(listKey)"
                @keyup.escape="addingCard = null"
                class="w-full text-sm border border-black/10 rounded-xl px-3 py-2.5 bg-white outline-none"
                autofocus
                placeholder="عنوان البطاقة"
              />
            </div>
            <div v-else class="p-2 pt-0">
              <button @click="addingCard = listKey; newCardTitle = ''" class="w-full text-sm text-ink-mute hover:text-ink hover:bg-white/50 rounded-xl py-2 transition-colors inline-flex items-center justify-center gap-1.5">
                <Icon name="lucide:plus" class="w-4 h-4" />
                أضف بطاقة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
