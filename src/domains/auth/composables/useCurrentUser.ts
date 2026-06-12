import { useQuery } from '@tanstack/vue-query'
import { getCurrentUser } from '../services/authService'

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: getCurrentUser,
    retry: false
  })
}
