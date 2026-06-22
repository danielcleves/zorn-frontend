<script setup lang="ts">
defineProps<{
  show: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:show': [value: boolean]
}>()

const handleCancel = () => {
  emit('cancel')
  emit('update:show', false)
}

const handleConfirm = () => {
  emit('confirm')
  emit('update:show', false)
}

const handleBackdrop = () => {
  handleCancel()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="handleBackdrop">
      <div class="fixed inset-0 bg-black/40" @click="handleBackdrop"></div>
      <div class="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 class="text-lg font-bold text-[#1a1a2e] mb-2">{{ title ?? 'Confirm' }}</h3>
        <p class="text-sm text-gray-600 mb-6">{{ message }}</p>
        <div class="flex justify-end gap-3">
          <button @click="handleCancel"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm cursor-pointer hover:bg-gray-300">
            {{ cancelText ?? 'Cancel' }}
          </button>
          <button @click="handleConfirm"
            :class="['px-4 py-2 rounded-lg font-medium text-sm cursor-pointer', variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-[#1a1a2e] text-white hover:bg-[#16213e]']">
            {{ confirmText ?? 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
