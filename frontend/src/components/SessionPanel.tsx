import type { Dictionary } from '../i18n/types'
import type { PublicUser } from '../types/auth'

interface SessionPanelProps {
  token: string
  user: PublicUser | null
  isRefreshingProfile: boolean
  strings: Dictionary['session']
  onRefreshProfile: () => void
  onLogout: () => void
}

export function SessionPanel({
  token,
  user,
  isRefreshingProfile,
  strings,
  onRefreshProfile,
  onLogout,
}: SessionPanelProps) {
  const hasSession = Boolean(token && user)

  return (
    <section className="panel session-panel">
      <h2>{strings.title}</h2>

      {hasSession && user ? (
        <>
          <dl className="session-grid">
            <div>
              <dt>{strings.nicknameLabel}</dt>
              <dd>{user.nickname}</dd>
            </div>
            <div>
              <dt>{strings.emailLabel}</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>{strings.roleLabel}</dt>
              <dd>{user.is_admin ? strings.roleAdmin : strings.roleUser}</dd>
            </div>
          </dl>

          <div className="session-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onRefreshProfile}
              disabled={isRefreshingProfile}
            >
              {isRefreshingProfile ? strings.refreshPending : strings.refresh}
            </button>

            <button type="button" className="ghost-button" onClick={onLogout}>
              {strings.logout}
            </button>
          </div>
        </>
      ) : (
        <p className="session-empty">{strings.empty}</p>
      )}
    </section>
  )
}