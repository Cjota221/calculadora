import { fmt } from '@/lib/formatCurrency'

interface PromoSectionProps {
  open: boolean
  onToggle: () => void
  discount: string
  onDiscountChange: (val: string) => void
  basePrice: number
  baseCost: number
  taxaPct: number
}

export function PromoSection({ open, onToggle, discount, onDiscountChange, basePrice, baseCost, taxaPct }: PromoSectionProps) {
  const d = parseFloat(discount) || 0
  const promoPrice = d > 0 ? basePrice * (1 - d / 100) : null
  const promoTaxaAmt = promoPrice !== null ? promoPrice * taxaPct / 100 : 0
  const promoProfit = promoPrice !== null ? promoPrice - baseCost - promoTaxaAmt : null
  const descontoMaximo = taxaPct < 100
    ? (100 * (1 - baseCost / (basePrice * (1 - taxaPct / 100)))).toFixed(1)
    : '0'

  return (
    <>
      <div className="promo-trigger" onClick={onToggle}>
        <span>Simular desconto ou promoção</span>
        <span className={`promo-chev${open ? ' open' : ''}`}>▼</span>
      </div>
      {open && (
        <div className="promo-inner">
          <div className="field">
            <label>Percentual de desconto</label>
            <div className="input-wrap">
              <input
                type="number"
                className="has-sfx"
                placeholder="Ex: 10"
                step="0.5"
                min="0"
                max="99"
                value={discount}
                onChange={e => onDiscountChange(e.target.value)}
              />
              <span className="sfx">%</span>
            </div>
          </div>
          {promoPrice !== null && promoProfit !== null && (
            <div className="result res-gold">
              <div className="res-label c-gold">Preço com desconto</div>
              <div className="res-promo-price c-gold">{fmt(promoPrice)}</div>
              <div className="res-promo-meta">{discount}% de desconto sobre {fmt(basePrice)}</div>
              {promoProfit >= 0
                ? <div className="res-promo-profit">Você ainda lucra <strong>{fmt(promoProfit)}</strong> por unidade</div>
                : (
                  <div className="res-promo-warn">
                    Atenção: prejuízo de <strong>{fmt(Math.abs(promoProfit))}</strong> por unidade.
                    Desconto máximo seguro: <strong>{descontoMaximo}%</strong>
                  </div>
                )
              }
            </div>
          )}
        </div>
      )}
    </>
  )
}
