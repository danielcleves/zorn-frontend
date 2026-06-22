import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { getPlans, getPlan, createPlan, assignPlan, copyPlan, syncPlanTasks, convertPlan } from '../services/vehicleService'
import type { CreatePlanPayload, MaintenancePlanTask } from '../types'

export const usePlans = () => {
  const query = useQuery({
    queryKey: ['maintenance-plans'],
    queryFn: getPlans,
  })

  return { query }
}

export const usePlan = (id: number) => {
  const query = useQuery({
    queryKey: ['maintenance-plan', id],
    queryFn: () => getPlan(id),
    enabled: !!id,
  })

  return { query }
}

export const useCreatePlan = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreatePlanPayload) => createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-plans'] })
    },
  })

  return { mutation }
}

export const useAssignPlan = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ vehicleId, planId }: { vehicleId: number; planId: number }) =>
      assignPlan(vehicleId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })

  return { mutation }
}

export const useCopyPlan = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ vehicleId, sourceVehicleId }: { vehicleId: number; sourceVehicleId: number }) =>
      copyPlan(vehicleId, sourceVehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })

  return { mutation }
}

export const useSyncPlanTasks = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ planId, tasks }: { planId: number; tasks: Partial<MaintenancePlanTask>[] }) =>
      syncPlanTasks(planId, tasks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-plans'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['vehicle'] })
    },
  })

  return { mutation }
}

export const useConvertPlan = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (planId: number) => convertPlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-plans'] })
    },
  })

  return { mutation }
}
