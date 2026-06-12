import { useMutation } from '@tanstack/vue-query'
import { register, getCurrentUser } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export const useRegister = () => {
  const auth = useAuthStore()

  return useMutation({
    mutationFn: register,
    onSuccess: async (data) => {
      auth.setToken(data.access_token)

      const user = await getCurrentUser()
      auth.setUser(user)
    }
  })
}
