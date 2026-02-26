import type { ApiErrorBody } from '../types/auth'

export const getErrorText = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers)

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`/api${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    let message = `request failed (${response.status})`

    try {
      const errorBody = (await response.json()) as ApiErrorBody
      if (errorBody.error) {
        message = errorBody.error
      }
    } catch {
      // ignore JSON parsing errors and use default message
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}