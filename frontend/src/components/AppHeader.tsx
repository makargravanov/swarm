import type { Dictionary, Locale } from '../i18n/types'
import type { Theme } from '../types/ui'

interface AppHeaderProps {
  theme: Theme
  locale: Locale
  strings: Dictionary['header']
  onToggleTheme: () => void
  onLocaleChange: (locale: Locale) => void
}

export function AppHeader({
  theme,
  locale,
  strings,
  onToggleTheme,
  onLocaleChange,
}: AppHeaderProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{strings.eyebrow}</p>
        <h1>{strings.title}</h1>
        <p className="header-subtitle">{strings.subtitle}</p>
      </div>

      <div className="topbar-controls">
        <div className="locale-switch" role="group" aria-label={strings.localeLabel}>
          <button
            type="button"
            className={locale === 'ru' ? 'active' : ''}
            onClick={() => onLocaleChange('ru')}
          >
            RU
          </button>
          <button
            type="button"
            className={locale === 'en' ? 'active' : ''}
            onClick={() => onLocaleChange('en')}
          >
            EN
          </button>
        </div>

        <button className="theme-toggle" type="button" onClick={onToggleTheme}>
          {theme === 'light' ? strings.themeToDark : strings.themeToLight}
        </button>
      </div>
    </header>
  )
}