<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useForm } from 'vee-validate'
import { usePlans, useAssignPlan, useCopyPlan, useCreatePlan } from '../composables/usePlans'
import { useVehicleStore } from '../store/vehicleStore'
import { createPlanSchema } from '../schemas'
import { usePreferredUnit } from '@/domains/auth/composables/usePreferredUnit'
import type { MaintenancePlan } from '../types'

const router = useRouter()
const route = useRoute()
const vehicleId = Number(route.params.id)
const store = useVehicleStore()
const { query: plansQuery } = usePlans()
const { data: plansData } = plansQuery
const { mutation: assignMutation } = useAssignPlan()
const { isPending: assignPending } = assignMutation
const { mutation: copyMutation } = useCopyPlan()
const { isPending: copyPending } = copyMutation
const { mutation: createPlanMutation } = useCreatePlan()
const { isPending: createPending } = createPlanMutation

const mode = ref<'choose' | 'create'>('choose')
const selectedPlanId = ref<number | null>(null)
const selectedSourceVehicleId = ref<number | null>(null)
const customTasks = ref<{ name: string; description: string; frequency_km: number | null; frequency_time_months: number | null; review_frequency_km: number | null; review_frequency_time_months: number | null }[]>(
  [{ name: '', description: '', frequency_km: null, frequency_time_months: null, review_frequency_km: null, review_frequency_time_months: null }]
)

const otherVehicles = computed(() =>
  store.vehicles.filter((v) => v.id !== vehicleId)
)

const resolvedPlansData = computed(() => plansData.value as unknown as { predefined: MaintenancePlan[]; custom: MaintenancePlan[] } | undefined)
const predefinedPlans = computed(() => resolvedPlansData.value?.predefined ?? [])

const { defineField, errors, handleSubmit } = useForm<{ name: string }>({
  validationSchema: createPlanSchema,
})

const [planName] = defineField('name')

const addTask = () => {
  customTasks.value.push({ name: '', description: '', frequency_km: null, frequency_time_months: null, review_frequency_km: null, review_frequency_time_months: null })
}

const removeTask = (index: number) => {
  customTasks.value.splice(index, 1)
}

const handleSelectPlan = async () => {
  if (selectedPlanId.value) {
    await assignMutation.mutateAsync({ vehicleId, planId: selectedPlanId.value })
    router.push(`/vehicles/${vehicleId}`)
  }
}

const handleCopyPlan = async () => {
  if (selectedSourceVehicleId.value) {
    await copyMutation.mutateAsync({ vehicleId, sourceVehicleId: selectedSourceVehicleId.value })
    router.push(`/vehicles/${vehicleId}`)
  }
}

const handleCreateAndAssign = handleSubmit(async () => {
  if (customTasks.value.length === 0) return
  const validTasks = customTasks.value.filter((t) => t.name)
  if (validTasks.length === 0) return
  const plan = await createPlanMutation.mutateAsync({
    name: planName.value,
    tasks: validTasks.map((t) => ({
      name: t.name,
      description: t.description || undefined,
      frequency_km: t.frequency_km ?? undefined,
      frequency_time_months: t.frequency_time_months ?? undefined,
      review_frequency_km: t.review_frequency_km ?? undefined,
      review_frequency_time_months: t.review_frequency_time_months ?? undefined,
    })),
  })
  await assignMutation.mutateAsync({ vehicleId, planId: plan.id })
  router.push(`/vehicles/${vehicleId}`)
})

const { unit, displayUnit } = usePreferredUnit()

const skip = () => {
  router.push(`/vehicles/${vehicleId}`)
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-[#1a1a2e] mb-1">Maintenance Plan</h1>
    <p class="text-gray-500 mb-8">Choose how to set up maintenance for your vehicle.</p>

    <div v-if="mode === 'choose'" class="flex flex-col gap-4">
      <div @click="mode = 'create'" class="bg-white border-2 border-transparent rounded-xl p-6 shadow cursor-pointer transition-colors hover:border-[#1a1a2e]">
        <h3 class="text-lg font-semibold mb-2">Create Custom Plan</h3>
        <p class="text-gray-500 text-sm">Add your own maintenance tasks with custom frequencies.</p>
      </div>

      <div v-if="predefinedPlans.length" class="bg-white border-2 border-transparent rounded-xl p-6 shadow transition-colors" :class="{ 'border-[#1a1a2e]': !!selectedPlanId }">
        <h3 class="text-lg font-semibold mb-2">Usar Plan Predeterminado</h3>
        <p class="text-gray-500 text-sm mb-4">Seleccioná un plan para ver sus tareas.</p>
        <div class="flex flex-col gap-3 mb-4">
          <div
            v-for="plan in predefinedPlans"
            :key="plan.id"
            @click="selectedPlanId = plan.id"
            class="border border-gray-200 rounded-xl p-4 cursor-pointer transition-colors hover:border-[#1a1a2e]"
            :class="{ 'border-[#1a1a2e] bg-gray-50': selectedPlanId === plan.id }"
          >
            <div class="flex items-center gap-2 mb-2">
              <input type="radio" :value="plan.id" v-model="selectedPlanId" @click.stop />
              <strong class="text-base">{{ plan.name }}</strong>
            </div>
            <div v-if="selectedPlanId === plan.id && plan.tasks?.length" class="pl-6 border-t border-gray-100 pt-3 mt-1">
              <div v-for="task in plan.tasks" :key="task.id" class="flex justify-between items-start py-2 text-sm border-b border-gray-50 last:border-b-0">
                <div class="flex-1">
                  <strong class="block text-gray-800">{{ task.name }}</strong>
                  <span v-if="task.description" class="text-gray-500 text-xs">{{ task.description }}</span>
                </div>
                <div class="text-right text-xs text-gray-500 ml-4 whitespace-nowrap">
                  <span v-if="task.frequency_km" class="block">Cada {{ displayUnit(task.frequency_km) }}</span>
                  <span v-if="task.frequency_time_months" class="block">Cada {{ task.frequency_time_months }} meses</span>
                  <span v-if="task.review_frequency_km" class="block text-blue-600">Rev: cada {{ displayUnit(task.review_frequency_km) }}</span>
                  <span v-if="task.review_frequency_time_months" class="block text-blue-600">Rev: cada {{ task.review_frequency_time_months }} meses</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button v-if="selectedPlanId" @click="handleSelectPlan" :disabled="assignPending" class="px-6 py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#16213e]">
          {{ assignPending ? 'Asignando...' : 'Usar Este Plan' }}
        </button>
      </div>

      <div v-if="otherVehicles.length" class="bg-white border-2 border-transparent rounded-xl p-6 shadow cursor-pointer transition-colors hover:border-[#1a1a2e]" :class="{ 'border-[#1a1a2e]': selectedSourceVehicleId }">
        <h3 class="text-lg font-semibold mb-2">Copy Plan from Another Vehicle</h3>
        <p class="text-gray-500 text-sm mb-4">Copy the maintenance plan from one of your existing vehicles.</p>
        <div class="flex flex-col gap-2 mb-4">
          <label v-for="v in otherVehicles" :key="v.id" class="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" :value="v.id" v-model="selectedSourceVehicleId" />
            {{ v.nickname }} ({{ v.brand }} {{ v.model }})
          </label>
        </div>
        <button v-if="selectedSourceVehicleId" @click="handleCopyPlan" :disabled="copyPending" class="px-6 py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#16213e]">
          {{ copyPending ? 'Copying...' : 'Copy Plan' }}
        </button>
      </div>

      <button @click="skip" class="self-start px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm cursor-pointer hover:bg-gray-300">Skip for now</button>
    </div>

    <div v-else class="bg-white p-8 rounded-xl shadow">
      <div class="mb-4">
        <label class="block mb-1.5 font-medium text-sm text-gray-700">Plan Name</label>
        <input v-model="planName" placeholder="e.g., My Maintenance Plan"
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
        <span v-if="errors.name" class="text-red-600 text-xs block mt-1">{{ errors.name }}</span>
      </div>
      <h3 class="text-lg font-semibold mb-4">Tasks</h3>
      <div v-for="(task, index) in customTasks" :key="index" class="bg-gray-50 rounded-lg p-5 mb-4">
        <div class="flex justify-between items-center mb-4">
          <strong class="text-sm">Task {{ index + 1 }}</strong>
          <button v-if="customTasks.length > 1" @click="removeTask(index)" class="bg-none border-none text-red-500 cursor-pointer text-sm">Remove</button>
        </div>
        <div class="mb-4">
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Name</label>
          <input v-model="task.name" placeholder="e.g., Oil Change"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
        </div>
        <div class="mb-4">
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Description</label>
          <input v-model="task.description" placeholder="Optional description"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block mb-1.5 font-medium text-sm text-gray-700">Maint. Frequency ({{ unit }})</label>
            <input v-model.number="task.frequency_km" type="number" min="0" placeholder="e.g., 10000"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          </div>
          <div class="flex-1">
            <label class="block mb-1.5 font-medium text-sm text-gray-700">Maint. Frequency (months)</label>
            <input v-model.number="task.frequency_time_months" type="number" min="0" placeholder="e.g., 12"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          </div>
        </div>
        <div class="flex gap-4 mt-4">
          <div class="flex-1">
            <label class="block mb-1.5 font-medium text-sm text-gray-700">Review Frequency ({{ unit }})</label>
            <input v-model.number="task.review_frequency_km" type="number" min="0" placeholder="e.g., 5000"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          </div>
          <div class="flex-1">
            <label class="block mb-1.5 font-medium text-sm text-gray-700">Review Frequency (months)</label>
            <input v-model.number="task.review_frequency_time_months" type="number" min="0" placeholder="e.g., 6"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          </div>
        </div>
      </div>
      <button @click="addTask" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm cursor-pointer hover:bg-gray-300">+ Add Task</button>
      <div class="flex justify-end gap-3 mt-6">
        <button @click="mode = 'choose'" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm cursor-pointer hover:bg-gray-300">Back</button>
        <button @click="handleCreateAndAssign" :disabled="createPending" class="px-6 py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#16213e]">
          {{ createPending ? 'Saving...' : 'Save Plan' }}
        </button>
      </div>
    </div>
  </div>
</template>
