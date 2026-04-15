import type { DynamicRow } from '@/types'

interface DespesaRowProps {
  row: DynamicRow
  onChange: (id: number, field: 'label' | 'value', val: string) => void
  onRemove: (id: number) => void
}

export function DespesaRow({ row, onChange, onRemove }: DespesaRowProps) {
  return (
    <div className="drow">
      <input
        type="text"
        placeholder="Ex: Embalagem"
        value={row.label}
        onChange={e => onChange(row.id, 'label', e.target.value)}
      />
      <div className="input-wrap" style={{ minWidth: 100 }}>
        <span className="pfx">R$</span>
        <input
          type="number"
          className="has-pfx"
          placeholder="0,00"
          step="0.01"
          min="0"
          value={row.value}
          onChange={e => onChange(row.id, 'value', e.target.value)}
        />
      </div>
      <button className="row-remove" onClick={() => onRemove(row.id)} title="Remover">
        <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="1" y1="1" x2="13" y2="13" /><line x1="13" y1="1" x2="1" y2="13" />
        </svg>
      </button>
    </div>
  )
}
