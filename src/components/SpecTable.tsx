export interface SpecGroup {
  heading: string
  rows: readonly { label: string; value: string }[]
}

interface SpecTableProps {
  groups: readonly SpecGroup[]
}

/**
 * The three-column specification block. Each column is a definition list, so
 * the label/value pairing survives with styles off and reads correctly to a
 * screen reader.
 *
 * It sits on the light band, which is why the labels are muted only inside
 * the white card the caller places it in — muted on #F3F4F6 is 4.49:1 and
 * fails by a hundredth (section 4).
 */
export function SpecTable({ groups }: SpecTableProps) {
  return (
    <div className="grid gap-8 rounded-card border border-border bg-bg p-6 lg:grid-cols-3 lg:gap-10 lg:p-8">
      {groups.map((group) => (
        <section key={group.heading}>
          <h3 className="font-display text-h3-sm text-ink">{group.heading}</h3>
          <dl className="mt-4 divide-y divide-border">
            {group.rows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-6 py-3">
                <dt className="font-body text-body-sm text-muted">{row.label}</dt>
                <dd className="text-right font-body text-body-sm font-semibold text-ink">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
