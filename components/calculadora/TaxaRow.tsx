import type { DynamicRow } from '@/types'

interface TaxaRowProps {
  row: DynamicRow
  onChange: (id: number, field: 'label' | 'value', val: string) => void
  onRemove: (id: number) => void
}

export function TaxaRow({ row, onChange, onRemove }: TaxaRowProps) {
  return (
    <div className="trow">
      <input
        type="text"
        placeholder="Ex: Taxa do app"
        value={row.label}
        onChange={e => onChange(row.id, 'label', e.target.value)}
      />
      <div className="input-wrap" style={{ minWidth: 90 }}>
        <input
          type="number"
          className="has-sfx"
          placeholder="0"
          step="0.1"
          min="0"
          max="99"
          value={row.value}
          onChange={e => onChange(row.id, 'value', e.target.value)}
        />
        <span className="sfx sfx-sm">%</span>
      </div>
      <button className="row-remove" onClick={() => onRemove(row.id)} title="Remover">
        <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="1" y1="1" x2="13" y2="13" /><line x1="13" y1="1" x2="1" y2="13" />
        </svg>
      </button>
    </div>
  )
}
