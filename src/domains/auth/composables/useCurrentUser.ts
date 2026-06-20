import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getCurrentUser } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export const useCurrentUser = () => {
  const auth = useAuthStore()
  const enabled = computed(() => !!auth.token)

  return useQuery({
    queryKey: ['me'],
    queryFn: getCurrentUser,
    retry: false,
    enabled
  })
}
