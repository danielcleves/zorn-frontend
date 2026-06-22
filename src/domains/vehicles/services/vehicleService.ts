import api from '@/lib/axios'
import type {
  Vehicle,
  MaintenancePlan,
  MaintenancePlanTask,
  MaintenanceRecord,
  Reminder,
  CreateVehiclePayload,
  CreatePlanPayload,
  CreateRecordPayload,
} from '../types'

export const getVehicles = async (): Promise<Vehicle[]> => {
  const res = await api.get('/vehicles')
  return res.data
}

export const getVehicle = async (id: number): Promise<Vehicle> => {
  const res = await api.get(`/vehicles/${id}`)
  return res.data
}

export const createVehicle = async (data: CreateVehiclePayload): Promise<Vehicle> => {
  const res = await api.post('/vehicles', data)
  return res.data
}

export const updateVehicle = async (id: number, data: Partial<CreateVehiclePayload>): Promise<Vehicle> => {
  const res = await api.put(`/vehicles/${id}`, data)
  return res.data
}

export const deleteVehicle = async (id: number): Promise<void> => {
  await api.delete(`/vehicles/${id}`)
}

export const updateMileage = async (id: number, mileage: number): Promise<Vehicle> => {
  const res = await api.patch(`/vehicles/${id}/mileage`, { mileage })
  return res.data
}

export const getReminders = async (vehicleId: number): Promise<Reminder[]> => {
  const res = await api.get(`/vehicles/${vehicleId}/reminders`)
  return res.data
}

export const assignPlan = async (vehicleId: number, maintenancePlanId: number): Promise<Vehicle> => {
  const res = await api.post(`/vehicles/${vehicleId}/assign-plan`, { maintenance_plan_id: maintenancePlanId })
  return res.data
}

export const copyPlan = async (vehicleId: number, sourceVehicleId: number): Promise<Vehicle> => {
  const res = await api.post(`/vehicles/${vehicleId}/copy-plan`, { source_vehicle_id: sourceVehicleId })
  return res.data
}

export const getPlans = async (): Promise<{ predefined: MaintenancePlan[]; custom: MaintenancePlan[] }> => {
  const res = await api.get('/maintenance-plans')
  return res.data
}

export const getPlan = async (id: number): Promise<MaintenancePlan> => {
  const res = await api.get(`/maintenance-plans/${id}`)
  return res.data
}

export const createPlan = async (data: CreatePlanPayload): Promise<MaintenancePlan> => {
  const res = await api.post('/maintenance-plans', data)
  return res.data
}

export const getRecords = async (vehicleId: number): Promise<MaintenanceRecord[]> => {
  const res = await api.get(`/vehicles/${vehicleId}/records`)
  return res.data
}

export const createRecord = async (vehicleId: number, data: CreateRecordPayload): Promise<MaintenanceRecord> => {
  const res = await api.post(`/vehicles/${vehicleId}/records`, data)
  return res.data
}

export const deleteRecord = async (vehicleId: number, recordId: number): Promise<void> => {
  await api.delete(`/vehicles/${vehicleId}/records/${recordId}`)
}

export const exportVehicle = async (vehicleId: number): Promise<Vehicle> => {
  const res = await api.get(`/vehicles/${vehicleId}/export`)
  return res.data
}

export const importVehicle = async (data: Record<string, unknown>): Promise<Vehicle> => {
  const res = await api.post('/vehicles/import', data)
  return res.data
}

export const syncPlanTasks = async (planId: number, tasks: Partial<MaintenancePlanTask>[]): Promise<MaintenancePlan> => {
  const res = await api.put(`/maintenance-plans/${planId}/sync-tasks`, { tasks })
  return res.data
}

export const convertPlan = async (planId: number): Promise<MaintenancePlan> => {
  const res = await api.post(`/maintenance-plans/${planId}/convert`)
  return res.data
}
