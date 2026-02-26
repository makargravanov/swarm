export interface PublicUser {
  id: string
  nickname: string
  email: string
  is_admin: boolean
  created_at: string
}

export interface AuthResponse {
  token: string
  user: PublicUser
}

export interface HealthResponse {
  status: string
}

export interface ApiErrorBody {
  error?: string
}