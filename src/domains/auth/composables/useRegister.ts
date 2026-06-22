import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { register } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export const useRegister = () => {
  const auth = useAuthStore()
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      auth.setToken(data.access_token)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      router.push('/dashboard')
    },
  })
}
