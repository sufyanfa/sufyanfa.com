<template>
  <div class="min-h-screen bg-white">
    <AdminHeader />
    <div class="max-w-5xl mx-auto px-6 sm:px-8 py-10">
      
      <!-- Top header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
            لوحة التحكم
          </div>
          <h1 class="text-3xl font-bold text-ink tracking-tight">واتساب</h1>
        </div>
        <div class="flex gap-3">
          <NuxtLink
            to="/admin/whatsapp/templates"
            class="inline-flex items-center gap-2 bg-cream hover:bg-cream-deep text-ink rounded-full px-5 py-3 text-sm font-semibold transition-colors"
          >
            <Icon name="lucide:file-text" class="w-4 h-4" />
            إدارة القوالب
          </NuxtLink>
          <button
            @click="openDirectSend"
            class="inline-flex items-center gap-2 bg-ink text-white rounded-full px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Icon name="lucide:send" class="w-4 h-4" />
            إرسال رسالة جديدة
          </button>
        </div>
      </div>

      <!-- Overview Info Banner -->
      <section class="bg-[#15803D]/5 border border-[#15803D]/10 rounded-3xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="max-w-xl">
          <h2 class="text-base font-bold text-ink mb-1">تذكيرات مباشرة ومجانية 100%</h2>
          <p class="text-sm text-ink-soft leading-relaxed">
            يتم تجهيز الرسائل التذكيرية تلقائياً من خلال قوالب مخصصة، ثم يتم توجيهك إلى واتساب الشخصي (ويب أو تطبيق) لإرسالها بضغطة زر واحدة. بدون أي سيرفرات أو تعقيدات أو تكاليف إضافية.
          </p>
        </div>
        <div class="flex items-center gap-2 text-[#15803D] bg-white border border-[#15803D]/15 rounded-2xl px-4 py-3 text-sm font-semibold flex-shrink-0">
          <Icon name="lucide:check-circle" class="w-5 h-5" />
          <span>جاهز للعمل مجاناً</span>
        </div>
      </section>

      <!-- Main Section: Messages History -->
      <section class="bg-cream-deep rounded-3xl p-6">
        <h2 class="text-lg font-semibold mb-4 text-ink flex items-center gap-2">
          <Icon name="lucide:history" class="w-5 h-5 text-ink-soft" />
          سجل الرسائل المرسلة
        </h2>

        <div v-if="pending" class="text-center py-12 text-ink-soft text-sm">
          جارٍ تحميل السجل...
        </div>

        <div v-else-if="!messages.length" class="text-center py-16 text-ink-mute text-sm">
          لم يتم إرسال أي رسائل تذكيرية بعد.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm text-right">
            <thead>
              <tr class="text-[11px] font-semibold uppercase tracking-wide text-ink-mute border-b border-black/[0.06] pb-3">
                <th class="py-3 px-4 font-semibold text-start">العميل / المستلم</th>
                <th class="py-3 px-4 font-semibold text-start">نص الرسالة</th>
                <th class="py-3 px-4 font-semibold text-center">القالب</th>
                <th class="py-3 px-4 font-semibold text-center">مرتبطة بـ</th>
                <th class="py-3 px-4 font-semibold text-end">تاريخ الإرسال</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="msg in messages"
                :key="msg.id"
                class="border-b border-black/[0.04] last:border-0 hover:bg-white/60 transition-colors"
              >
                <!-- Customer Name & Phone -->
                <td class="py-3.5 px-4 text-start">
                  <div class="font-semibold text-ink">
                    <span v-if="msg.customer_name">{{ msg.customer_name }}</span>
                    <span v-else class="text-ink-mute">—</span>
                  </div>
                  <div class="text-[12px] text-ink-mute mt-0.5 font-mono" dir="ltr">
                    {{ msg.phone }}
                  </div>
                </td>
                
                <!-- Message text snippet -->
                <td class="py-3.5 px-4 text-start max-w-xs md:max-w-md">
                  <div class="text-xs text-ink-soft line-clamp-2 leading-relaxed" :title="msg.body">
                    {{ msg.body }}
                  </div>
                </td>

                <!-- Template used -->
                <td class="py-3.5 px-4 text-center text-xs">
                  <span
                    v-if="msg.template_name"
                    class="inline-block px-2 py-0.5 bg-white text-ink-soft border border-black/[0.06] rounded-md"
                  >
                    {{ msg.template_name }}
                  </span>
                  <span v-else class="text-ink-mute text-[11px]">مخصصة</span>
                </td>

                <!-- Reference Link -->
                <td class="py-3.5 px-4 text-center text-xs font-mono">
                  <div v-if="msg.ref_type === 'invoice'">
                    <NuxtLink
                      :to="`/admin/invoices/${msg.ref_id}`"
                      class="inline-flex items-center gap-1 text-[#15803D] hover:underline"
                    >
                      <Icon name="lucide:file-text" class="w-3.5 h-3.5" />
                      فاتورة #{{ msg.ref_id }}
                    </NuxtLink>
                  </div>
                  <div v-else-if="msg.ref_type === 'proposal'">
                    <NuxtLink
                      :to="`/admin/proposals/${msg.ref_id}`"
                      class="inline-flex items-center gap-1 text-[#15803D] hover:underline"
                    >
                      <Icon name="lucide:file" class="w-3.5 h-3.5" />
                      عرض #{{ msg.ref_id }}
                    </NuxtLink>
                  </div>
                  <span v-else class="text-ink-mute">—</span>
                </td>

                <!-- Timestamp -->
                <td class="py-3.5 px-4 text-end text-xs text-ink-mute" dir="ltr">
                  {{ formatDate(msg.sent_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>

    <!-- WhatsApp Send Modal -->
    <AdminWhatsAppSendModal
      v-model="modalOpen"
      :customer-id="selectedCustomer?.id"
      :customer-name="selectedCustomer?.name || 'عميل عام'"
      :customer-phone="selectedCustomer?.phone"
      @sent="refresh"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'bare', middleware: 'admin-auth' })

interface Customer {
  id: number
  name: string
  phone: string | null
}

interface MessageLog {
  id: number
  phone: string
  body: string
  customer_name: string | null
  template_name: string | null
  ref_type: string | null
  ref_id: number | null
  sent_at: number
}

const modalOpen = ref(false)
const selectedCustomer = ref<Customer | null>(null)

const { data: customersData } = await useFetch<{ customers: Customer[] }>('/api/admin/customers')
const { data, pending, refresh } = await useFetch<{ messages: MessageLog[] }>('/api/admin/whatsapp/messages')

const messages = computed(() => data.value?.messages ?? [])

function openDirectSend() {
  selectedCustomer.value = null
  modalOpen.value = true
}

function formatDate(ms: number) {
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(ms))
  } catch {
    return new Date(ms).toLocaleString()
  }
}

useHead({
  title: 'واتساب · لوحة التحكم',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>
