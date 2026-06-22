import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { getRecords, createRecord, deleteRecord } from '../services/vehicleService'
import type { CreateRecordPayload } from '../types'

export const useRecords = (vehicleId: number) => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['records', vehicleId],
    queryFn: () => getRecords(vehicleId),
    enabled: !!vehicleId,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateRecordPayload) => createRecord(vehicleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', vehicleId] })
      queryClient.invalidateQueries({ queryKey: ['reminders', vehicleId] })
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (recordId: number) => deleteRecord(vehicleId, recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', vehicleId] })
      queryClient.invalidateQueries({ queryKey: ['reminders', vehicleId] })
    },
  })

  return { query, createMutation, deleteMutation }
}
