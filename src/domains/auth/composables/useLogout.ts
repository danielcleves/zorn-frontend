import { useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '../store/authStore'

export const useLogout = () => {
  const auth = useAuthStore()
  const queryClient = useQueryClient()

  const logout = () => {
    auth.logout()
    queryClient.clear()
  }

  return { logout }
}
