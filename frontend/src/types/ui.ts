export type Theme = 'light' | 'dark'
export type AuthMode = 'register' | 'login'
export type ServerStatus = 'checking' | 'online' | 'offline'
export type NoticeTone = 'info' | 'success' | 'error'

export interface Notice {
  tone: NoticeTone
  text: string
}

export interface RegisterFormState {
  nickname: string
  email: string
  password: string
}

export interface LoginFormState {
  email: string
  password: string
}