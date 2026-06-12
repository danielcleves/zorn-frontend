import { useMutation } from '@tanstack/vue-query'
import { login, getCurrentUser } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export const useLogin = () => {
  const auth = useAuthStore()

  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      auth.setToken(data.access_token)

      const user = await getCurrentUser()
      auth.setUser(user)
    }
  })
}
