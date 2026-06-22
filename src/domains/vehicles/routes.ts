import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'dashboard',
    component: () => import('./views/DashboardView.vue'),
  },
  {
    path: 'vehicles/add',
    name: 'add-vehicle',
    component: () => import('./views/AddVehicleView.vue'),
  },
  {
    path: 'vehicles/:id',
    name: 'vehicle-dashboard',
    component: () => import('./views/VehicleDashboardView.vue'),
  },
  {
    path: 'vehicles/:id/plan',
    name: 'choose-plan',
    component: () => import('./views/ChoosePlanView.vue'),
  },
  {
    path: 'vehicles/:id/mileage',
    name: 'update-mileage',
    component: () => import('./views/UpdateMileageView.vue'),
  },
  {
    path: 'vehicles/:id/add-maintenance',
    name: 'add-maintenance',
    component: () => import('./views/AddMaintenanceView.vue'),
  },
  {
    path: 'vehicles/:id/tasks/:taskId',
    name: 'task-detail',
    component: () => import('./views/TaskDetailView.vue'),
  },
  {
    path: 'vehicles/:id/history',
    name: 'maintenance-history',
    component: () => import('./views/MaintenanceHistoryView.vue'),
  },
  {
    path: 'vehicles/:id/export',
    name: 'export-import',
    component: () => import('./views/ExportImportView.vue'),
  },
  {
    path: 'settings',
    name: 'settings',
    component: () => import('./views/SettingsView.vue'),
  },
]

export default routes
