import type { Dictionary } from '../i18n/types'

interface ShowcasePanelProps {
  strings: Dictionary['board']
}

export function ShowcasePanel({ strings }: ShowcasePanelProps) {
  return (
    <section className="panel showcase-panel">
      <h2>{strings.showcaseTitle}</h2>
      <div className="showcase-body">
        <p>{strings.showcaseDescription}</p>
      </div>
    </section>
  )
}