import type { FormEventHandler } from 'react'

import type { Dictionary } from '../i18n/types'
import type { AuthMode, LoginFormState, Notice, RegisterFormState } from '../types/ui'

interface AuthPanelProps {
  authMode: AuthMode
  registerForm: RegisterFormState
  loginForm: LoginFormState
  notice: Notice | null
  isSubmitting: boolean
  strings: Dictionary['auth']
  onModeChange: (mode: AuthMode) => void
  onRegisterFieldChange: (field: keyof RegisterFormState, value: string) => void
  onLoginFieldChange: (field: keyof LoginFormState, value: string) => void
  onRegisterSubmit: FormEventHandler<HTMLFormElement>
  onLoginSubmit: FormEventHandler<HTMLFormElement>
}

export function AuthPanel({
  authMode,
  registerForm,
  loginForm,
  notice,
  isSubmitting,
  strings,
  onModeChange,
  onRegisterFieldChange,
  onLoginFieldChange,
  onRegisterSubmit,
  onLoginSubmit,
}: AuthPanelProps) {
  return (
    <section className="panel auth-panel">
      <div className="mode-switch" role="tablist" aria-label={strings.modeAriaLabel}>
        <button
          type="button"
          role="tab"
          aria-selected={authMode === 'register'}
          className={authMode === 'register' ? 'active' : ''}
          onClick={() => onModeChange('register')}
        >
          {strings.registerTab}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={authMode === 'login'}
          className={authMode === 'login' ? 'active' : ''}
          onClick={() => onModeChange('login')}
        >
          {strings.loginTab}
        </button>
      </div>

      {authMode === 'register' ? (
        <form className="auth-form" onSubmit={onRegisterSubmit}>
          <label>
            {strings.nicknameLabel}
            <input
              required
              minLength={3}
              maxLength={32}
              value={registerForm.nickname}
              onChange={(event) => onRegisterFieldChange('nickname', event.target.value)}
              placeholder={strings.registerNicknamePlaceholder}
              autoComplete="nickname"
            />
          </label>

          <label>
            {strings.emailLabel}
            <input
              required
              type="email"
              value={registerForm.email}
              onChange={(event) => onRegisterFieldChange('email', event.target.value)}
              placeholder={strings.registerEmailPlaceholder}
              autoComplete="email"
            />
          </label>

          <label>
            {strings.passwordLabel}
            <input
              required
              type="password"
              minLength={8}
              value={registerForm.password}
              onChange={(event) => onRegisterFieldChange('password', event.target.value)}
              placeholder={strings.registerPasswordPlaceholder}
              autoComplete="new-password"
            />
          </label>

          <button className="cta-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? strings.submitRegisterPending : strings.submitRegister}
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={onLoginSubmit}>
          <label>
            {strings.emailLabel}
            <input
              required
              type="email"
              value={loginForm.email}
              onChange={(event) => onLoginFieldChange('email', event.target.value)}
              placeholder={strings.loginEmailPlaceholder}
              autoComplete="email"
            />
          </label>

          <label>
            {strings.passwordLabel}
            <input
              required
              type="password"
              minLength={8}
              value={loginForm.password}
              onChange={(event) => onLoginFieldChange('password', event.target.value)}
              placeholder={strings.loginPasswordPlaceholder}
              autoComplete="current-password"
            />
          </label>

          <button className="cta-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? strings.submitLoginPending : strings.submitLogin}
          </button>
        </form>
      )}

      {notice && <p className={`notice notice-${notice.tone}`}>{notice.text}</p>}
    </section>
  )
}