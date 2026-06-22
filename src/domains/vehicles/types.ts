export interface Vehicle {
  id: number
  user_id: number
  nickname: string
  brand: string
  model: string
  year: number
  mileage: number
  plate: string | null
  maintenance_plan_id: number | null
  overdue_count: number
  upcoming_count: number
  created_at: string
  updated_at: string
  maintenance_plan?: MaintenancePlan
  maintenance_records?: MaintenanceRecord[]
}

export interface MaintenancePlan {
  id: number
  user_id: number | null
  name: string
  is_predefined: boolean
  created_at: string
  updated_at: string
  tasks: MaintenancePlanTask[]
}

export interface MaintenancePlanTask {
  id: number
  maintenance_plan_id: number
  name: string
  description: string | null
  frequency_km: number | null
  frequency_time_months: number | null
  review_frequency_km: number | null
  review_frequency_time_months: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  next_maintenance?: {
    next_due_km: number | null
    next_due_date: string | null
    remaining_km: number | null
    remaining_days: number | null
    status: 'ok' | 'upcoming' | 'overdue'
  }
  next_review?: {
    next_due_km: number | null
    next_due_date: string | null
    remaining_km: number | null
    remaining_days: number | null
    status: 'ok' | 'upcoming' | 'overdue'
  }
}

export interface MaintenanceRecord {
  id: number
  vehicle_id: number
  maintenance_plan_task_id: number | null
  task_name: string
  date: string
  mileage: number
  cost: number | null
  notes: string | null
  is_review_only: boolean
  created_at: string
  updated_at: string
  maintenance_plan_task?: MaintenancePlanTask
}

export interface Reminder {
  task_id: number
  task_name: string
  description: string | null
  frequency_km: number | null
  frequency_time_months: number | null
  next_due_km: number | null
  next_due_date: string | null
  status: 'ok' | 'upcoming' | 'overdue'
  last_record: { date: string; mileage: number } | null
}

export interface CreateVehiclePayload {
  nickname: string
  brand: string
  model: string
  year: number
  mileage: number
  plate?: string
}

export interface CreatePlanPayload {
  name: string
  tasks: {
    name: string
    description?: string
    frequency_km?: number
    frequency_time_months?: number
    review_frequency_km?: number
    review_frequency_time_months?: number
    is_active?: boolean
  }[]
}

export interface CreateRecordPayload {
  maintenance_plan_task_id: number
  date: string
  mileage: number
  cost?: number
  notes?: string
  is_review_only?: boolean
}
