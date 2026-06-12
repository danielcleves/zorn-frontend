import { createRouter, createWebHistory } from 'vue-router'
import authRoutes from '../domains/auth/routes'

const routes = [
  ...authRoutes
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
