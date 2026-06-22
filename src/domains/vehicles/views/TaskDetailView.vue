<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVehicle } from '../composables/useVehicles'
import { useSyncPlanTasks, useConvertPlan, useAssignPlan } from '../composables/usePlans'
import { usePreferredUnit } from '@/domains/auth/composables/usePreferredUnit'
import type { Vehicle, MaintenancePlanTask, MaintenanceRecord } from '../types'

const route = useRoute()
const router = useRouter()
const vehicleId = Number(route.params.id)
const taskId = Number(route.params.taskId)

const { query: vehicleQuery } = useVehicle(vehicleId)
const { isPending, data: vehicleData } = vehicleQuery
const { mutation: syncMutation } = useSyncPlanTasks()
const { mutation: convertMutation } = useConvertPlan()
const { mutation: assignMutation } = useAssignPlan()

const vehicle = computed(() => vehicleData.value as unknown as Vehicle | undefined)
const plan = computed(() => vehicle.value?.maintenance_plan)

const task = computed<MaintenancePlanTask | null>(() => {
  if (!plan.value?.tasks) return null
  return plan.value.tasks.find((t: MaintenancePlanTask) => t.id === taskId) ?? null
})

const records = computed<MaintenanceRecord[]>(() => {
  if (!vehicle.value?.maintenance_records) return []
  return vehicle.value.maintenance_records
    .filter((r: MaintenanceRecord) => r.maintenance_plan_task_id === taskId)
    .sort((a: MaintenanceRecord, b: MaintenanceRecord) => b.mileage - a.mileage)
})

const nm = computed(() => task.value?.next_maintenance)
const nr = computed(() => task.value?.next_review)

const editing = ref(false)

const editForm = ref({
  name: '',
  description: '',
  frequency_km: null as number | null,
  frequency_time_months: null as number | null,
  review_frequency_km: null as number | null,
  review_frequency_time_months: null as number | null,
})

watch(task, (t) => {
  if (t) {
    editForm.value = {
      name: t.name,
      description: t.description ?? '',
      frequency_km: t.frequency_km,
      frequency_time_months: t.frequency_time_months,
      review_frequency_km: t.review_frequency_km,
      review_frequency_time_months: t.review_frequency_time_months,
    }
  }
}, { immediate: true })

const startEditing = async () => {
  if (!task.value || !plan.value) return

  let targetPlan = plan.value

  if (targetPlan.is_predefined) {
    const newPlan = await convertMutation.mutateAsync(targetPlan.id)
    await assignMutation.mutateAsync({ vehicleId, planId: newPlan.id })
    targetPlan = newPlan
  }

  editForm.value = {
    name: task.value.name,
    description: task.value.description ?? '',
    frequency_km: task.value.frequency_km,
    frequency_time_months: task.value.frequency_time_months,
    review_frequency_km: task.value.review_frequency_km,
    review_frequency_time_months: task.value.review_frequency_time_months,
  }
  editing.value = true
}

const cancelEditing = () => {
  editing.value = false
}

const saveTask = async () => {
  if (!plan.value || !task.value) return
  await syncMutation.mutateAsync({
    planId: plan.value.id,
    tasks: [{
      id: task.value.id,
      name: editForm.value.name,
      description: editForm.value.description || null,
      frequency_km: editForm.value.frequency_km,
      frequency_time_months: editForm.value.frequency_time_months,
      review_frequency_km: editForm.value.review_frequency_km,
      review_frequency_time_months: editForm.value.review_frequency_time_months,
    }],
  })
  editing.value = false
}

const friendlyTime = (days: number): string => {
  if (days <= 0) return 'Overdue'
  if (days >= 365) {
    const y = Math.floor(days / 365)
    return `${y}y`
  }
  if (days >= 30) {
    const m = Math.floor(days / 30)
    return `${m}mo`
  }
  if (days >= 7) {
    const w = Math.floor(days / 7)
    return `${w}w`
  }
  return `${days}d`
}

const statusColor = (status: string) => {
  if (status === 'overdue') return 'text-red-600'
  if (status === 'upcoming') return 'text-blue-600'
  return 'text-green-600'
}

const { unit, displayUnit } = usePreferredUnit()

const selectedRecordId = ref<number | null>(null)

const selectedRecord = computed<MaintenanceRecord | null>(() => {
  const id = selectedRecordId.value
  if (id === null) return null
  return records.value.find((r) => r.id === id) ?? null
})

const openRecord = (id: number) => {
  selectedRecordId.value = id
}

const closeRecord = () => {
  selectedRecordId.value = null
}
</script>

<template>
  <div v-if="isPending" class="text-center py-12 text-gray-500">Loading...</div>

  <div v-else-if="!task" class="text-center py-12 text-gray-500">Task not found.</div>

  <div v-else class="max-w-3xl mx-auto">
    <button @click="router.push(`/vehicles/${vehicleId}`)" class="bg-none border-none text-[#1a1a2e] cursor-pointer text-sm p-0 mb-4 hover:underline">&larr; Back to Vehicle</button>

    <div class="bg-white rounded-xl p-6 shadow mb-6">
      <div v-if="!editing" class="flex justify-between items-start mb-4">
        <div>
          <h1 class="text-2xl font-bold text-[#1a1a2e] m-0">{{ task.name }}</h1>
          <p v-if="task.description" class="text-gray-500 text-sm mt-1 m-0">{{ task.description }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="nm" :class="['text-sm font-semibold px-3 py-1 rounded-full', statusColor(nm.status)]">
            {{ nm.status === 'overdue' ? 'Overdue' : nm.status === 'upcoming' ? 'Upcoming' : 'OK' }}
          </span>
          <button @click="startEditing" :disabled="convertMutation.isPending.value" class="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed">{{ convertMutation.isPending.value ? 'Converting...' : 'Edit' }}</button>
        </div>
      </div>

      <div v-if="!editing" class="flex gap-6 text-sm">
        <span v-if="task.frequency_km" class="text-gray-500">Every {{ displayUnit(task.frequency_km) }}</span>
        <span v-if="task.frequency_time_months" class="text-gray-500">Every {{ task.frequency_time_months }} months</span>
        <span v-if="task.review_frequency_km" class="text-blue-600">Review every {{ displayUnit(task.review_frequency_km) }}</span>
        <span v-if="task.review_frequency_time_months" class="text-blue-600">Review every {{ task.review_frequency_time_months }} months</span>
      </div>

      <!-- Edit form -->
      <div v-else>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-[#1a1a2e] m-0">Edit Task</h2>
        </div>
        <div class="mb-3">
          <label class="block mb-1 font-medium text-xs text-gray-700">Name</label>
          <input v-model="editForm.name" placeholder="Task name"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
        </div>
        <div class="mb-3">
          <label class="block mb-1 font-medium text-xs text-gray-700">Description</label>
          <input v-model="editForm.description" placeholder="Optional"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
        </div>
        <div class="flex gap-3">
          <div class="flex-1">
            <label class="block mb-1 font-medium text-xs text-gray-700">Maint. Frequency ({{ unit }})</label>
            <input v-model.number="editForm.frequency_km" type="number" min="0" placeholder="e.g., 10000"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          </div>
          <div class="flex-1">
            <label class="block mb-1 font-medium text-xs text-gray-700">Maint. Frequency (months)</label>
            <input v-model.number="editForm.frequency_time_months" type="number" min="0" placeholder="e.g., 12"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          </div>
        </div>
        <div class="flex gap-3 mt-3">
          <div class="flex-1">
            <label class="block mb-1 font-medium text-xs text-gray-700">Review Frequency ({{ unit }})</label>
            <input v-model.number="editForm.review_frequency_km" type="number" min="0" placeholder="e.g., 5000"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          </div>
          <div class="flex-1">
            <label class="block mb-1 font-medium text-xs text-gray-700">Review Frequency (months)</label>
            <input v-model.number="editForm.review_frequency_time_months" type="number" min="0" placeholder="e.g., 6"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="cancelEditing" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm cursor-pointer hover:bg-gray-300">Cancel</button>
          <button @click="saveTask" :disabled="syncMutation.isPending.value" class="px-4 py-2 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#16213e]">
            {{ syncMutation.isPending.value ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="nm" class="bg-white rounded-xl p-6 shadow mb-3">
      <h2 class="text-lg font-bold text-[#1a1a2e] m-0 mb-4">Next Maintenance</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-gray-500 text-xs m-0 mb-1">Due at</p>
          <p class="text-base font-semibold m-0">{{ displayUnit(nm.next_due_km) }}</p>
        </div>
        <div>
          <p class="text-gray-500 text-xs m-0 mb-1">Due by</p>
          <p class="text-base font-semibold m-0">{{ nm.next_due_date ?? 'N/A' }}</p>
        </div>
        <div>
          <p class="text-gray-500 text-xs m-0 mb-1">Remaining {{ unit }}</p>
          <p class="text-base font-semibold m-0">{{ displayUnit(nm.remaining_km) }}</p>
        </div>
        <div>
          <p class="text-gray-500 text-xs m-0 mb-1">Remaining time</p>
          <p class="text-base font-semibold m-0">{{ nm.remaining_days !== null ? friendlyTime(nm.remaining_days) : 'N/A' }}</p>
        </div>
      </div>
    </div>

    <div v-if="nr && (nr.next_due_km !== null || nr.next_due_date !== null)" class="bg-blue-50 rounded-xl p-6 shadow mb-6">
      <h2 class="text-lg font-bold text-[#1a1a2e] m-0 mb-4">🔍 Next Review</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-gray-500 text-xs m-0 mb-1">Due at</p>
          <p class="text-base font-semibold m-0">{{ displayUnit(nr.next_due_km) }}</p>
        </div>
        <div>
          <p class="text-gray-500 text-xs m-0 mb-1">Due by</p>
          <p class="text-base font-semibold m-0">{{ nr.next_due_date ?? 'N/A' }}</p>
        </div>
        <div>
          <p class="text-gray-500 text-xs m-0 mb-1">Remaining {{ unit }}</p>
          <p class="text-base font-semibold m-0">{{ displayUnit(nr.remaining_km) }}</p>
        </div>
        <div>
          <p class="text-gray-500 text-xs m-0 mb-1">Remaining time</p>
          <p class="text-base font-semibold m-0">{{ nr.remaining_days !== null ? friendlyTime(nr.remaining_days) : 'N/A' }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow">
      <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
        <h2 class="text-lg font-bold text-[#1a1a2e] m-0">Maintenance History</h2>
        <span class="text-sm text-gray-500">{{ records.length }} records</span>
      </div>
      <div v-if="records.length === 0" class="text-center py-8 text-gray-500 text-sm">No records for this task.</div>
      <div v-else>
        <div v-for="record in records" :key="record.id" @click="openRecord(record.id)" class="flex justify-between items-center px-6 py-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors">
          <div>
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium m-0">{{ record.date.slice(0, 10) }}</p>
              <span v-if="record.is_review_only" class="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">Revisión</span>
            </div>
            <p class="text-xs text-gray-500 m-0">{{ displayUnit(record.mileage) }}</p>
          </div>
          <div class="text-right">
            <p v-if="record.cost" class="text-sm font-medium m-0">${{ Number(record.cost).toFixed(2) }}</p>
            <p v-if="record.notes" class="text-xs text-gray-500 m-0">{{ record.notes }}</p>
          </div>
        </div>
      </div>
    </div>
    <Teleport to="body">
      <div v-if="selectedRecord" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="closeRecord">
        <div class="fixed inset-0 bg-black/40"></div>
        <div class="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-[#1a1a2e] m-0">Record Detail</h3>
            <button @click="closeRecord" class="bg-none border-none text-gray-400 cursor-pointer text-xl hover:text-gray-600 p-0">&times;</button>
          </div>
          <div class="space-y-3 text-sm">
            <div>
              <span class="text-gray-500 text-xs block">Task Name</span>
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ selectedRecord.task_name }}</span>
                <span v-if="selectedRecord.is_review_only" class="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">Revisión</span>
              </div>
            </div>
            <div>
              <span class="text-gray-500 text-xs block">Date</span>
              <span class="font-medium">{{ selectedRecord.date.slice(0, 10) }}</span>
            </div>
            <div>
              <span class="text-gray-500 text-xs block">Mileage</span>
              <span class="font-medium">{{ displayUnit(selectedRecord.mileage) }}</span>
            </div>
            <div v-if="selectedRecord.cost">
              <span class="text-gray-500 text-xs block">Cost</span>
              <span class="font-medium">${{ Number(selectedRecord.cost).toFixed(2) }}</span>
            </div>
            <div v-if="selectedRecord.notes">
              <span class="text-gray-500 text-xs block">Notes</span>
              <span class="font-medium">{{ selectedRecord.notes }}</span>
            </div>
          </div>
          <button @click="closeRecord" class="mt-6 w-full px-4 py-2 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer hover:bg-[#16213e]">Close</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
