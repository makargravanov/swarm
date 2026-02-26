import type { Dictionary, Locale } from '../i18n/types'
import type { ServerStatus } from '../types/ui'

interface ServerStatusPanelProps {
  locale: Locale
  serverStatus: ServerStatus
  lastCheckedAt: Date | null
  isCheckingNow: boolean
  strings: Dictionary['server']
  onCheckNow: () => void
}

const getStatusLabel = (status: ServerStatus, strings: Dictionary['server']) => {
  if (status === 'online') {
    return strings.statusOnline
  }

  if (status === 'offline') {
    return strings.statusOffline
  }

  return strings.statusChecking
}

export function ServerStatusPanel({
  locale,
  serverStatus,
  lastCheckedAt,
  isCheckingNow,
  strings,
  onCheckNow,
}: ServerStatusPanelProps) {
  const formattedCheckedAt =
    lastCheckedAt === null
      ? '—'
      : lastCheckedAt.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')

  return (
    <section className="panel intro-panel">
      <div className="server-copy">
        <h2>{strings.title}</h2>
        <p>{strings.description}</p>
      </div>

      <div className="server-actions">
        <div className={`status-pill status-${serverStatus}`}>
          <span className="status-dot" aria-hidden="true" />
          <span>{getStatusLabel(serverStatus, strings)}</span>
        </div>

        <div className="health-meta">
          <p>
            {strings.lastChecked}: {formattedCheckedAt}
          </p>
          <button type="button" className="ghost-button" onClick={onCheckNow} disabled={isCheckingNow}>
            {strings.checkNow}
          </button>
        </div>
      </div>
    </section>
  )
}