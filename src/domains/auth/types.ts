export interface User {
  id: number
  name: string
  email: string
  preferred_distance_unit: string
  advance_alerts_time: number
  advance_alerts_mileage: number
}

export interface AuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  name: string
}
