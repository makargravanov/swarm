import type { Dictionary } from '../i18n/types'

interface BoardRailPanelProps {
  strings: Dictionary['board']
}

export function BoardRailPanel({ strings }: BoardRailPanelProps) {
  return (
    <section className="panel rail-panel">
      <div>
        <h2>{strings.railTitle}</h2>
        <p>{strings.railDescription}</p>
      </div>

      <a
        className="rail-link"
        href="https://github.com/makargravanov/swarm"
        target="_blank"
        rel="noreferrer"
      >
        {strings.githubLabel}
      </a>
    </section>
  )
}