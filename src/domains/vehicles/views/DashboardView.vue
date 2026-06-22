<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useVehicles } from '../composables/useVehicles'
import { useVehicleStore } from '../store/vehicleStore'
import { usePreferredUnit } from '@/domains/auth/composables/usePreferredUnit'

const router = useRouter()
const { query } = useVehicles()
const { isPending, isError } = query
const store = useVehicleStore()

const goToVehicle = (id: number) => {
  store.setCurrentVehicleId(id)
  router.push(`/vehicles/${id}`)
}

const { displayUnit } = usePreferredUnit()

const goToAddVehicle = () => {
  router.push('/vehicles/add')
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-[#1a1a2e]">My Vehicles</h1>
      <button @click="goToAddVehicle" class="px-6 py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer hover:bg-[#16213e]">+ Add Vehicle</button>
    </div>

    <div v-if="isPending" class="text-center py-12 text-gray-500">Loading...</div>

    <div v-else-if="isError" class="text-center py-12">
      <p class="text-red-600">Error loading vehicles. Is the API running?</p>
    </div>

    <div v-else-if="store.vehicles.length === 0" class="text-center py-16 px-8 bg-white rounded-2xl shadow">
      <h2 class="text-xl font-semibold mb-2">No vehicles yet</h2>
      <p class="text-gray-500 mb-6">Add your first vehicle to start tracking its maintenance.</p>
      <button @click="goToAddVehicle" class="px-6 py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer hover:bg-[#16213e]">Add your first vehicle</button>
    </div>

    <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      <div
        v-for="vehicle in store.vehicles"
        :key="vehicle.id"
        @click="goToVehicle(vehicle.id)"
        class="bg-white rounded-xl p-6 shadow cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-lg"
      >
        <h3 class="text-lg font-semibold mb-2">{{ vehicle.nickname }}</h3>
        <p class="text-gray-500 text-sm mb-1">{{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }})</p>
        <p v-if="vehicle.plate" class="text-gray-500 text-sm">Plate: {{ vehicle.plate }}</p>
        <p class="mt-3 font-semibold text-[#1a1a2e]">{{ displayUnit(vehicle.mileage) }}</p>
      </div>
    </div>
  </div>
</template>
