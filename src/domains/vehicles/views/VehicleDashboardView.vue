<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVehicle } from '../composables/useVehicles'
import { useReminders } from '../composables/useVehicles'
import { useSyncPlanTasks, useConvertPlan, useAssignPlan } from '../composables/usePlans'
import { usePreferredUnit } from '@/domains/auth/composables/usePreferredUnit'
import type { Vehicle, Reminder, MaintenancePlanTask } from '../types'

interface EditableTask extends MaintenancePlanTask {
  _new?: boolean
}

const route = useRoute()
const router = useRouter()
const vehicleId = Number(route.params.id)

const { query: vehicleQuery } = useVehicle(vehicleId)
const { isPending: vehicleLoading, data: vehicleData } = vehicleQuery
const { query: remindersQuery } = useReminders(vehicleId)
const { data: remindersData } = remindersQuery

const vehicle = computed(() => vehicleData.value as unknown as Vehicle | undefined)
const allReminders = computed(() => (remindersData.value as unknown as Reminder[] | undefined) ?? [])
const overdueReminders = computed(() => allReminders.value.filter((r) => r.status === 'overdue'))
const upcomingReminders = computed(() => allReminders.value.filter((r) => r.status === 'upcoming'))

const { mutation: syncMutation } = useSyncPlanTasks()
const { isPending: syncPending } = syncMutation
const { mutation: convertMutation } = useConvertPlan()
const { isPending: convertPending } = convertMutation
const { mutation: assignMutation } = useAssignPlan()

const editing = ref(false)
const editTasks = ref<Partial<EditableTask>[]>([])

const plan = computed(() => vehicle.value?.maintenance_plan)
const isPredefined = computed(() => plan.value?.is_predefined ?? false)

const startEditing = async () => {
  if (isPredefined.value && plan.value) {
    const newPlan = await convertMutation.mutateAsync(plan.value.id)
    await assignMutation.mutateAsync({ vehicleId, planId: newPlan.id })
    editTasks.value = newPlan.tasks.map((t) => ({ ...t }))
  } else if (plan.value) {
    editTasks.value = plan.value.tasks.map((t) => ({ ...t }))
  }
  editing.value = true
}

const cancelEditing = () => {
  editing.value = false
  editTasks.value = []
}

const addTask = () => {
  editTasks.value.push({ name: '', description: '', frequency_km: null, frequency_time_months: null, is_active: true, _new: true })
}

const removeEditTask = (index: number) => {
  editTasks.value.splice(index, 1)
}

const saveTasks = async () => {
  if (!plan.value) return
  const planId = plan.value.id
  const tasks = editTasks.value.map((t) => ({
    id: (t as EditableTask)._new ? undefined : t.id,
    name: t.name ?? '',
    description: t.description ?? null,
    frequency_km: t.frequency_km ?? null,
    frequency_time_months: t.frequency_time_months ?? null,
    is_active: t.is_active ?? true,
  }))
  await syncMutation.mutateAsync({ planId, tasks })
  editing.value = false
  editTasks.value = []
}

const { unit, displayUnit } = usePreferredUnit()

const goTo = (path: string) => router.push(`/vehicles/${vehicleId}${path}`)

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
</script>

<template>
  <div v-if="vehicleLoading" class="text-center py-12 text-gray-500">Loading...</div>

  <div v-else-if="vehicle" class="max-w-4xl mx-auto">
    <button @click="router.push('/dashboard')" class="bg-none border-none text-[#1a1a2e] cursor-pointer text-sm p-0 mb-4 hover:underline">&larr; Back to Dashboard</button>

    <div v-if="!vehicle.maintenance_plan" class="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-xl px-6 py-4 mb-4 flex items-center justify-between">
      <p class="m-0">No maintenance plan set up yet.</p>
      <button @click="goTo('/plan')" class="px-6 py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer hover:bg-[#16213e]">Set Up Plan</button>
    </div>

    <div v-if="overdueReminders.length > 0" class="bg-red-100 border border-red-300 text-red-800 rounded-xl px-6 py-4 mb-3">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-lg">&#9888;</span>
        <h3 class="text-base font-semibold m-0">Overdue Tasks ({{ overdueReminders.length }})</h3>
      </div>
      <ul class="m-0 pl-7">
        <li v-for="r in overdueReminders" :key="r.task_id" class="text-sm mb-1">
          {{ r.task_name }}
          <span v-if="r.next_due_km"> - Due at {{ displayUnit(r.next_due_km) }}</span>
          <span v-if="r.next_due_date"> - Due by {{ r.next_due_date }}</span>
        </li>
      </ul>
    </div>

    <div v-if="upcomingReminders.length > 0" class="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-xl px-6 py-4 mb-3">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-lg">&#9200;</span>
        <h3 class="text-base font-semibold m-0">Upcoming Tasks ({{ upcomingReminders.length }})</h3>
      </div>
      <ul class="m-0 pl-7">
        <li v-for="r in upcomingReminders" :key="r.task_id" class="text-sm mb-1">
          {{ r.task_name }}
          <span v-if="r.next_due_km"> - Due at {{ displayUnit(r.next_due_km) }}</span>
          <span v-if="r.next_due_date"> - Due by {{ r.next_due_date }}</span>
        </li>
      </ul>
    </div>

    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-2xl font-bold text-[#1a1a2e] m-0">{{ vehicle.nickname }}</h1>
        <p class="text-gray-500 text-sm m-0">{{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }})</p>
        <p v-if="vehicle.plate" class="text-gray-500 text-sm m-0">Plate: {{ vehicle.plate }}</p>
      </div>
      <div class="bg-[#1a1a2e] text-white px-5 py-3 rounded-xl text-lg font-semibold">
        <strong>{{ displayUnit(vehicle.mileage) }}</strong>
      </div>
    </div>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mb-8">
      <button @click="goTo('/mileage')" class="bg-white border border-gray-200 rounded-xl p-5 text-left cursor-pointer transition-shadow hover:shadow-lg">
        <strong class="block mb-1">Update Mileage</strong>
        <small class="text-gray-500">Current: {{ displayUnit(vehicle.mileage) }}</small>
      </button>
      <button @click="goTo('/add-maintenance')" class="bg-white border border-gray-200 rounded-xl p-5 text-left cursor-pointer transition-shadow hover:shadow-lg">
        <strong class="block mb-1">Add Maintenance</strong>
        <small class="text-gray-500">Record a service</small>
      </button>
      <button @click="goTo('/history')" class="bg-white border border-gray-200 rounded-xl p-5 text-left cursor-pointer transition-shadow hover:shadow-lg">
        <strong class="block mb-1">History</strong>
        <small class="text-gray-500">{{ (vehicle.maintenance_records ?? []).length }} records</small>
      </button>
      <button @click="goTo('/export')" class="bg-white border border-gray-200 rounded-xl p-5 text-left cursor-pointer transition-shadow hover:shadow-lg">
        <strong class="block mb-1">Export Data</strong>
        <small class="text-gray-500">Download vehicle data</small>
      </button>
    </div>

    <!-- Plan Section -->
    <div v-if="plan">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-[#1a1a2e] m-0">Maintenance Plan: {{ plan.name }}</h2>
        <button v-if="!editing" @click="startEditing" :disabled="convertPending" class="px-4 py-2 border border-gray-300 rounded-lg font-medium text-sm cursor-pointer hover:bg-gray-100 disabled:opacity-60">
          {{ convertPending ? 'Converting...' : 'Edit Plan' }}
        </button>
      </div>

      <!-- Read-only view -->
      <div v-if="!editing" class="bg-white rounded-xl shadow">
        <div v-for="task in plan.tasks" :key="task.id" @click="router.push(`/vehicles/${vehicleId}/tasks/${task.id}`)" class="flex justify-between items-center px-6 py-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors">
          <div>
            <strong class="text-sm">{{ task.name }}</strong>
            <p v-if="task.description" class="text-gray-500 text-xs mt-1 m-0">{{ task.description }}</p>
          </div>
          <div class="text-xs text-right">
            <template v-if="task.next_maintenance">
              <span v-if="task.next_maintenance.remaining_km !== null" :class="['block', task.next_maintenance.status === 'overdue' ? 'text-red-600' : 'text-gray-500']">
                {{ displayUnit(task.next_maintenance.remaining_km) }} left
              </span>
              <span v-if="task.next_maintenance.remaining_days !== null" :class="['block', task.next_maintenance.status === 'overdue' ? 'text-red-600' : 'text-gray-500']">
                {{ friendlyTime(task.next_maintenance.remaining_days) }} left
              </span>
            </template>
            <template v-else>
              <span v-if="task.frequency_km" class="block text-gray-500">Every {{ displayUnit(task.frequency_km) }}</span>
              <span v-if="task.frequency_time_months" class="block text-gray-500">{{ task.frequency_time_months }} months</span>
            </template>
          </div>
        </div>
      </div>

      <!-- Edit view -->
      <div v-else class="bg-white rounded-xl shadow p-6">
        <div v-for="(task, idx) in editTasks" :key="idx" class="bg-gray-50 rounded-lg p-4 mb-4">
          <div class="flex justify-between items-center mb-3">
            <strong class="text-sm">Task {{ idx + 1 }}</strong>
            <button @click="removeEditTask(idx)" class="bg-none border-none text-red-500 cursor-pointer text-sm">Remove</button>
          </div>
          <div class="mb-3">
            <label class="block mb-1 font-medium text-xs text-gray-700">Name</label>
            <input v-model="task.name" placeholder="Task name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          </div>
          <div class="mb-3">
            <label class="block mb-1 font-medium text-xs text-gray-700">Description</label>
            <input v-model="task.description" placeholder="Optional"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          </div>
          <div class="flex gap-3">
            <div class="flex-1">
              <label class="block mb-1 font-medium text-xs text-gray-700">Frequency ({{ unit }})</label>
              <input v-model.number="task.frequency_km" type="number" min="0" placeholder="e.g., 10000"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
            </div>
            <div class="flex-1">
              <label class="block mb-1 font-medium text-xs text-gray-700">Frequency (months)</label>
              <input v-model.number="task.frequency_time_months" type="number" min="0" placeholder="e.g., 12"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
            </div>
          </div>
        </div>

        <button @click="addTask" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm cursor-pointer hover:bg-gray-300">+ Add Task</button>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="cancelEditing" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm cursor-pointer hover:bg-gray-300">Cancel</button>
          <button @click="saveTasks" :disabled="syncPending" class="px-6 py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#16213e]">
            {{ syncPending ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
