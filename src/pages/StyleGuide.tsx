import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { Icon } from '../components/Icon'
import { StatusPill } from '../components/StatusPill'
import { formatRatio, measure, tokenValue } from '../lib/contrast'
import type { ContrastPair } from '../lib/tokens'
import { CONTRAST_PAIRS, PALETTE, TYPE_SCALE } from '../lib/tokens'

/**
 * Tailwind needs to see complete class names in the source, so the token
 * name cannot be interpolated into a utility at runtime.
 */
const BG_CLASS: Record<string, string> = {
  ink: 'bg-ink',
  graphite: 'bg-graphite',
  bg: 'bg-bg',
  surface: 'bg-surface',
  border: 'bg-border',
  muted: 'bg-muted',
  accent: 'bg-accent',
  sold: 'bg-sold',
  available: 'bg-available',
}

const TEXT_CLASS: Record<string, string> = {
  ink: 'text-ink',
  graphite: 'text-graphite',
  bg: 'text-bg',
  surface: 'text-surface',
  border: 'text-border',
  muted: 'text-muted',
  accent: 'text-accent',
  sold: 'text-sold',
  available: 'text-available',
}

interface Swatch {
  token: string
  name: string
  usage: string
  value: string
}

interface PairResult {
  pair: ContrastPair
  ratio: number | null
  required: number
  passes: boolean
}

function Verdict({ passes, demonstration }: { passes: boolean; demonstration: boolean }) {
  // A demonstration pair is supposed to fail, so it is not flagged as a defect.
  if (demonstration) {
    return (
      <span className="inline-flex items-center gap-1 rounded-pill bg-sold px-2.5 py-1 font-body text-caption font-semibold text-ink">
        {passes ? 'PASS' : 'FAIL'} — expected
      </span>
    )
  }
  // FAIL is drawn in ink rather than accent — accent is the brand's action
  // fill, and borrowing it as an alarm colour teaches the wrong thing.
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 font-body text-caption font-semibold ${
        passes ? 'bg-available text-ink' : 'bg-ink text-bg'
      }`}
    >
      {passes ? 'PASS' : 'FAIL'}
    </span>
  )
}

function Heading({ children, id }: { children: string; id: string }) {
  return (
    <h2 id={id} className="font-display text-h2-sm text-ink lg:text-h2">
      {children}
    </h2>
  )
}

export function StyleGuide() {
  const [swatches, setSwatches] = useState<Swatch[]>([])
  const [results, setResults] = useState<PairResult[]>([])

  // Every number on this page is read off the live custom properties after
  // mount, so editing a token in index.css moves the reported ratios with it.
  useEffect(() => {
    setSwatches(
      PALETTE.map((entry) => ({
        ...entry,
        value: tokenValue(entry.token).toUpperCase(),
      })),
    )

    setResults(
      CONTRAST_PAIRS.map((pair) => {
        const result = measure(
          `--color-${pair.foreground}`,
          `--color-${pair.background}`,
          pair.fontSizePx,
          pair.bold ?? false,
        )
        return {
          pair,
          ratio: result?.ratio ?? null,
          required: result?.required ?? 4.5,
          passes: result?.passes ?? false,
        }
      }),
    )
  }, [])

  const inUse = results.filter((r) => !r.pair.demonstratesRule)
  const demonstrations = results.filter((r) => r.pair.demonstratesRule)
  const failures = inUse.filter((r) => !r.passes)

  return (
    <div className="bg-bg pt-nav-clear pb-section">
      <Container>
        <h1 className="font-display text-display-sm text-ink lg:text-display">Styleguide</h1>
        <p className="mt-6 max-w-narrow font-body text-body-lg text-muted">
          Every token, contrast pair, button state and type step this site is
          built from. Contrast ratios are computed in the browser from the live
          token values — none of them are written down.
        </p>

        {/* ---------------------------------------------------------- palette */}
        <section className="mt-section-tight" aria-labelledby="palette">
          <Heading id="palette">Palette</Heading>
          <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {swatches.map((swatch) => (
              <li key={swatch.token} className="rounded-card border border-border">
                <div className={`h-24 rounded-t-card ${BG_CLASS[swatch.name]}`} />
                <div className="p-4">
                  <p className="font-display text-body font-bold text-ink">{swatch.name}</p>
                  <p className="font-body text-body-sm text-muted">{swatch.token}</p>
                  <p className="mt-1 font-body text-body-sm text-ink">{swatch.value}</p>
                  <p className="mt-2 font-body text-caption text-muted">{swatch.usage}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* --------------------------------------------------- the accent rule */}
        <section className="mt-section-tight" aria-labelledby="accent-rule">
          <Heading id="accent-rule">The accent rule</Heading>
          <p className="mt-4 max-w-narrow font-body text-body text-muted">
            Accent is a background only. Text sitting on an accent fill is
            always ink. The two panels below are the same fill with the only
            two candidate text colours.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {demonstrations
              .filter((r) => r.pair.background === 'accent')
              .concat(inUse.filter((r) => r.pair.background === 'accent'))
              .sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0))
              .map((result) => (
                <div
                  key={`${result.pair.foreground}-${result.pair.background}`}
                  className="rounded-card bg-accent p-8"
                >
                  <p
                    className={`font-display font-bold ${TEXT_CLASS[result.pair.foreground]}`}
                    style={{ fontSize: result.pair.fontSizePx }}
                  >
                    {result.pair.foreground === 'ink' ? 'Book a meeting' : 'Book a meeting'}
                  </p>
                  <p className={`mt-4 font-body text-body-sm ${TEXT_CLASS.ink}`}>
                    text-{result.pair.foreground} on bg-accent
                  </p>
                  <p className={`font-body text-body-sm font-semibold ${TEXT_CLASS.ink}`}>
                    {result.ratio ? formatRatio(result.ratio) : '—'} · needs{' '}
                    {result.required}:1 · {result.passes ? 'PASS' : 'FAIL'}
                  </p>
                </div>
              ))}
          </div>
        </section>

        {/* --------------------------------------------------------- contrast */}
        <section className="mt-section-tight" aria-labelledby="contrast">
          <Heading id="contrast">Contrast — pairs in use</Heading>
          <p className="mt-4 max-w-narrow font-body text-body text-muted">
            Threshold is 4.5:1, relaxing to 3:1 at 24px or at 18.66px bold.
            {failures.length > 0
              ? ` ${failures.length} pair${failures.length === 1 ? '' : 's'} in use below threshold.`
              : ' All pairs in use clear their threshold.'}
          </p>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border">
                  {['Sample', 'Pair', 'Size', 'Ratio', 'Needs', 'Verdict', 'Used for'].map((head) => (
                    <th
                      key={head}
                      scope="col"
                      className="py-3 pr-4 font-body text-label text-muted uppercase"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inUse.map((result) => (
                  <tr
                    key={`${result.pair.foreground}-${result.pair.background}-${result.pair.fontSizePx}`}
                    className="border-b border-border align-middle"
                  >
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block rounded-control px-3 py-2 ${
                          BG_CLASS[result.pair.background]
                        } ${TEXT_CLASS[result.pair.foreground]} ${
                          result.pair.bold ? 'font-bold' : ''
                        }`}
                        style={{ fontSize: result.pair.fontSizePx }}
                      >
                        Aa
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-body text-body-sm text-ink">
                      {result.pair.foreground} on {result.pair.background}
                    </td>
                    <td className="py-3 pr-4 font-body text-body-sm text-muted">
                      {result.pair.fontSizePx}px{result.pair.bold ? ' bold' : ''}
                    </td>
                    <td className="py-3 pr-4 font-body text-body-sm font-semibold text-ink">
                      {result.ratio ? formatRatio(result.ratio) : '—'}
                    </td>
                    <td className="py-3 pr-4 font-body text-body-sm text-muted">
                      {result.required}:1
                    </td>
                    <td className="py-3 pr-4">
                      <Verdict passes={result.passes} demonstration={false} />
                    </td>
                    <td className="py-3 pr-4 font-body text-caption text-muted">
                      {result.pair.usage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --------------------------------------------------- banned pairings */}
        <section className="mt-section-tight" aria-labelledby="banned">
          <Heading id="banned">Contrast — pairings that fail</Heading>
          <p className="mt-4 max-w-narrow font-body text-body text-muted">
            Two groups: the combinations the brief bans outright, and the ones
            a developer reaches for by reflex that miss AA. Both are on the page
            so the limit is visible rather than merely written down. None of
            them appears in a component.
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {demonstrations.map((result) => (
              <li
                key={`${result.pair.foreground}-${result.pair.background}`}
                className="flex flex-wrap items-center gap-4 rounded-card border border-border p-4"
              >
                <span
                  className={`inline-block rounded-control px-4 py-2 font-bold ${
                    BG_CLASS[result.pair.background]
                  } ${TEXT_CLASS[result.pair.foreground]}`}
                  style={{ fontSize: result.pair.fontSizePx }}
                >
                  Aa
                </span>
                <span className="font-body text-body-sm text-ink">
                  {result.pair.foreground} on {result.pair.background}
                </span>
                <span className="font-body text-body-sm font-semibold text-ink">
                  {result.ratio ? formatRatio(result.ratio) : '—'}
                </span>
                <Verdict passes={result.passes} demonstration />
                <span className="font-body text-caption text-muted">
                  {result.pair.demonstratesRule}
                </span>
                {result.pair.insteadUse ? (
                  <span className="font-body text-caption font-semibold text-ink">
                    Use instead: {result.pair.insteadUse}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------------------------------------------------- buttons */}
        <section className="mt-section-tight" aria-labelledby="buttons">
          <Heading id="buttons">Buttons</Heading>
          <p className="mt-4 max-w-narrow font-body text-body text-muted">
            Tab through the live row to see the real focus ring. The forced row
            below applies the same outline unconditionally so it can be
            compared side by side.
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="rounded-card border border-border p-6">
              <h3 className="font-display text-h3-sm text-ink">accent</h3>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Button variant="accent">Book a meeting</Button>
                <Button variant="accent" size="sm">
                  View all <Icon name="arrow-right" size={16} />
                </Button>
                <Button variant="accent" disabled>
                  Disabled
                </Button>
              </div>
              <p className="mt-4 font-body text-caption text-muted">Forced focus ring</p>
              <div className="mt-2 [&_a]:outline-2 [&_a]:outline-ink [&_a]:-outline-offset-4 [&_button]:outline-2 [&_button]:outline-ink [&_button]:-outline-offset-4">
                <Button variant="accent">Book a meeting</Button>
              </div>
            </div>

            <div className="rounded-card border border-border p-6">
              <h3 className="font-display text-h3-sm text-ink">secondary</h3>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Button variant="secondary">View vehicle</Button>
                <Button variant="secondary" size="sm" shape="control">
                  Search vehicles
                </Button>
                <Button variant="secondary" disabled>
                  Disabled
                </Button>
              </div>
              <p className="mt-4 font-body text-caption text-muted">Forced focus ring</p>
              <div className="mt-2 [&_a]:outline-2 [&_a]:outline-ink [&_a]:-outline-offset-4 [&_button]:outline-2 [&_button]:outline-ink [&_button]:-outline-offset-4">
                <Button variant="secondary">View vehicle</Button>
              </div>
            </div>

            <div className="rounded-card bg-ink p-6 lg:col-span-2">
              <h3 className="font-display text-h3-sm text-bg">dark-section</h3>
              <p className="mt-2 font-body text-body-sm text-border">
                Only used on the ink and graphite bands. Its focus ring is drawn
                in white because ink would disappear into the band.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Button variant="dark-section">See all vehicles</Button>
                <Button variant="dark-section" size="sm">
                  Learn more
                </Button>
                <Button variant="dark-section" disabled>
                  Disabled
                </Button>
                <Button variant="accent">Book a meeting</Button>
              </div>
              <p className="mt-4 font-body text-caption text-border">Forced focus ring</p>
              <div className="mt-2 [&_a]:outline-2 [&_a]:outline-bg [&_a]:-outline-offset-4 [&_button]:outline-2 [&_button]:outline-bg [&_button]:-outline-offset-4">
                <Button variant="dark-section">See all vehicles</Button>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ status pills */}
        <section className="mt-section-tight" aria-labelledby="status">
          <Heading id="status">Status</Heading>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <StatusPill status="available" />
            <StatusPill status="sold" />
            <StatusPill status="new" />
          </div>
        </section>

        {/* ------------------------------------------------------------- type */}
        <section className="mt-section-tight" aria-labelledby="type">
          <Heading id="type">Type scale</Heading>
          <p className="mt-4 max-w-narrow font-body text-body text-muted">
            Two real layouts, not one scaled. The left column is what renders at
            390px, the right is 1280px.
          </p>

          <ul className="mt-8 flex flex-col gap-10">
            {TYPE_SCALE.map((step) => (
              <li key={step.name} className="border-t border-border pt-6">
                <p className="font-body text-label text-muted uppercase">
                  {step.name} · {step.family} · {step.usage}
                </p>
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <div>
                    <p className="font-body text-caption text-muted">
                      390px — {step.mobileClass} · {step.mobilePx}px
                    </p>
                    <p
                      className={`mt-2 text-ink ${step.mobileClass} ${
                        step.family === 'display' ? 'font-display' : 'font-body'
                      }`}
                    >
                      Find your next premium car
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-caption text-muted">
                      1280px — {step.desktopClass} · {step.desktopPx}px
                    </p>
                    <p
                      className={`mt-2 text-ink ${step.desktopClass} ${
                        step.family === 'display' ? 'font-display' : 'font-body'
                      }`}
                    >
                      Find your next premium car
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </div>
  )
}
