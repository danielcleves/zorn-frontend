<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { useVehicle } from '../composables/useVehicles'
import { useRecords } from '../composables/useRecords'
import { addMaintenanceSchema } from '../schemas'
import { usePreferredUnit } from '@/domains/auth/composables/usePreferredUnit'
import type { Vehicle, MaintenancePlanTask, CreateRecordPayload } from '../types'

const route = useRoute()
const router = useRouter()
const vehicleId = Number(route.params.id)

const { query: vehicleQuery } = useVehicle(vehicleId)
const { data: vehicleData } = vehicleQuery
const { createMutation } = useRecords(vehicleId)
const { isPending } = createMutation

const vehicle = computed(() => vehicleData.value as unknown as Vehicle | undefined)
const tasks = computed<MaintenancePlanTask[]>(() => vehicle.value?.maintenance_plan?.tasks ?? [])

const { defineField, errors, handleSubmit } = useForm<CreateRecordPayload>({
  validationSchema: addMaintenanceSchema,
})

const [date] = defineField('date')
const [mileage] = defineField('mileage')
const [cost] = defineField('cost')
const [notes] = defineField('notes')
const [isReviewOnly] = defineField('is_review_only')

const selectedTaskId = ref<number | null>(null)
const selectedTaskName = ref('')

const selectTask = (id: number) => {
  selectedTaskId.value = id
  const task = tasks.value.find((t) => t.id === id)
  if (task) {
    selectedTaskName.value = task.name
  }
}

const { unit } = usePreferredUnit()

const canSave = computed(() => selectedTaskId.value !== null)

const handleSave = handleSubmit(async (values) => {
  if (!selectedTaskId.value) return
  await createMutation.mutateAsync({
    maintenance_plan_task_id: selectedTaskId.value,
    date: values.date,
    mileage: values.mileage,
    cost: values.cost || undefined,
    notes: values.notes || undefined,
    is_review_only: !!values.is_review_only,
  })
  router.push(`/vehicles/${vehicleId}`)
})
</script>

<template>
  <div class="max-w-lg mx-auto">
    <h1 class="text-2xl font-bold text-[#1a1a2e] mb-6">Add Maintenance</h1>

    <form @submit.prevent="handleSave" class="bg-white p-8 rounded-xl shadow">
      <div class="mb-4">
        <label class="block mb-1.5 font-medium text-sm text-gray-700">Maintenance Type</label>
        <select v-if="selectedTaskId === null" @change="(e: Event) => selectTask(Number((e.target as HTMLSelectElement).value))"
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border font-inherit">
          <option value="">Select a task...</option>
          <option v-for="task in tasks" :key="task.id" :value="task.id">{{ task.name }}</option>
        </select>
        <div v-else class="flex items-center px-3 py-2.5 bg-gray-100 rounded-lg">
          <strong class="text-sm">{{ selectedTaskName }}</strong>
        </div>
      </div>

      <div class="flex gap-4">
        <div class="flex-1 mb-4">
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Date</label>
          <input v-model="date" type="date"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border font-inherit" />
          <span v-if="errors.date" class="text-red-600 text-xs block mt-1">{{ errors.date }}</span>
        </div>
        <div class="flex-1 mb-4">
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Mileage ({{ unit }})</label>
          <input v-model.number="mileage" type="number" min="0"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          <span v-if="errors.mileage" class="text-red-600 text-xs block mt-1">{{ errors.mileage }}</span>
        </div>
      </div>

      <div class="mb-4">
        <label class="block mb-1.5 font-medium text-sm text-gray-700">Cost (optional)</label>
        <input v-model.number="cost" type="number" min="0" step="0.01" placeholder="$"
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
        <span v-if="errors.cost" class="text-red-600 text-xs block mt-1">{{ errors.cost }}</span>
      </div>

      <div class="mb-4 flex items-center gap-3">
        <label class="relative inline-flex items-center cursor-pointer">
          <input v-model="isReviewOnly" type="checkbox" class="sr-only peer" />
          <div class="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
        </label>
        <span class="text-sm text-gray-700 font-medium">Solo revisión (sin mantenimiento)</span>
      </div>

      <div class="mb-4">
        <label class="block mb-1.5 font-medium text-sm text-gray-700">Notes (optional)</label>
        <textarea v-model="notes" rows="3" placeholder="Any additional notes..."
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border font-inherit resize-y"></textarea>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button type="button" @click="router.back()" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm cursor-pointer hover:bg-gray-300">Cancel</button>
        <button type="submit" :disabled="isPending || !canSave" class="px-6 py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#16213e]">
          {{ isPending ? 'Saving...' : 'Save Maintenance' }}
        </button>
      </div>
    </form>
  </div>
</template>
