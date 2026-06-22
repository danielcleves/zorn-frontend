import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { updateMileage } from '../services/vehicleService'

export const useUpdateMileage = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ vehicleId, mileage }: { vehicleId: number; mileage: number }) =>
      updateMileage(vehicleId, mileage),
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['reminders', vehicleId] })
    },
  })

  return { mutation }
}
