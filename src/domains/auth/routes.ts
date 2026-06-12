import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('./views/LoginView.vue')
  },
  {
    path: '/register',
    component: () => import('./views/RegisterView.vue')
  }
]

export default routes
