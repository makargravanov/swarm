import type { Dictionary } from '../i18n/types'

interface HeroPanelProps {
  strings: Dictionary['board']
}

export function HeroPanel({ strings }: HeroPanelProps) {
  return (
    <section className="panel hero-panel">
      <h2>{strings.heroTitle}</h2>
      <p>{strings.heroDescription}</p>
    </section>
  )
}