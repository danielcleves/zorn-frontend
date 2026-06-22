import api from '@/lib/axios'
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types'

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

export const updateCurrentUser = async (data: Partial<User>) => {
  const res = await api.put('/me', data)
  return res.data
}

export const refreshToken = async (): Promise<string> => {
  const res = await api.post<{ access_token: string; token_type: string; expires_in: number }>('/refresh')
  return res.data.access_token
}
