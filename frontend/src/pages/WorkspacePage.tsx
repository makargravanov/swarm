import { useNavigate } from 'react-router-dom'

import { AppHeader } from '../components/AppHeader'
import { useLocale } from '../hooks/useLocale'
import { useTheme } from '../hooks/useTheme'

export function WorkspacePage() {
  const navigate = useNavigate()
  const { locale, setLocale, dictionary } = useLocale()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="app-shell workspace-shell">
      <AppHeader
        theme={theme}
        locale={locale}
        strings={dictionary.header}
        onToggleTheme={toggleTheme}
        onLocaleChange={setLocale}
      />

      <section className="panel workspace-panel">
        <h2>{dictionary.workspace.title}</h2>
        <p>{dictionary.workspace.description}</p>

        <button type="button" className="secondary-button" onClick={() => navigate('/')}>
          {dictionary.workspace.backToAuth}
        </button>
      </section>
    </div>
  )
}