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
        class="bg-white rounded-xl p-6 shadow cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-lg relative"
      >
        <div v-if="vehicle.overdue_count > 0" class="absolute top-3 right-3 text-red-600" title="Overdue tasks">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
        </div>
        <div v-else-if="vehicle.upcoming_count > 0" class="absolute top-3 right-3 text-yellow-500" title="Upcoming tasks">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">{{ vehicle.nickname }}</h3>
        <p class="text-gray-500 text-sm mb-1">{{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }})</p>
        <p v-if="vehicle.plate" class="text-gray-500 text-sm">Plate: {{ vehicle.plate }}</p>
        <p class="mt-3 font-semibold text-[#1a1a2e]">{{ displayUnit(vehicle.mileage) }}</p>
      </div>
    </div>
  </div>
</template>
