'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface Row { id: number; label: string; value: string }

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

type Tab = 'precificacao' | 'frete' | 'equilibrio' | 'guia'
type MargemLevel = 'fraca' | 'ok' | 'boa' | 'otima'

interface CalcResult {
  price: number
  base: number
  taxaAmt: number
  profit: number
  margin: number
  taxaPct: number
  margemLevel: MargemLevel
  margemLabel: string
  margemDesc: string
  margemPct: number
}

interface FreteResult {
  unit: number
  total: number
  qty: number
}

interface EqResult {
  be: number
  contrib: number
  rev: number
  daily: number
  fixed: number
}

export default function AppPage() {
  const { user, loading, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('precificacao')

  // Precificação
  const [cost, setCost] = useState('')
  const [freightUnit, setFreightUnit] = useState('')
  const [margin, setMargin] = useState('')
  const [despesas, setDespesas] = useState<Row[]>([{ id: 1, label: '', value: '' }])
  const [taxas, setTaxas] = useState<Row[]>([{ id: 1, label: '', value: '' }])
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null)
  const [discount, setDiscount] = useState('')
  const [promoOpen, setPromoOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  // Frete
  const [freightTotal, setFreightTotal] = useState('')
  const [freightQty, setFreightQty] = useState('')
  const [freteResult, setFreteResult] = useState<FreteResult | null>(null)

  // Equilíbrio
  const [fixedCosts, setFixedCosts] = useState('')
  const [eqSell, setEqSell] = useState('')
  const [eqCost, setEqCost] = useState('')
  const [eqResult, setEqResult] = useState<EqResult | null>(null)

  function showToast(msg: string) {
    setToast(msg); setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2600)
  }

  // Row helpers
  let nextId = Date.now()
  function addRow(setter: React.Dispatch<React.SetStateAction<Row[]>>) {
    setter(prev => [...prev, { id: nextId++, label: '', value: '' }])
  }
  function removeRow(setter: React.Dispatch<React.SetStateAction<Row[]>>, id: number, rows: Row[]) {
    if (rows.length <= 1) {
      setter(prev => prev.map(r => r.id === id ? { ...r, label: '', value: '' } : r))
      return
    }
    setter(prev => prev.filter(r => r.id !== id))
  }
  function updateRow(setter: React.Dispatch<React.SetStateAction<Row[]>>, id: number, field: 'label' | 'value', val: string) {
    setter(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))
  }

  function getMargemInfo(m: number): { level: MargemLevel; label: string; desc: string; pct: number } {
    if (m < 20) return { level: 'fraca', label: 'Margem fraca', desc: 'Risco de prejuízo com qualquer imprevisto. Revise seus custos.', pct: Math.min(m / 20 * 25, 25) }
    if (m < 40) return { level: 'ok', label: 'Razoável', desc: 'Margem apertada. Tente aumentar o preço ou reduzir custos.', pct: 25 + (m - 20) / 20 * 25 }
    if (m < 60) return { level: 'boa', label: 'Boa margem', desc: 'Você está no caminho certo. Margem sustentável.', pct: 50 + (m - 40) / 20 * 25 }
    return { level: 'otima', label: 'Excelente', desc: 'Margem muito saudável. Negócio bem posicionado.', pct: Math.min(75 + (m - 60) / 40 * 25, 100) }
  }

  function calcular() {
    const c = parseFloat(cost) || 0
    const f = parseFloat(freightUnit) || 0
    const m = parseFloat(margin) || 0
    if (c <= 0) { showToast('Informe o custo do produto'); return }
    if (m <= 0) { showToast('Informe a margem de lucro'); return }

    const totalDesp = despesas.reduce((acc, r) => acc + (parseFloat(r.value) || 0), 0)
    const totalTaxaPct = taxas.reduce((acc, r) => acc + (parseFloat(r.value) || 0), 0)
    const base = c + f + totalDesp
    let price = base * (1 + m / 100)
    if (totalTaxaPct > 0) price = price / (1 - totalTaxaPct / 100)
    const taxaAmt = price * totalTaxaPct / 100
    const profit = price - base - taxaAmt
    const mi = getMargemInfo(m)
    setCalcResult({ price, base, taxaAmt, profit, margin: m, taxaPct: totalTaxaPct, margemLevel: mi.level, margemLabel: mi.label, margemDesc: mi.desc, margemPct: mi.pct })
    setDiscount('')
    setPromoOpen(false)
  }

  function calcularFrete() {
    const total = parseFloat(freightTotal) || 0
    const qty = parseFloat(freightQty) || 0
    if (total <= 0) { showToast('Informe o valor do frete'); return }
    if (qty < 1) { showToast('Informe a quantidade de produtos'); return }
    setFreteResult({ unit: total / qty, total, qty })
  }

  function usarFrete(unit: number) {
    setFreightUnit(unit.toFixed(2))
    setTab('precificacao')
    showToast('Frete aplicado! Complete os outros campos.')
  }

  function calcularEq() {
    const fixed = parseFloat(fixedCosts) || 0
    const sell = parseFloat(eqSell) || 0
    const variable = parseFloat(eqCost) || 0
    if (fixed <= 0) { showToast('Informe os custos fixos'); return }
    if (sell <= 0) { showToast('Informe o preço de venda'); return }
    if (variable <= 0) { showToast('Informe o custo variável'); return }
    if (variable >= sell) { showToast('Custo variável não pode ser maior que o preço de venda'); return }
    const contrib = sell - variable
    const be = Math.ceil(fixed / contrib)
    setEqResult({ be, contrib, rev: be * sell, daily: Math.ceil(be / 22), fixed })
  }

  function sendWhatsApp() {
    if (!calcResult) return
    const d = parseFloat(discount) || 0
    let t = '*Precificação calculada*\n\n'
    t += `Custo base: ${fmt(calcResult.base)}\n`
    t += `Preço de venda: *${fmt(calcResult.price)}*\n`
    t += `Margem: ${calcResult.margin}%\n`
    if (d > 0) {
      const pp = calcResult.price * (1 - d / 100)
      t += `\n*Promoção ${d}% de desconto:*\n`
      t += `Preço promocional: *${fmt(pp)}*\n`
      t += `Lucro na promoção: ${fmt(pp - calcResult.base)}\n`
    }
    t += '\n_Calculado com Precifique_'
    window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank')
  }

  const promoPrice = calcResult && parseFloat(discount) > 0 ? calcResult.price * (1 - parseFloat(discount) / 100) : null
  const promoProfit = promoPrice !== null && calcResult ? promoPrice - calcResult.base : null

  const margemColors: Record<MargemLevel, string> = { fraca: 'var(--red)', ok: 'var(--orange)', boa: 'var(--gold)', otima: 'var(--green)' }
  const margemBadgeClass: Record<MargemLevel, string> = { fraca: 'mb-fraca', ok: 'mb-ok', boa: 'mb-boa', otima: 'mb-otima' }

  if (loading) return null

  return (
    <>
      <style>{`
        .wrapper{max-width:560px;margin:0 auto;padding:0 1.1rem 5rem}
        .hero{padding:3rem 0 2.25rem;text-align:center}
        .hero-wordmark{display:inline-flex;align-items:center;gap:0.5rem;font-family:var(--font-d);font-size:2.8rem;color:var(--text);letter-spacing:-0.02em;line-height:1;margin-bottom:0.6rem}
        .hero-wordmark .dot{color:var(--pink)}
        .hero-sub{font-size:0.88rem;color:var(--text3);font-weight:400;letter-spacing:0.01em}
        .tabs-nav{display:grid;grid-template-columns:repeat(4,1fr);background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:4px;gap:3px;margin-bottom:1.5rem;box-shadow:var(--shadow)}
        .tab-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:0.6rem 0.3rem;border:none;background:transparent;border-radius:10px;font-family:var(--font-s);font-size:0.65rem;font-weight:600;color:var(--text3);cursor:pointer;transition:all 0.2s var(--ease);text-transform:uppercase;letter-spacing:0.05em}
        .tab-btn svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;transition:all 0.2s}
        .tab-btn:hover{color:var(--text2);background:var(--bg3)}
        .tab-btn.active{background:var(--pink-dim);color:var(--pink);border:1px solid rgba(201,32,158,0.15)}
        .tab-btn.active svg{stroke:var(--pink)}
        .tab-panel{display:none;animation:fadeUp 0.3s var(--ease)}
        .tab-panel.active{display:block}
        .card{background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:1.75rem;margin-bottom:1rem;box-shadow:var(--shadow)}
        .card-head{display:flex;align-items:center;gap:0.85rem;margin-bottom:1.5rem}
        .card-icon{width:40px;height:40px;flex-shrink:0;border-radius:11px;background:var(--pink-dim);border:1px solid rgba(201,32,158,0.12);display:flex;align-items:center;justify-content:center}
        .card-icon svg{width:18px;height:18px;stroke:var(--pink);fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
        .card-icon.green-icon{background:var(--green-dim);border-color:rgba(26,158,92,0.15)}
        .card-icon.green-icon svg{stroke:var(--green)}
        .card-icon.blue-icon{background:var(--blue-dim);border-color:rgba(43,107,232,0.15)}
        .card-icon.blue-icon svg{stroke:var(--blue)}
        .card-head-text h2{font-family:var(--font-s);font-size:1.1rem;font-weight:700;color:var(--text)}
        .card-head-text p{font-size:0.76rem;color:var(--text3);margin-top:1px}
        .sep{border:none;border-top:1px solid var(--border);margin:1.4rem 0}
        .sep-label{font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text3);margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem}
        .sep-label::after{content:'';flex:1;height:1px;background:var(--border)}
        .field{margin-bottom:1rem}
        .field-row{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem}
        .field label{display:block;font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--text3);margin-bottom:0.4rem}
        .input-wrap{position:relative}
        .pfx,.sfx{position:absolute;top:50%;transform:translateY(-50%);font-size:0.85rem;font-weight:600;color:var(--text3);pointer-events:none;transition:color 0.2s}
        .pfx{left:13px}
        .sfx{right:13px}
        .input-wrap:focus-within .pfx,.input-wrap:focus-within .sfx{color:var(--pink)}
        input[type=number],input[type=text]{width:100%;padding:0.82rem 1rem;background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--rs);font-family:var(--font-s);font-size:0.93rem;font-weight:500;color:var(--text);transition:border-color 0.2s,box-shadow 0.2s;outline:none;-moz-appearance:textfield}
        input[type=number].has-pfx{padding-left:2.1rem}
        input[type=number].has-sfx,input[type=text].has-sfx{padding-right:2.4rem}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        input[type=number]:focus,input[type=text]:focus{border-color:rgba(201,32,158,0.35);box-shadow:0 0 0 3px rgba(201,32,158,0.06);background:var(--bg2)}
        input::placeholder{color:var(--text3);font-weight:400}
        .field-hint{font-size:0.69rem;color:var(--text3);margin-top:0.3rem;line-height:1.5}
        .row-list{display:flex;flex-direction:column;gap:0.5rem;margin-bottom:0.6rem}
        .drow,.trow{display:grid;gap:0.5rem;align-items:center}
        .drow{grid-template-columns:1fr auto auto}
        .trow{grid-template-columns:1fr auto auto}
        .drow input[type=text],.trow input[type=text]{font-size:0.87rem}
        .drow input[type=number],.trow input[type=number]{font-size:0.87rem;padding:0.7rem 2.2rem 0.7rem 0.85rem}
        .trow input[type=number]{padding:0.7rem 2.4rem 0.7rem 0.85rem}
        .sfx-sm{right:10px;font-size:0.8rem}
        .row-remove{width:30px;height:30px;flex-shrink:0;border:1.5px solid var(--border);border-radius:8px;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text3);transition:all 0.15s;font-size:1rem;line-height:1}
        .row-remove:hover{border-color:var(--red);color:var(--red);background:var(--red-dim)}
        .btn-add-row{display:flex;align-items:center;gap:0.4rem;background:transparent;border:1.5px dashed var(--border2);border-radius:var(--rs);padding:0.6rem 1rem;font-family:var(--font-s);font-size:0.8rem;font-weight:500;color:var(--text3);cursor:pointer;transition:all 0.2s;width:100%;justify-content:center}
        .btn-add-row:hover{border-color:var(--pink);color:var(--pink);background:var(--pink-dim)}
        .btn-add-row svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}
        .btn{width:100%;padding:0.95rem 1.5rem;border:none;border-radius:var(--rs);font-family:var(--font-s);font-size:0.9rem;font-weight:600;cursor:pointer;transition:all 0.2s var(--ease);display:flex;align-items:center;justify-content:center;gap:0.5rem;letter-spacing:0.01em}
        .btn-primary{background:var(--pink);color:#fff;box-shadow:0 4px 16px rgba(201,32,158,0.25)}
        .btn-primary:hover{background:var(--pink2);box-shadow:0 6px 22px rgba(201,32,158,0.35);transform:translateY(-1px)}
        .btn-primary svg{width:16px;height:16px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
        .btn-green{background:var(--green);color:#fff;box-shadow:0 4px 16px rgba(26,158,92,0.2)}
        .btn-green:hover{filter:brightness(1.08);transform:translateY(-1px)}
        .btn-blue{background:var(--blue);color:#fff;box-shadow:0 4px 16px rgba(43,107,232,0.2)}
        .btn-blue:hover{filter:brightness(1.08);transform:translateY(-1px)}
        .btn-ghost{background:transparent;color:var(--text2);border:1.5px solid var(--border);margin-top:0.65rem;font-size:0.85rem}
        .btn-ghost:hover{border-color:var(--border2);color:var(--text)}
        .btn-ghost svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
        .btn-wpp{background:#25D366;color:#fff;box-shadow:0 4px 14px rgba(37,211,102,0.2);margin-top:0.65rem}
        .btn-wpp:hover{filter:brightness(1.06);transform:translateY(-1px)}
        .btn-wpp svg{width:17px;height:17px;fill:#fff;flex-shrink:0}
        .result{border-radius:var(--r);padding:1.4rem;margin-top:1.1rem}
        .res-pink{background:linear-gradient(135deg,#FDF3FB,#FFF);border:1.5px solid rgba(201,32,158,0.18)}
        .res-gold{background:linear-gradient(135deg,#FDF8EC,#FFF);border:1.5px solid rgba(200,155,42,0.25)}
        .res-green{background:linear-gradient(135deg,#EDFAF3,#FFF);border:1.5px solid rgba(26,158,92,0.2)}
        .res-blue{background:linear-gradient(135deg,#EEF3FD,#FFF);border:1.5px solid rgba(43,107,232,0.2)}
        .res-label{font-size:0.62rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.3rem}
        .c-pink{color:var(--pink)}.c-gold{color:var(--gold)}.c-green{color:var(--green)}.c-blue{color:var(--blue)}
        .res-price{font-family:var(--font-d);font-size:3rem;line-height:1;font-weight:400;margin-bottom:0.3rem}
        .res-meta{font-size:0.76rem;color:var(--text2);margin-bottom:0.75rem;line-height:1.6}
        .res-profit{font-size:0.86rem;color:var(--text);padding-top:0.75rem;border-top:1px solid rgba(0,0,0,0.06)}
        .res-profit strong{color:var(--pink);font-weight:600}
        .mbar{margin-top:1rem;padding-top:1rem;border-top:1px solid rgba(0,0,0,0.06)}
        .mbar-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:0.45rem}
        .mbar-lbl{font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text3)}
        .mbadge{font-size:0.65rem;font-weight:700;padding:2px 10px;border-radius:99px}
        .mb-fraca{background:var(--red-dim);color:var(--red)}
        .mb-ok{background:rgba(201,107,16,0.08);color:var(--orange)}
        .mb-boa{background:rgba(200,155,42,0.1);color:var(--gold)}
        .mb-otima{background:var(--green-dim);color:var(--green)}
        .mbar-track{height:5px;background:var(--bg3);border-radius:99px;overflow:hidden;border:1px solid var(--border)}
        .mbar-fill{height:100%;border-radius:99px;transition:width 0.7s var(--ease)}
        .mbar-desc{font-size:0.71rem;color:var(--text3);margin-top:0.4rem}
        .promo-trigger{display:flex;align-items:center;justify-content:space-between;padding:0.85rem 1.1rem;margin-top:1rem;background:var(--gold-dim);border:1.5px solid rgba(200,155,42,0.2);border-radius:var(--rs);cursor:pointer;font-size:0.84rem;font-weight:500;color:var(--text2);transition:all 0.2s;user-select:none}
        .promo-trigger:hover{border-color:rgba(200,155,42,0.4);color:var(--text)}
        .promo-chev{font-size:0.65rem;color:var(--gold);transition:transform 0.3s}
        .promo-chev.open{transform:rotate(180deg)}
        .promo-inner{padding:1rem 0 0}
        .res-promo-price{font-family:var(--font-d);font-size:2rem;font-weight:400;margin-bottom:0.2rem}
        .res-promo-meta{font-size:0.76rem;color:var(--text2)}
        .res-promo-profit{font-size:0.84rem;font-weight:500;color:var(--green);margin-top:0.55rem}
        .res-promo-warn{font-size:0.84rem;font-weight:500;color:var(--red);margin-top:0.55rem}
        .frete-big{font-family:var(--font-d);font-size:2.8rem;font-weight:400}
        .frete-meta{font-size:0.78rem;color:var(--text2);margin-top:0.2rem}
        .frete-tip{margin-top:0.85rem;padding:0.75rem 1rem;background:var(--bg3);border-radius:10px;font-size:0.76rem;color:var(--text2);border:1px solid var(--border);line-height:1.55}
        .eq-big{font-family:var(--font-d);font-size:3.5rem;font-weight:400;line-height:1}
        .eq-unit{font-size:0.78rem;color:var(--text2);margin-top:0.3rem;line-height:1.5}
        .eq-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-top:1rem}
        .eq-stat{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:0.85rem 1rem}
        .eq-val{font-family:var(--font-d);font-size:1.25rem;font-weight:400;color:var(--blue);margin-bottom:0.15rem}
        .eq-lbl{font-size:0.67rem;color:var(--text3);line-height:1.45}
        .info-box{background:var(--blue-dim);border:1px solid rgba(43,107,232,0.18);border-radius:var(--rs);padding:0.9rem 1rem;margin-bottom:1rem;display:flex;gap:0.65rem;align-items:flex-start}
        .info-box svg{width:16px;height:16px;stroke:var(--blue);fill:none;stroke-width:1.8;stroke-linecap:round;flex-shrink:0;margin-top:1px}
        .info-box p{font-size:0.76rem;color:var(--blue);line-height:1.6}
        .guide-item{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:1.35rem;margin-bottom:0.75rem;transition:border-color 0.2s,box-shadow 0.2s}
        .guide-item:hover{border-color:var(--border2);box-shadow:var(--shadow)}
        .guide-item-head{display:flex;align-items:center;gap:0.75rem;margin-bottom:0.85rem}
        .gi-icon{width:34px;height:34px;flex-shrink:0;border-radius:9px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center}
        .gi-icon svg{width:16px;height:16px;stroke:var(--text2);fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
        .guide-item h3{font-family:var(--font-s);font-size:1rem;font-weight:700;color:var(--text)}
        .guide-item p,.guide-item li{font-size:0.82rem;color:var(--text2);line-height:1.65}
        .guide-item ul{margin-left:1.1rem;margin-top:0.4rem}
        .guide-formula{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:0.6rem 1rem;font-size:0.79rem;font-weight:600;text-align:center;color:var(--text);margin:0.7rem 0;letter-spacing:0.01em}
        .guide-example{font-size:0.74rem;color:var(--text3);font-style:italic;border-top:1px solid var(--border);padding-top:0.6rem;margin-top:0.6rem}
        .guide-tip{background:linear-gradient(135deg,#FDF3FB,#F4F2EF);border:1.5px solid rgba(201,32,158,0.15);border-radius:16px;padding:1.5rem;text-align:center;margin-top:0.5rem}
        .guide-tip h3{font-family:var(--font-d);font-size:1.1rem;color:var(--pink);margin-bottom:0.5rem}
        .guide-tip p{font-size:0.82rem;color:var(--text2);line-height:1.7}
        .toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(60px);background:var(--text);color:#fff;padding:0.7rem 1.4rem;border-radius:99px;font-size:0.8rem;font-weight:600;z-index:999;transition:transform 0.35s var(--ease);white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,0.2)}
        .toast.show{transform:translateX(-50%) translateY(0)}
        footer{opacity:0.75;text-align:center;padding:2.5rem 1rem 2rem;border-top:1px solid var(--border)}
        .footer-name{font-family:var(--font-d);font-size:1.15rem;color:var(--text);margin-bottom:0.5rem}
        .footer-contacts{display:flex;flex-direction:column;align-items:center;gap:0.25rem}
        .footer-link{display:inline-flex;align-items:center;gap:0.4rem;font-size:0.8rem;color:var(--text2);text-decoration:none;transition:color 0.2s}
        .footer-link:hover{color:var(--pink)}
        .footer-link svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round}
        .footer-copy{font-size:0.68rem;color:var(--text3);margin-top:1rem}
        .topbar{background:var(--bg2);border-bottom:1px solid var(--border);padding:0.85rem 1.5rem;display:flex;align-items:center;justify-content:space-between}
        .topbar-brand{font-family:var(--font-d);font-size:1.3rem}
        .topbar-brand span{color:var(--pink)}
        .topbar-right{display:flex;align-items:center;gap:1rem}
        .topbar-user{font-size:0.78rem;color:var(--text2)}
        .btn-logout{font-size:0.78rem;font-weight:600;color:var(--text3);background:transparent;border:1.5px solid var(--border);border-radius:8px;padding:0.4rem 0.85rem;cursor:pointer;transition:all 0.2s;font-family:var(--font-s)}
        .btn-logout:hover{border-color:var(--border2);color:var(--text)}
        @media(min-width:600px){.wrapper{padding:0 1.5rem 5rem}.hero{padding:3.5rem 0 2.5rem}.card{padding:2rem}}
      `}</style>

      <div className="topbar">
        <div className="topbar-brand">Precifique<span>.</span></div>
        <div className="topbar-right">
          <span className="topbar-user">{user?.nome}</span>
          <button className="btn-logout" onClick={logout}>Sair</button>
        </div>
      </div>

      <div className="wrapper">
        <header className="hero">
          <div className="hero-wordmark">Precifique<span className="dot">.</span></div>
          <p className="hero-sub">Calcule preços, margens e ponto de equilíbrio com precisão</p>
        </header>

        {/* TABS */}
        <nav className="tabs-nav">
          {([
            { id: 'precificacao', label: 'Precificar', icon: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></> },
            { id: 'frete', label: 'Frete Unit.', icon: <><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></> },
            { id: 'equilibrio', label: 'Equilíbrio', icon: <><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l9-7 9 7"/><path d="M5 12H1l2 5h4l2-5H5z"/><path d="M19 12h-4l2 5h4l2-5h-4z"/></> },
            { id: 'guia', label: 'Guia', icon: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(t => (
            <button key={t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <svg viewBox="0 0 24 24">{t.icon}</svg>
              {t.label}
            </button>
          ))}
        </nav>

        {/* PRECIFICAÇÃO */}
        <div className={`tab-panel${tab === 'precificacao' ? ' active' : ''}`}>
          <div className="card">
            <div className="card-head">
              <div className="card-icon"><svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></div>
              <div className="card-head-text"><h2>Calcular Preço</h2><p>Preencha os custos para encontrar o preço ideal</p></div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Custo do produto</label>
                <div className="input-wrap"><span className="pfx">R$</span>
                  <input type="number" className="has-pfx" placeholder="0,00" step="0.01" min="0" value={cost} onChange={e => setCost(e.target.value)} />
                </div>
                <div className="field-hint">Valor pago ao fornecedor por unidade</div>
              </div>
              <div className="field">
                <label>Frete unitário</label>
                <div className="input-wrap"><span className="pfx">R$</span>
                  <input type="number" className="has-pfx" placeholder="0,00" step="0.01" min="0" value={freightUnit} onChange={e => setFreightUnit(e.target.value)} />
                </div>
                <div className="field-hint">Use a aba Frete para calcular</div>
              </div>
            </div>

            <hr className="sep" />
            <div className="sep-label">Outras despesas por unidade</div>
            <div className="row-list">
              {despesas.map(r => (
                <div key={r.id} className="drow">
                  <input type="text" placeholder="Ex: Embalagem" value={r.label} onChange={e => updateRow(setDespesas, r.id, 'label', e.target.value)} />
                  <div className="input-wrap" style={{minWidth:100}}><span className="pfx">R$</span>
                    <input type="number" className="has-pfx" placeholder="0,00" step="0.01" min="0" value={r.value} onChange={e => updateRow(setDespesas, r.id, 'value', e.target.value)} />
                  </div>
                  <button className="row-remove" onClick={() => removeRow(setDespesas, r.id, despesas)} title="Remover">
                    <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>
                  </button>
                </div>
              ))}
            </div>
            <button className="btn-add-row" onClick={() => addRow(setDespesas)}>
              <svg viewBox="0 0 14 14"><line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/></svg>
              Adicionar despesa
            </button>

            <hr className="sep" />
            <div className="sep-label">Taxas de plataforma / pagamento</div>
            <div className="row-list">
              {taxas.map(r => (
                <div key={r.id} className="trow">
                  <input type="text" placeholder="Ex: Taxa do app" value={r.label} onChange={e => updateRow(setTaxas, r.id, 'label', e.target.value)} />
                  <div className="input-wrap" style={{minWidth:90}}>
                    <input type="number" className="has-sfx" placeholder="0" step="0.1" min="0" max="99" value={r.value} onChange={e => updateRow(setTaxas, r.id, 'value', e.target.value)} />
                    <span className="sfx sfx-sm">%</span>
                  </div>
                  <button className="row-remove" onClick={() => removeRow(setTaxas, r.id, taxas)} title="Remover">
                    <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>
                  </button>
                </div>
              ))}
            </div>
            <button className="btn-add-row" onClick={() => addRow(setTaxas)}>
              <svg viewBox="0 0 14 14"><line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/></svg>
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

            <button className="btn btn-primary" onClick={calcular}>
              <svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              Calcular Preço Ideal
            </button>

            {calcResult && (
              <>
                <div className="result res-pink">
                  <div className="res-label c-pink">Preço ideal de venda</div>
                  <div className="res-price c-pink">{fmt(calcResult.price)}</div>
                  <div className="res-meta">
                    Custo base: {fmt(calcResult.base)}
                    {calcResult.taxaPct > 0 && `  ·  Taxas (${calcResult.taxaPct.toFixed(1)}%): ${fmt(calcResult.taxaAmt)}`}
                  </div>
                  <div className="res-profit">Lucro líquido por unidade: <strong>{fmt(calcResult.profit)}</strong></div>
                  <div className="mbar">
                    <div className="mbar-top">
                      <span className="mbar-lbl">Saúde da margem</span>
                      <span className={`mbadge ${margemBadgeClass[calcResult.margemLevel]}`}>{calcResult.margemLabel}</span>
                    </div>
                    <div className="mbar-track">
                      <div className="mbar-fill" style={{width:`${calcResult.margemPct}%`,background:margemColors[calcResult.margemLevel]}} />
                    </div>
                    <div className="mbar-desc">{calcResult.margemDesc}</div>
                  </div>
                </div>

                <button className="btn btn-wpp" onClick={sendWhatsApp}>
                  <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Enviar resultado pelo WhatsApp
                </button>

                <div className={`promo-trigger`} onClick={() => setPromoOpen(o => !o)}>
                  <span>Simular desconto ou promoção</span>
                  <span className={`promo-chev${promoOpen ? ' open' : ''}`}>▼</span>
                </div>
                {promoOpen && (
                  <div className="promo-inner">
                    <div className="field">
                      <label>Percentual de desconto</label>
                      <div className="input-wrap">
                        <input type="number" className="has-sfx" placeholder="Ex: 10" step="0.5" min="0" max="99" value={discount} onChange={e => setDiscount(e.target.value)} />
                        <span className="sfx">%</span>
                      </div>
                    </div>
                    {promoPrice !== null && promoProfit !== null && (
                      <div className="result res-gold">
                        <div className="res-label c-gold">Preço com desconto</div>
                        <div className="res-promo-price c-gold">{fmt(promoPrice)}</div>
                        <div className="res-promo-meta">{discount}% de desconto sobre {fmt(calcResult.price)}</div>
                        {promoProfit >= 0
                          ? <div className="res-promo-profit">Você ainda lucra <strong>{fmt(promoProfit)}</strong> por unidade</div>
                          : <div className="res-promo-warn">Atenção: prejuízo de <strong>{fmt(Math.abs(promoProfit))}</strong> por unidade</div>
                        }
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* FRETE */}
        <div className={`tab-panel${tab === 'frete' ? ' active' : ''}`}>
          <div className="card">
            <div className="card-head">
              <div className="card-icon green-icon"><svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>
              <div className="card-head-text"><h2>Frete Unitário</h2><p>Divida o custo do frete entre os produtos</p></div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Frete total pago</label>
                <div className="input-wrap"><span className="pfx">R$</span>
                  <input type="number" className="has-pfx" placeholder="0,00" step="0.01" min="0" value={freightTotal} onChange={e => setFreightTotal(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Qtd. de produtos</label>
                <input type="number" placeholder="Ex: 12" step="1" min="1" value={freightQty} onChange={e => setFreightQty(e.target.value)} />
                <div className="field-hint">Total de pares ou unidades</div>
              </div>
            </div>
            <button className="btn btn-green" onClick={calcularFrete}>Calcular Frete por Unidade</button>
            {freteResult && (
              <>
                <div className="result res-green">
                  <div className="res-label c-green">Custo do frete por unidade</div>
                  <div className="frete-big c-green">{fmt(freteResult.unit)}</div>
                  <div className="frete-meta">{fmt(freteResult.total)} ÷ {freteResult.qty} unidades</div>
                  <div className="frete-tip">Clique em <strong>&quot;Usar este valor&quot;</strong> para preencher automaticamente na aba Precificar.</div>
                </div>
                <button className="btn btn-ghost" onClick={() => usarFrete(freteResult.unit)}>
                  <svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                  Usar este valor na aba Precificar
                </button>
              </>
            )}
          </div>
        </div>

        {/* EQUILÍBRIO */}
        <div className={`tab-panel${tab === 'equilibrio' ? ' active' : ''}`}>
          <div className="card">
            <div className="card-head">
              <div className="card-icon blue-icon"><svg viewBox="0 0 24 24"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l9-7 9 7"/><path d="M5 12H1l2 5h4l2-5H5z"/><path d="M19 12h-4l2 5h4l2-5h-4z"/></svg></div>
              <div className="card-head-text"><h2>Ponto de Equilíbrio</h2><p>Quantas vendas para cobrir seus custos fixos?</p></div>
            </div>
            <div className="info-box">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p><strong>O que são custos fixos?</strong> São gastos que você tem todo mês independente de vender ou não — como aluguel, mensalidade de app, internet, celular, contador, embalagens fixas, etc.</p>
            </div>
            <div className="field">
              <label>Total de custos fixos mensais</label>
              <div className="input-wrap"><span className="pfx">R$</span>
                <input type="number" className="has-pfx" placeholder="Ex: 2.000,00" step="0.01" min="0" value={fixedCosts} onChange={e => setFixedCosts(e.target.value)} />
              </div>
              <div className="field-hint">Some todos os seus gastos fixos do mês</div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Preço de venda</label>
                <div className="input-wrap"><span className="pfx">R$</span>
                  <input type="number" className="has-pfx" placeholder="Ex: 59,90" step="0.01" min="0" value={eqSell} onChange={e => setEqSell(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Custo variável / un.</label>
                <div className="input-wrap"><span className="pfx">R$</span>
                  <input type="number" className="has-pfx" placeholder="Ex: 32,00" step="0.01" min="0" value={eqCost} onChange={e => setEqCost(e.target.value)} />
                </div>
                <div className="field-hint">Produto + frete + embalagem</div>
              </div>
            </div>
            <button className="btn btn-blue" onClick={calcularEq}>Calcular Ponto de Equilíbrio</button>
            {eqResult && (
              <div className="result res-blue">
                <div className="res-label c-blue">Você precisa vender</div>
                <div className="eq-big c-blue">{eqResult.be}</div>
                <div className="eq-unit">unidades por mês para cobrir {fmt(eqResult.fixed)} em custos fixos</div>
                <div className="eq-grid">
                  <div className="eq-stat"><div className="eq-val">{fmt(eqResult.contrib)}</div><div className="eq-lbl">Margem de contribuição por unidade</div></div>
                  <div className="eq-stat"><div className="eq-val">{fmt(eqResult.rev)}</div><div className="eq-lbl">Faturamento mínimo mensal</div></div>
                  <div className="eq-stat"><div className="eq-val">~{eqResult.daily}/dia</div><div className="eq-lbl">Média por dia útil (22 dias)</div></div>
                  <div className="eq-stat"><div className="eq-val">{fmt(eqResult.fixed)}</div><div className="eq-lbl">Custos fixos cobertos</div></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GUIA */}
        <div className={`tab-panel${tab === 'guia' ? ' active' : ''}`}>
          <div className="guide-item">
            <div className="guide-item-head"><div className="gi-icon"><svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></div><h3>Custo do Produto</h3></div>
            <p>Valor que você paga ao fornecedor por cada unidade individual.</p>
            <div className="guide-formula">Valor total da compra ÷ Quantidade de pares</div>
            <p className="guide-example"><strong>Exemplo:</strong> comprou 12 pares por R$ 240 → custo unitário = R$ 20,00</p>
          </div>
          <div className="guide-item">
            <div className="guide-item-head"><div className="gi-icon"><svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div><h3>Frete Unitário</h3></div>
            <p>Rateie o custo do frete entre todos os produtos da entrega. Use a aba Frete para calcular automaticamente.</p>
            <div className="guide-formula">Frete total ÷ Quantidade de produtos</div>
            <p className="guide-example"><strong>Exemplo:</strong> R$ 60 de frete em 12 pares → R$ 5,00 por par</p>
          </div>
          <div className="guide-item">
            <div className="guide-item-head"><div className="gi-icon"><svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div><h3>Taxas de Plataforma</h3></div>
            <p>Plataformas e meios de pagamento cobram uma porcentagem sobre cada venda. Sempre inclua no cálculo!</p>
            <ul><li>Shopee: aproximadamente 20%</li><li>Mercado Livre: de 12% a 17%</li><li>Cartão de crédito: de 3% a 5%</li><li>Pix / dinheiro: geralmente 0%</li></ul>
          </div>
          <div className="guide-item">
            <div className="guide-item-head"><div className="gi-icon"><svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div><h3>Margem de Lucro</h3></div>
            <p>Quanto você quer ganhar sobre o custo total. Esta calculadora usa o método markup:</p>
            <div className="guide-formula">Preço = Custo Total × (1 + Margem% ÷ 100)</div>
            <ul><li>Abaixo de 20% — margem muito fraca</li><li>De 20% a 39% — razoável, pode melhorar</li><li>De 40% a 59% — boa margem</li><li>60% ou mais — margem excelente</li></ul>
          </div>
          <div className="guide-item">
            <div className="guide-item-head"><div className="gi-icon"><svg viewBox="0 0 24 24"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l9-7 9 7"/><path d="M5 12H1l2 5h4l2-5H5z"/><path d="M19 12h-4l2 5h4l2-5h-4z"/></svg></div><h3>Ponto de Equilíbrio</h3></div>
            <p>Quantas vendas você precisa fazer por mês para não ter prejuízo e cobrir todos os custos fixos.</p>
            <div className="guide-formula">Custos Fixos ÷ (Preço de Venda − Custo Variável)</div>
            <p className="guide-example"><strong>Exemplo:</strong> R$ 2.000 fixos ÷ margem de R$ 28/par = 72 pares por mês para equilibrar.</p>
          </div>
          <div className="guide-tip">
            <h3>A regra de ouro</h3>
            <p>Anote <strong>todos</strong> os seus custos reais antes de precificar. Um centavo ignorado multiplica o prejuízo. Lucro certo vem de controle consistente — não de achismo.</p>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-name">Caroline Azevedo</div>
        <div className="footer-contacts">
          <a href="tel:+5562822370750" className="footer-link">
            <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .06h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.21-1.21a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
            (62) 8223-7075
          </a>
          <a href="https://instagram.com/caroline_azevedo15" target="_blank" rel="noreferrer" className="footer-link">
            <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            @caroline_azevedo15
          </a>
        </div>
        <div className="footer-copy">© 2026 Precifique — Todos os direitos reservados</div>
      </footer>

      <div className={`toast${toastVisible ? ' show' : ''}`}>{toast}</div>
    </>
  )
}
