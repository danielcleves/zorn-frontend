<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { useVehicle } from '../composables/useVehicles'
import { useUpdateMileage } from '../composables/useMileage'
import { updateMileageSchema } from '../schemas'
import { usePreferredUnit } from '@/domains/auth/composables/usePreferredUnit'
import type { Vehicle } from '../types'

const route = useRoute()
const router = useRouter()
const vehicleId = Number(route.params.id)

const { query: vehicleQuery } = useVehicle(vehicleId)
const { data: vehicleData } = vehicleQuery
const { mutation } = useUpdateMileage()
const { isPending } = mutation

const vehicle = computed(() => vehicleData.value as unknown as Vehicle | undefined)
const { defineField, errors, handleSubmit } = useForm<{ mileage: number }>({
  validationSchema: updateMileageSchema,
  initialValues: { mileage: vehicle.value?.mileage ?? 0 },
})

const { displayUnit } = usePreferredUnit()
const [mileage] = defineField('mileage')

const handleSave = handleSubmit(async (values) => {
  await mutation.mutateAsync({ vehicleId, mileage: values.mileage })
  router.push(`/vehicles/${vehicleId}`)
})
</script>

<template>
  <div class="max-w-lg mx-auto">
    <h1 class="text-2xl font-bold text-[#1a1a2e] mb-6">Update Mileage</h1>

    <div v-if="vehicle" class="bg-white p-8 rounded-xl shadow">
      <div class="mb-6">
        <label class="block mb-1.5 font-medium text-sm text-gray-700">Current Mileage</label>
        <p class="text-2xl font-bold text-[#1a1a2e] m-0">{{ displayUnit(vehicle.mileage) }}</p>
      </div>
      <div class="mb-4">
        <label class="block mb-1.5 font-medium text-sm text-gray-700">New Mileage</label>
        <input v-model.number="mileage" type="number" min="0"
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-[#1a1a2e] box-border" />
        <span v-if="errors.mileage" class="text-red-600 text-xs block mt-1">{{ errors.mileage }}</span>
      </div>
      <div class="flex justify-end gap-3 mt-6">
        <button @click="router.back()" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm cursor-pointer hover:bg-gray-300">Cancel</button>
        <button @click="handleSave" :disabled="isPending" class="px-6 py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#16213e]">
          {{ isPending ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>
