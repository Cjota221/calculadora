import type { EqResult } from '@/types'
import { fmt } from '@/lib/formatCurrency'

interface TabEquilibrioProps {
  fixedCosts: string
  setFixedCosts: (v: string) => void
  eqSell: string
  setEqSell: (v: string) => void
  eqCost: string
  setEqCost: (v: string) => void
  result: EqResult | null
  onCalcular: () => void
}

export function TabEquilibrio({
  fixedCosts, setFixedCosts, eqSell, setEqSell, eqCost, setEqCost,
  result, onCalcular,
}: TabEquilibrioProps) {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-icon blue-icon">
          <svg viewBox="0 0 24 24">
            <line x1="12" y1="3" x2="12" y2="21" />
            <path d="M3 9l9-7 9 7" />
            <path d="M5 12H1l2 5h4l2-5H5z" />
            <path d="M19 12h-4l2 5h4l2-5h-4z" />
          </svg>
        </div>
        <div className="card-head-text">
          <h2>Ponto de Equilíbrio</h2>
          <p>Quantas vendas para cobrir seus custos fixos?</p>
        </div>
      </div>

      <div className="info-box">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p>
          <strong>O que são custos fixos?</strong> São gastos que você tem todo mês independente de vender ou não — como aluguel, mensalidade de app, internet, celular, contador, embalagens fixas, etc.
        </p>
      </div>

      <div className="field">
        <label>Total de custos fixos mensais</label>
        <div className="input-wrap">
          <span className="pfx">R$</span>
          <input type="number" className="has-pfx" placeholder="Ex: 2.000,00" step="0.01" min="0" value={fixedCosts} onChange={e => setFixedCosts(e.target.value)} />
        </div>
        <div className="field-hint">Some todos os seus gastos fixos do mês</div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Preço de venda</label>
          <div className="input-wrap">
            <span className="pfx">R$</span>
            <input type="number" className="has-pfx" placeholder="Ex: 59,90" step="0.01" min="0" value={eqSell} onChange={e => setEqSell(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Custo variável / un.</label>
          <div className="input-wrap">
            <span className="pfx">R$</span>
            <input type="number" className="has-pfx" placeholder="Ex: 32,00" step="0.01" min="0" value={eqCost} onChange={e => setEqCost(e.target.value)} />
          </div>
          <div className="field-hint">Produto + frete + embalagem</div>
        </div>
      </div>

      <button className="btn btn-blue" onClick={onCalcular}>Calcular Ponto de Equilíbrio</button>

      {result && (
        <div className="result res-blue">
          <div className="res-label c-blue">Você precisa vender</div>
          <div className="eq-big c-blue">{result.be}</div>
          <div className="eq-unit">unidades por mês para cobrir {fmt(result.fixed)} em custos fixos</div>
          <div className="eq-grid">
            <div className="eq-stat">
              <div className="eq-val">{fmt(result.contrib)}</div>
              <div className="eq-lbl">Margem de contribuição por unidade</div>
            </div>
            <div className="eq-stat">
              <div className="eq-val">{fmt(result.rev)}</div>
              <div className="eq-lbl">Faturamento mínimo mensal</div>
            </div>
            <div className="eq-stat">
              <div className="eq-val">~{result.daily}/dia</div>
              <div className="eq-lbl">Média por dia útil (22 dias)</div>
            </div>
            <div className="eq-stat">
              <div className="eq-val">{fmt(result.fixed)}</div>
              <div className="eq-lbl">Custos fixos cobertos</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
