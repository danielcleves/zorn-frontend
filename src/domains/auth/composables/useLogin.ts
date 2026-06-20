import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { login } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export const useLogin = () => {
  const auth = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      auth.setToken(data.access_token)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    }
  })
}
