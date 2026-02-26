import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { apiRequest, getErrorText } from '../api/client'
import { TOKEN_STORAGE_KEY } from '../constants/storage'
import type { Dictionary } from '../i18n/types'
import type { AuthResponse, PublicUser } from '../types/auth'
import type { AuthMode, LoginFormState, Notice, RegisterFormState } from '../types/ui'

const resolveInitialToken = (): string => {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''
}

interface UseAuthSessionOptions {
  notices: Dictionary['notices']
}

export const useAuthSession = ({ notices }: UseAuthSessionOptions) => {
  const [authMode, setAuthMode] = useState<AuthMode>('register')
  const [token, setToken] = useState<string>(resolveInitialToken)
  const [user, setUser] = useState<PublicUser | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false)
  const [registerForm, setRegisterForm] = useState<RegisterFormState>({
    nickname: '',
    email: '',
    password: '',
  })
  const [loginForm, setLoginForm] = useState<LoginFormState>({
    email: '',
    password: '',
  })

  const persistToken = (nextToken: string) => {
    setToken(nextToken)

    if (typeof window === 'undefined') {
      return
    }

    if (nextToken) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
      return
    }

    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  }

  const refreshProfile = async (activeToken: string, shouldShowNotice: boolean) => {
    if (!activeToken) {
      setUser(null)
      return
    }

    setIsRefreshingProfile(true)

    try {
      const me = await apiRequest<PublicUser>('/auth/me', { method: 'GET' }, activeToken)
      setUser(me)

      if (shouldShowNotice) {
        setNotice({ tone: 'success', text: notices.sessionRefreshed })
      }
    } catch (error) {
      const message = getErrorText(error, notices.unexpectedError)
      const normalized = message.toLowerCase()

      if (normalized.includes('unauthorized') || normalized.includes('invalid token')) {
        persistToken('')
        setUser(null)
      }

      setNotice({ tone: 'error', text: message })
    } finally {
      setIsRefreshingProfile(false)
    }
  }

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    void refreshProfile(token, false)
  }, [token])

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice(null)
    setIsSubmitting(true)

    try {
      const payload = {
        nickname: registerForm.nickname.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
      }

      const response = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      persistToken(response.token)
      setUser(response.user)
      setLoginForm({ email: payload.email, password: '' })
      setNotice({ tone: 'success', text: notices.registered })
    } catch (error) {
      setNotice({ tone: 'error', text: getErrorText(error, notices.unexpectedError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice(null)
    setIsSubmitting(true)

    try {
      const payload = {
        email: loginForm.email.trim(),
        password: loginForm.password,
      }

      const response = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      persistToken(response.token)
      setUser(response.user)
      setNotice({ tone: 'success', text: notices.loggedIn })
    } catch (error) {
      setNotice({ tone: 'error', text: getErrorText(error, notices.unexpectedError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    persistToken('')
    setUser(null)
    setNotice({ tone: 'info', text: notices.signedOut })
  }

  const setRegisterField = (field: keyof RegisterFormState, value: string) => {
    setRegisterForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const setLoginField = (field: keyof LoginFormState, value: string) => {
    setLoginForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  return {
    authMode,
    setAuthMode,
    registerForm,
    loginForm,
    setRegisterField,
    setLoginField,
    token,
    user,
    notice,
    isSubmitting,
    isRefreshingProfile,
    handleRegister,
    handleLogin,
    handleLogout,
    refreshProfile,
  }
}