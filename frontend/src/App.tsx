import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Theme = 'light' | 'dark'
type AuthMode = 'register' | 'login'
type ServerStatus = 'checking' | 'online' | 'offline'
type NoticeTone = 'info' | 'success' | 'error'

interface PublicUser {
  id: string
  nickname: string
  email: string
  is_admin: boolean
  created_at: string
}

interface AuthResponse {
  token: string
  user: PublicUser
}

interface HealthResponse {
  status: string
}

interface ApiErrorBody {
  error?: string
}

interface Notice {
  tone: NoticeTone
  text: string
}

const TOKEN_STORAGE_KEY = 'swarm_token'
const THEME_STORAGE_KEY = 'swarm_theme'

const resolveInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const resolveInitialToken = (): string => {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''
}

const getErrorText = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}

async function apiRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
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

function App() {
  const [theme, setTheme] = useState<Theme>(resolveInitialTheme)
  const [authMode, setAuthMode] = useState<AuthMode>('register')
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking')
  const [token, setToken] = useState<string>(resolveInitialToken)
  const [user, setUser] = useState<PublicUser | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    nickname: '',
    email: '',
    password: '',
  })
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  const createdAtLabel = useMemo(() => {
    if (!user) {
      return ''
    }

    return new Date(user.created_at).toLocaleString('ru-RU')
  }, [user])

  const healthLabel = useMemo(() => {
    if (serverStatus === 'online') {
      return 'Server online'
    }

    if (serverStatus === 'offline') {
      return 'Server offline'
    }

    return 'Checking server...'
  }, [serverStatus])

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

  const checkServerHealth = useCallback(async () => {
    setServerStatus('checking')

    try {
      const health = await apiRequest<HealthResponse>('/health')
      setServerStatus(health.status === 'ok' ? 'online' : 'offline')
    } catch {
      setServerStatus('offline')
    }
  }, [])

  const refreshProfile = useCallback(async (activeToken: string, shouldShowNotice: boolean) => {
    if (!activeToken) {
      setUser(null)
      return
    }

    setIsRefreshingProfile(true)

    try {
      const me = await apiRequest<PublicUser>('/auth/me', { method: 'GET' }, activeToken)
      setUser(me)

      if (shouldShowNotice) {
        setNotice({ tone: 'success', text: 'Session refreshed from /auth/me' })
      }
    } catch (error) {
      const message = getErrorText(error)
      const normalized = message.toLowerCase()

      if (normalized.includes('unauthorized') || normalized.includes('invalid token')) {
        persistToken('')
        setUser(null)
      }

      setNotice({ tone: 'error', text: message })
    } finally {
      setIsRefreshingProfile(false)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    void checkServerHealth()
    const intervalId = window.setInterval(() => {
      void checkServerHealth()
    }, 15000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [checkServerHealth])

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    void refreshProfile(token, false)
  }, [refreshProfile, token])

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
      setNotice({ tone: 'success', text: 'Registration completed and token saved' })
    } catch (error) {
      setNotice({ tone: 'error', text: getErrorText(error) })
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
      setNotice({ tone: 'success', text: 'Login completed successfully' })
    } catch (error) {
      setNotice({ tone: 'error', text: getErrorText(error) })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    persistToken('')
    setUser(null)
    setNotice({ tone: 'info', text: 'You signed out from this browser session' })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Swarm access layer</p>
          <h1>Registration and authorization</h1>
        </div>

        <button
          className="theme-toggle"
          type="button"
          onClick={() => setTheme((previous) => (previous === 'light' ? 'dark' : 'light'))}
        >
          {theme === 'light' ? 'Switch to dark' : 'Switch to light'}
        </button>
      </header>

      <main className="layout-grid">
        <section className="panel intro-panel">
          <h2>Server connection</h2>
          <p>
            This panel checks <code>/health</code> and keeps status updated every 15 seconds.
            API calls from forms go to <code>/api/auth/*</code>.
          </p>

          <div className={`status-pill status-${serverStatus}`}>
            <span className="status-dot" aria-hidden="true" />
            <span>{healthLabel}</span>
          </div>

          <p className="intro-note">
            Style follows Anthropic-like palette: warm neutrals, restrained accents and readable editorial
            typography.
          </p>
        </section>

        <section className="panel auth-panel">
          <div className="mode-switch" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'register'}
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'login'}
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
          </div>

          {authMode === 'register' ? (
            <form className="auth-form" onSubmit={handleRegister}>
              <label>
                Nickname
                <input
                  required
                  minLength={3}
                  maxLength={32}
                  value={registerForm.nickname}
                  onChange={(event) =>
                    setRegisterForm((previous) => ({
                      ...previous,
                      nickname: event.target.value,
                    }))
                  }
                  placeholder="pilot-01"
                  autoComplete="nickname"
                />
              </label>

              <label>
                Email
                <input
                  required
                  type="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm((previous) => ({
                      ...previous,
                      email: event.target.value,
                    }))
                  }
                  placeholder="pilot@swarm.dev"
                  autoComplete="email"
                />
              </label>

              <label>
                Password
                <input
                  required
                  type="password"
                  minLength={8}
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((previous) => ({
                      ...previous,
                      password: event.target.value,
                    }))
                  }
                  placeholder="minimum 8 chars"
                  autoComplete="new-password"
                />
              </label>

              <button className="cta-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleLogin}>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((previous) => ({
                      ...previous,
                      email: event.target.value,
                    }))
                  }
                  placeholder="pilot@swarm.dev"
                  autoComplete="email"
                />
              </label>

              <label>
                Password
                <input
                  required
                  type="password"
                  minLength={8}
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((previous) => ({
                      ...previous,
                      password: event.target.value,
                    }))
                  }
                  placeholder="your password"
                  autoComplete="current-password"
                />
              </label>

              <button className="cta-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Authorizing...' : 'Authorize'}
              </button>
            </form>
          )}

          {notice && <p className={`notice notice-${notice.tone}`}>{notice.text}</p>}
        </section>

        <section className="panel session-panel">
          <h2>Current session</h2>

          {token && user ? (
            <>
              <dl className="session-grid">
                <div>
                  <dt>ID</dt>
                  <dd>{user.id}</dd>
                </div>
                <div>
                  <dt>Nickname</dt>
                  <dd>{user.nickname}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{user.is_admin ? 'admin' : 'user'}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{createdAtLabel}</dd>
                </div>
              </dl>

              <div className="session-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => void refreshProfile(token, true)}
                  disabled={isRefreshingProfile}
                >
                  {isRefreshingProfile ? 'Refreshing...' : 'Refresh /auth/me'}
                </button>

                <button type="button" className="ghost-button" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <p className="session-empty">
              No active token in browser storage. Register or login to establish a session.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
