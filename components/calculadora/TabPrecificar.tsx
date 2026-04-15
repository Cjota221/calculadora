import type { DynamicRow, CalcResult } from '@/types'
import { fmt } from '@/lib/formatCurrency'
import { DespesaRow } from './DespesaRow'
import { TaxaRow } from './TaxaRow'
import { MargemIndicator } from './MargemIndicator'
import { PromoSection } from './PromoSection'

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
  onCalcular: () => void
  onSendWhatsApp: () => void
}

export function TabPrecificar({
  cost, setCost, freightUnit, setFreightUnit, margin, setMargin,
  despesas, taxas,
  onAddDespesa, onRemoveDespesa, onUpdateDespesa,
  onAddTaxa, onRemoveTaxa, onUpdateTaxa,
  freteCalculado, onUsarFreteCalculado,
  result, discount, setDiscount, promoOpen, onTogglePromo,
  onCalcular, onSendWhatsApp,
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
        <div className="field-hint">Quanto você quer ganhar sobre o custo total</div>
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
            <div className="res-price c-pink">{fmt(result.price)}</div>
            <div className="res-meta">
              Custo base: {fmt(result.base)}
              {result.taxaPct > 0 && `  ·  Taxas (${result.taxaPct.toFixed(1)}%): ${fmt(result.taxaAmt)}`}
            </div>
            <div className="res-profit">Lucro líquido por unidade: <strong>{fmt(result.profit)}</strong></div>
            <MargemIndicator
              level={result.margemLevel}
              label={result.margemLabel}
              desc={result.margemDesc}
              pct={result.margemPct}
            />
          </div>

          <button className="btn btn-wpp" onClick={onSendWhatsApp}>
            <svg viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Enviar resultado pelo WhatsApp
          </button>

          <PromoSection
            open={promoOpen}
            onToggle={onTogglePromo}
            discount={discount}
            onDiscountChange={setDiscount}
            basePrice={result.price}
            baseCost={result.base}
          />
        </>
      )}
    </div>
  )
}
