<template>
  <UModal v-model="isOpen" :ui="{ width: 'w-full max-w-md mx-4' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            طلب خدمة: {{ selectedService }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="lucide:x"
            class="-my-1"
            @click="isOpen = false"
          />
        </div>
      </template>

      <!-- Success State -->
      <div v-if="showSuccess" class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <Icon name="lucide:check" class="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 class="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
          تم إرسال طلبك بنجاح!
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          سنتواصل معك في أقرب وقت ممكن
        </p>
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="submitForm" class="space-y-4">
        <UFormGroup label="الاسم" name="name" required>
          <UInput
            v-model="form.name"
            placeholder="أدخل اسمك الكامل"
            :disabled="loading"
            required
          />
        </UFormGroup>

        <UFormGroup label="البريد الإلكتروني" name="email" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="example@domain.com"
            :disabled="loading"
            required
          />
        </UFormGroup>

        <UFormGroup label="رقم الهاتف (اختياري)" name="phone">
          <UInput
            v-model="form.phone"
            type="tel"
            placeholder="+966 5X XXX XXXX"
            :disabled="loading"
          />
        </UFormGroup>

        <UFormGroup label="تفاصيل المشروع" name="message" required>
          <UTextarea
            v-model="form.message"
            placeholder="اكتب تفاصيل مشروعك ومتطلباتك هنا..."
            :rows="4"
            :disabled="loading"
            required
          />
        </UFormGroup>

        <div class="flex justify-end gap-3 pt-4">
          <UButton
            type="button"
            color="gray"
            variant="soft"
            @click="isOpen = false"
            :disabled="loading"
          >
            إلغاء
          </UButton>
          <UButton
            type="submit"
            :loading="loading"
            color="black"
            :disabled="!isFormValid"
          >
            إرسال الطلب
          </UButton>
        </div>
      </form>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
interface ServiceContactForm {
  name: string
  email: string
  phone: string
  message: string
}

const props = defineProps<{
  modelValue: boolean
  selectedService: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = ref<ServiceContactForm>({
  name: '',
  email: '',
  phone: '',
  message: ''
})

const loading = ref(false)
const showSuccess = ref(false)

const isFormValid = computed(() => {
  return form.value.name.trim() &&
         form.value.email.trim() &&
         form.value.message.trim()
})

const toast = useToast()

const submitForm = async () => {
  if (!isFormValid.value) return

  loading.value = true

  try {
    const response = await $fetch<{ success: boolean; messageId?: string }>('/api/contact', {
      method: 'POST',
      body: {
        ...form.value,
        service: props.selectedService
      }
    })

    // Show success state
    showSuccess.value = true

    // Show success message
    toast.add({
      title: 'تم إرسال طلبك بنجاح! ✅',
      description: 'سنتواصل معك في أقرب وقت ممكن',
      color: 'green',
      timeout: 5000
    })

    // Reset form after showing success
    setTimeout(() => {
      form.value = {
        name: '',
        email: '',
        phone: '',
        message: ''
      }
      showSuccess.value = false
      isOpen.value = false
    }, 2000)
  } catch (error) {
    console.error('Contact form error:', error)
    toast.add({
      title: 'حدث خطأ ❌',
      description: 'يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة',
      color: 'red',
      timeout: 7000
    })
  } finally {
    loading.value = false
  }
}

// Reset form when modal closes
watch(isOpen, (newValue) => {
  if (!newValue) {
    form.value = {
      name: '',
      email: '',
      phone: '',
      message: ''
    }
    showSuccess.value = false
  }
})
</script>