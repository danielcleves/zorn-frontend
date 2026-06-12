import { useMutation } from '@tanstack/vue-query'
import { login } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export const useLogin = () => {
  const auth = useAuthStore()

  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      auth.setToken(data.access_token)

      // fetch user after login
      const userRes = await fetch('/api/me', {
        headers: {
          Authorization: `Bearer ${data.access_token}`
        }
      })

      const user = await userRes.json()
      auth.setUser(user)
    }
  })
}
