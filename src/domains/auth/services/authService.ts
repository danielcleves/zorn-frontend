import api from '@/lib/axios'
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types'

export const login = async (
  data: LoginCredentials
): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/login', data)
  return res.data
}

export const register = async (
  data: RegisterCredentials
): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/register', data)
  return res.data
}

export const getCurrentUser = async () => {
  const res = await api.get('/me')
  return res.data
}
