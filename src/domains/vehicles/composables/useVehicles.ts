import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  getVehicles,
  getVehicle,
  createVehicle,
  deleteVehicle,
  getReminders,
} from '../services/vehicleService'
import { useVehicleStore } from '../store/vehicleStore'
import type { CreateVehiclePayload } from '../types'

export const useVehicles = () => {
  const store = useVehicleStore()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const data = await getVehicles()
      store.setVehicles(data)
      return data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateVehiclePayload) => createVehicle(data),
    onSuccess: (vehicle) => {
      store.addVehicle(vehicle)
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteVehicle(id),
    onSuccess: (_, id) => {
      store.removeVehicle(id)
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })

  return { query, createMutation, deleteMutation }
}

export const useVehicle = (id: number) => {
  const query = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicle(id),
    enabled: !!id,
  })

  return { query }
}

export const useReminders = (vehicleId: number) => {
  const query = useQuery({
    queryKey: ['reminders', vehicleId],
    queryFn: () => getReminders(vehicleId),
    enabled: !!vehicleId,
  })

  return { query }
}
