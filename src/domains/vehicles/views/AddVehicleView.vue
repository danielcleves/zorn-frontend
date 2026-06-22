<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { useVehicles } from '../composables/useVehicles'
import { addVehicleSchema } from '../schemas'
import { usePreferredUnit } from '@/domains/auth/composables/usePreferredUnit'
import type { CreateVehiclePayload } from '../types'

const router = useRouter()
const { createMutation } = useVehicles()
const { isPending } = createMutation
const { defineField, errors, handleSubmit } = useForm<CreateVehiclePayload>({
  validationSchema: addVehicleSchema,
})

const [nickname] = defineField('nickname')
const [brand] = defineField('brand')
const [model] = defineField('model')
const [year] = defineField('year')
const [mileage] = defineField('mileage')
const { unit } = usePreferredUnit()

const [plate] = defineField('plate')

const handleSave = handleSubmit(async (values) => {
  await createMutation.mutateAsync({
    ...values,
    plate: values.plate || undefined,
  })
  router.push('/dashboard')
})
</script>

<template>
  <div class="max-w-lg mx-auto">
    <h1 class="text-2xl font-bold text-[#1a1a2e] mb-6">Add Vehicle</h1>
    <form @submit.prevent="handleSave" class="bg-white p-8 rounded-xl shadow">
      <div class="mb-4">
        <label class="block mb-1.5 font-medium text-sm text-gray-700">Nickname</label>
        <input v-model="nickname" placeholder="e.g., My Car"
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
        <span v-if="errors.nickname" class="text-red-600 text-xs block mt-1">{{ errors.nickname }}</span>
      </div>
      <div class="flex gap-4">
        <div class="flex-1 mb-4">
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Brand</label>
          <input v-model="brand" placeholder="Toyota"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          <span v-if="errors.brand" class="text-red-600 text-xs block mt-1">{{ errors.brand }}</span>
        </div>
        <div class="flex-1 mb-4">
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Model</label>
          <input v-model="model" placeholder="Corolla"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          <span v-if="errors.model" class="text-red-600 text-xs block mt-1">{{ errors.model }}</span>
        </div>
      </div>
      <div class="flex gap-4">
        <div class="flex-1 mb-4">
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Year</label>
          <input v-model.number="year" type="number" :min="1900" :max="2099"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          <span v-if="errors.year" class="text-red-600 text-xs block mt-1">{{ errors.year }}</span>
        </div>
        <div class="flex-1 mb-4">
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Current Mileage ({{ unit }})</label>
          <input v-model.number="mileage" type="number" min="0"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          <span v-if="errors.mileage" class="text-red-600 text-xs block mt-1">{{ errors.mileage }}</span>
        </div>
      </div>
      <div class="mb-4">
        <label class="block mb-1.5 font-medium text-sm text-gray-700">Plate (optional)</label>
        <input v-model="plate" placeholder="ABC-1234"
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
      </div>
      <div class="flex justify-end gap-3 mt-6">
        <button type="button" @click="router.back()" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm cursor-pointer hover:bg-gray-300">Cancel</button>
        <button type="submit" :disabled="isPending" class="px-6 py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#16213e]">
          {{ isPending ? 'Saving...' : 'Save & Continue' }}
        </button>
      </div>
    </form>
  </div>
</template>
