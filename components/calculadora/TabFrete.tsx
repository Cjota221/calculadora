import type { FreteResult } from '@/types'
import { fmt } from '@/lib/formatCurrency'

interface TabFreteProps {
  freightTotal: string
  setFreightTotal: (v: string) => void
  freightQty: string
  setFreightQty: (v: string) => void
  result: FreteResult | null
  onCalcular: () => void
  onUsarFrete: (unit: number) => void
}

export function TabFrete({
  freightTotal, setFreightTotal, freightQty, setFreightQty,
  result, onCalcular, onUsarFrete,
}: TabFreteProps) {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-icon green-icon">
          <svg viewBox="0 0 24 24">
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 4v4h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <div className="card-head-text">
          <h2>Frete Unitário</h2>
          <p>Divida o custo do frete entre os produtos</p>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Frete total pago</label>
          <div className="input-wrap">
            <span className="pfx">R$</span>
            <input type="number" className="has-pfx" placeholder="0,00" step="0.01" min="0" value={freightTotal} onChange={e => setFreightTotal(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Qtd. de produtos</label>
          <input type="number" placeholder="Ex: 12" step="1" min="1" value={freightQty} onChange={e => setFreightQty(e.target.value)} />
          <div className="field-hint">Total de pares ou unidades</div>
        </div>
      </div>

      <button className="btn btn-green" onClick={onCalcular}>Calcular Frete por Unidade</button>

      {result && (
        <>
          <div className="result res-green">
            <div className="res-label c-green">Custo do frete por unidade</div>
            <div className="frete-big c-green">{fmt(result.unit)}</div>
            <div className="frete-meta">{fmt(result.total)} ÷ {result.qty} unidades</div>
            <div className="frete-tip">
              Clique em <strong>&quot;Usar este valor&quot;</strong> para preencher automaticamente na aba Precificar.
            </div>
          </div>
          <button className="btn btn-ghost" onClick={() => onUsarFrete(result.unit)}>
            <svg viewBox="0 0 24 24">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            Usar este valor na aba Precificar
          </button>
        </>
      )}
    </div>
  )
}
