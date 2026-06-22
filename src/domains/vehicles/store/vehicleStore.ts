import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Vehicle } from '../types'

export const useVehicleStore = defineStore('vehicle', () => {
  const vehicles = ref<Vehicle[]>([])
  const currentVehicleId = ref<number | null>(null)

  const currentVehicle = computed(() =>
    vehicles.value.find((v) => v.id === currentVehicleId.value) ?? null
  )

  function setVehicles(list: Vehicle[]) {
    vehicles.value = list
  }

  function addVehicle(vehicle: Vehicle) {
    vehicles.value.push(vehicle)
  }

  function updateVehicle(vehicle: Vehicle) {
    const idx = vehicles.value.findIndex((v) => v.id === vehicle.id)
    if (idx !== -1) vehicles.value[idx] = vehicle
  }

  function removeVehicle(id: number) {
    vehicles.value = vehicles.value.filter((v) => v.id !== id)
    if (currentVehicleId.value === id) currentVehicleId.value = null
  }

  function setCurrentVehicleId(id: number | null) {
    currentVehicleId.value = id
  }

  return {
    vehicles,
    currentVehicleId,
    currentVehicle,
    setVehicles,
    addVehicle,
    updateVehicle,
    removeVehicle,
    setCurrentVehicleId,
  }
})
