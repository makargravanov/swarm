import { useNavigate } from 'react-router-dom'

import { AppHeader } from '../components/AppHeader'
import { AuthPanel } from '../components/AuthPanel'
import { BoardRailPanel } from '../components/BoardRailPanel'
import { HeroPanel } from '../components/HeroPanel'
import { ServerStatusPanel } from '../components/ServerStatusPanel'
import { SessionPanel } from '../components/SessionPanel'
import { ShowcasePanel } from '../components/ShowcasePanel'
import { useAuthSession } from '../hooks/useAuthSession'
import { useLocale } from '../hooks/useLocale'
import { useServerHealth } from '../hooks/useServerHealth'
import { useTheme } from '../hooks/useTheme'

export function AuthPage() {
  const navigate = useNavigate()
  const { locale, setLocale, dictionary } = useLocale()
  const { theme, toggleTheme } = useTheme()
  const { serverStatus, lastCheckedAt, checkServerHealth, isCheckingNow } = useServerHealth()
  const {
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
  } = useAuthSession({
    notices: dictionary.notices,
    onLoginSuccess: () => navigate('/workspace'),
  })

  const handleRefreshProfile = () => {
    if (!token) {
      return
    }

    void refreshProfile(token, true)
  }

  const handleCheckNow = () => {
    void checkServerHealth()
  }

  return (
    <div className="app-shell">
      <AppHeader
        theme={theme}
        locale={locale}
        strings={dictionary.header}
        onToggleTheme={toggleTheme}
        onLocaleChange={setLocale}
      />

      <main className="layout-grid">
        <AuthPanel
          authMode={authMode}
          registerForm={registerForm}
          loginForm={loginForm}
          notice={notice}
          isSubmitting={isSubmitting}
          strings={dictionary.auth}
          onModeChange={setAuthMode}
          onRegisterFieldChange={setRegisterField}
          onLoginFieldChange={setLoginField}
          onRegisterSubmit={handleRegister}
          onLoginSubmit={handleLogin}
        />

        <BoardRailPanel strings={dictionary.board} />
        <HeroPanel strings={dictionary.board} />
        <ShowcasePanel strings={dictionary.board} />

        <SessionPanel
          token={token}
          user={user}
          isRefreshingProfile={isRefreshingProfile}
          strings={dictionary.session}
          onRefreshProfile={handleRefreshProfile}
          onLogout={handleLogout}
        />

        <ServerStatusPanel
          locale={locale}
          serverStatus={serverStatus}
          lastCheckedAt={lastCheckedAt}
          isCheckingNow={isCheckingNow}
          strings={dictionary.server}
          onCheckNow={handleCheckNow}
        />
      </main>
    </div>
  )
}