import { HOME } from '../data/copy'
import { Icon, type IconName } from './Icon'

type ValueBandTone = 'ink' | 'surface'

interface ValueBandProps {
  /** Home runs this as an obsidian band; Vehicles runs it on the light one. */
  tone?: ValueBandTone
}

const ICONS: IconName[] = ['shield-check', 'user', 'refresh', 'file-text']

/**
 * The four-up promise strip. Both grounds are legal and neither uses muted:
 * on ink, secondary text is the border token at 15.09:1, because muted
 * reaches only 4.01:1 there (section 4). On the light band the body is ink,
 * since muted on #F3F4F6 fails by a hundredth.
 */
const TONES: Record<ValueBandTone, { wrap: string; title: string; body: string; rule: string }> = {
  ink: {
    wrap: 'bg-ink text-bg',
    title: 'text-bg',
    body: 'text-border',
    // Graphite on ink is the quietest divider the palette has.
    rule: 'lg:border-l lg:border-graphite lg:first:border-l-0',
  },
  surface: {
    wrap: 'bg-surface text-ink',
    title: 'text-ink',
    body: 'text-ink',
    rule: 'lg:border-l lg:border-border lg:first:border-l-0',
  },
}

export function ValueBand({ tone = 'ink' }: ValueBandProps) {
  const t = TONES[tone]

  return (
    <ul className={`grid rounded-card ${t.wrap} sm:grid-cols-2 lg:grid-cols-4`}>
      {HOME.values.map((value, index) => (
        <li key={value.title} className={`flex flex-col gap-3 p-6 lg:p-7 ${t.rule}`}>
          <span className={t.title}>
            <Icon name={ICONS[index]} size={28} />
          </span>
          <h3 className={`font-display text-h3-sm ${t.title}`}>{value.title}</h3>
          <p className={`font-body text-body-sm ${t.body}`}>{value.body}</p>
        </li>
      ))}
    </ul>
  )
}
