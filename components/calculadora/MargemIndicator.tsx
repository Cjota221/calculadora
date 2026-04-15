import type { MargemLevel } from '@/types'

interface MargemIndicatorProps {
  level: MargemLevel
  label: string
  desc: string
  pct: number
}

const colors: Record<MargemLevel, string> = {
  fraca: 'var(--red)',
  ok: 'var(--orange)',
  boa: 'var(--gold)',
  otima: 'var(--green)',
}

const badgeClass: Record<MargemLevel, string> = {
  fraca: 'mb-fraca',
  ok: 'mb-ok',
  boa: 'mb-boa',
  otima: 'mb-otima',
}

export function MargemIndicator({ level, label, desc, pct }: MargemIndicatorProps) {
  return (
    <div className="mbar">
      <div className="mbar-top">
        <span className="mbar-lbl">Saúde da margem</span>
        <span className={`mbadge ${badgeClass[level]}`}>{label}</span>
      </div>
      <div className="mbar-track">
        <div className="mbar-fill" style={{ width: `${pct}%`, background: colors[level] }} />
      </div>
      <div className="mbar-desc">{desc}</div>
    </div>
  )
}
