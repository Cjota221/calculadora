import type { DynamicRow, CalcResult } from '@/types'
import { fmt } from '@/lib/formatCurrency'
import { DespesaRow } from './DespesaRow'
import { TaxaRow } from './TaxaRow'
import { MargemIndicator } from './MargemIndicator'
import { PromoSection } from './PromoSection'
import { PrecoPraticado } from './PrecoPraticado'
import { PrecoEditavel } from './PrecoEditavel'

interface TabPrecificarProps {
  cost: string
  setCost: (v: string) => void
  freightUnit: string
  setFreightUnit: (v: string) => void
  margin: string
  setMargin: (v: string) => void
  despesas: DynamicRow[]
  taxas: DynamicRow[]
  onAddDespesa: () => void
  onRemoveDespesa: (id: number) => void
  onUpdateDespesa: (id: number, field: 'label' | 'value', val: string) => void
  onAddTaxa: () => void
  onRemoveTaxa: (id: number) => void
  onUpdateTaxa: (id: number, field: 'label' | 'value', val: string) => void
  freteCalculado?: number | null
  onUsarFreteCalculado?: () => void
  result: CalcResult | null
  discount: string
  setDiscount: (v: string) => void
  promoOpen: boolean
  onTogglePromo: () => void
  nomeProduto: string
  onNomeProdutoChange: (v: string) => void
  dataVenda: string
  onDataVendaChange: (v: string) => void
  salvando: boolean
  onSalvarCalculo: () => void
  onCalcular: () => void
}

export function TabPrecificar({
  cost, setCost, freightUnit, setFreightUnit, margin, setMargin,
  despesas, taxas,
  onAddDespesa, onRemoveDespesa, onUpdateDespesa,
  onAddTaxa, onRemoveTaxa, onUpdateTaxa,
  freteCalculado, onUsarFreteCalculado,
  result, discount, setDiscount, promoOpen, onTogglePromo,
  nomeProduto, onNomeProdutoChange, dataVenda, onDataVendaChange,
  salvando, onSalvarCalculo,
  onCalcular,
}: TabPrecificarProps) {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-icon">
          <svg viewBox="0 0 24 24">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        </div>
        <div className="card-head-text">
          <h2>Calcular Preço</h2>
          <p>Preencha os custos para encontrar o preço ideal</p>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Custo do produto</label>
          <div className="input-wrap">
            <span className="pfx">R$</span>
            <input type="number" className="has-pfx" placeholder="0,00" step="0.01" min="0" value={cost} onChange={e => setCost(e.target.value)} />
          </div>
          <div className="field-hint">Valor pago ao fornecedor por unidade</div>
        </div>
        <div className="field">
          <label>Frete unitário</label>
          <div className="input-wrap">
            <span className="pfx">R$</span>
            <input type="number" className="has-pfx" placeholder="0,00" step="0.01" min="0" value={freightUnit} onChange={e => setFreightUnit(e.target.value)} />
          </div>
          {freteCalculado && onUsarFreteCalculado ? (
            <button className="frete-atalho" onClick={onUsarFreteCalculado}>
              <svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
              Usar R$ {freteCalculado.toFixed(2).replace('.', ',')} calculado na aba Frete
            </button>
          ) : (
            <div className="field-hint">Calcule na aba Frete e o valor será aplicado aqui</div>
          )}
        </div>
      </div>

      <hr className="sep" />
      <div className="sep-label">Outras despesas por unidade</div>
      <div className="row-list">
        {despesas.map(r => (
          <DespesaRow key={r.id} row={r} onChange={onUpdateDespesa} onRemove={onRemoveDespesa} />
        ))}
      </div>
      <button className="btn-add-row" onClick={onAddDespesa}>
        <svg viewBox="0 0 14 14"><line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" /></svg>
        Adicionar despesa
      </button>

      <hr className="sep" />
      <div className="sep-label">Taxas de plataforma / pagamento</div>
      <div className="row-list">
        {taxas.map(r => (
          <TaxaRow key={r.id} row={r} onChange={onUpdateTaxa} onRemove={onRemoveTaxa} />
        ))}
      </div>
      <button className="btn-add-row" onClick={onAddTaxa}>
        <svg viewBox="0 0 14 14"><line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" /></svg>
        Adicionar taxa
      </button>

      <hr className="sep" />
      <div className="sep-label">Margem de lucro</div>
      <div className="field">
        <label>Margem desejada</label>
        <div className="input-wrap">
          <input type="number" className="has-sfx" placeholder="Ex: 50" step="1" min="1" value={margin} onChange={e => setMargin(e.target.value)} />
          <span className="sfx">%</span>
        </div>
        <div className="field-hint">Digite quanto quer ganhar — interpretamos automaticamente</div>
      </div>

      <button className="btn btn-primary" onClick={onCalcular}>
        <svg viewBox="0 0 24 24">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
        Calcular Preço Ideal
      </button>

      {result && (
        <>
          <div className="result res-pink">
            <div className="res-label c-pink">Preço ideal de venda</div>
            <PrecoEditavel result={result} />
            <div className="res-meta">
              Custo base: {fmt(result.base)}
              {result.taxaPct > 0 && `  ·  Taxas (${result.taxaPct.toFixed(1)}%): ${fmt(result.taxaAmt)}`}
            </div>
            <MargemIndicator
              level={result.margemLevel}
              label={result.margemLabel}
              desc={result.margemDesc}
              pct={result.margemPct}
            />
            {result.markupDigitado !== undefined && (
              <div className="aviso-interpretacao">
                Interpretamos que você quer ganhar <strong>{result.markupDigitado}%</strong> em cima do custo — isso equivale a <strong>{result.margin.toFixed(1)}%</strong> de margem sobre o preço de venda.
              </div>
            )}
            <PrecoPraticado result={result} />
          </div>

          <div className="field-row" style={{ marginTop: '0.75rem' }}>
            <div className="field">
              <label>Nome do produto <span style={{ fontWeight: 400, color: '#6B6360' }}>(opcional)</span></label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Bolsa de couro caramelo"
                value={nomeProduto}
                onChange={e => onNomeProdutoChange(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Data da venda <span style={{ fontWeight: 400, color: '#6B6360' }}>(opcional)</span></label>
              <input
                type="date"
                className="input"
                value={dataVenda}
                onChange={e => onDataVendaChange(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-save" onClick={onSalvarCalculo} disabled={salvando}>
            <svg viewBox="0 0 24 24">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {salvando ? 'Salvando...' : 'Salvar cálculo'}
          </button>

          <PromoSection
            open={promoOpen}
            onToggle={onTogglePromo}
            discount={discount}
            onDiscountChange={setDiscount}
            basePrice={result.price}
            baseCost={result.base}
            taxaPct={result.taxaPct}
          />
        </>
      )}
    </div>
  )
}
