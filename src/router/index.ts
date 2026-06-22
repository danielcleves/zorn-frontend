import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/domains/auth/store/authStore'
import authRoutes from '@/domains/auth/routes'
import vehicleRoutes from '@/domains/vehicles/routes'

const routes = [
  ...authRoutes,
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      ...vehicleRoutes,
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && auth.token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
