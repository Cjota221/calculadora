'use client'
import { useState } from 'react'
import type { DynamicRow, CalcResult, MargemLevel } from '@/types'
import { ga } from '@/lib/gtag'

export function useCalculadora() {
  const [cost, setCost] = useState('')
  const [freightUnit, setFreightUnit] = useState('')
  const [margin, setMargin] = useState('')
  const [despesas, setDespesas] = useState<DynamicRow[]>([{ id: 1, label: '', value: '' }])
  const [taxas, setTaxas] = useState<DynamicRow[]>([{ id: 1, label: '', value: '' }])
  const [result, setResult] = useState<CalcResult | null>(null)
  const [discount, setDiscount] = useState('')
  const [promoOpen, setPromoOpen] = useState(false)
  const [nomeProduto, setNomeProduto] = useState('')
  const [dataVenda, setDataVenda] = useState('')
  const [salvando, setSalvando] = useState(false)

  let nextId = Date.now()

  function addRow(setter: React.Dispatch<React.SetStateAction<DynamicRow[]>>) {
    setter(prev => [...prev, { id: nextId++, label: '', value: '' }])
  }

  function removeRow(
    setter: React.Dispatch<React.SetStateAction<DynamicRow[]>>,
    id: number,
    rows: DynamicRow[]
  ) {
    if (rows.length <= 1) {
      setter(prev => prev.map(r => r.id === id ? { ...r, label: '', value: '' } : r))
      return
    }
    setter(prev => prev.filter(r => r.id !== id))
  }

  function updateRow(
    setter: React.Dispatch<React.SetStateAction<DynamicRow[]>>,
    id: number,
    field: 'label' | 'value',
    val: string
  ) {
    setter(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))
  }

  function getMargemInfo(m: number): { level: MargemLevel; label: string; desc: string; pct: number } {
    if (m < 20) return { level: 'fraca', label: 'Margem fraca', desc: 'Risco de prejuízo com qualquer imprevisto. Revise seus custos.', pct: Math.min(m / 20 * 25, 25) }
    if (m < 40) return { level: 'ok', label: 'Razoável', desc: 'Margem apertada. Tente aumentar o preço ou reduzir custos.', pct: 25 + (m - 20) / 20 * 25 }
    if (m < 60) return { level: 'boa', label: 'Boa margem', desc: 'Você está no caminho certo. Margem sustentável.', pct: 50 + (m - 40) / 20 * 25 }
    return { level: 'otima', label: 'Excelente', desc: 'Margem muito saudável. Negócio bem posicionado.', pct: Math.min(75 + (m - 60) / 40 * 25, 100) }
  }

  function calcular(onToast: (msg: string) => void): void {
    const c = parseFloat(cost) || 0
    const f = parseFloat(freightUnit) || 0
    const m = parseFloat(margin) || 0
    if (c <= 0) { onToast('Informe o custo do produto'); return }
    if (m <= 0) { onToast('Informe a margem de lucro'); return }
    const isMarkup = m > 70
    const margemReal = isMarkup ? (m / 100) / (1 + m / 100) : m / 100
    const totalDesp = despesas.reduce((acc, r) => acc + (parseFloat(r.value) || 0), 0)
    const totalTaxaPct = taxas.reduce((acc, r) => acc + (parseFloat(r.value) || 0), 0)
    const base = c + f + totalDesp
    let price = base / (1 - margemReal)
    if (totalTaxaPct > 0) price = price / (1 - totalTaxaPct / 100)
    const taxaAmt = price * totalTaxaPct / 100
    const profit = price - base - taxaAmt
    const margemRealPct = margemReal * 100
    const mi = getMargemInfo(margemRealPct)
    setResult({ price, base, taxaAmt, profit, margin: margemRealPct, taxaPct: totalTaxaPct, margemLevel: mi.level, margemLabel: mi.label, margemDesc: mi.desc, margemPct: mi.pct, markupDigitado: isMarkup ? m : undefined })
    setDiscount('')
    setPromoOpen(false)
  }

  async function salvarCalculo(userId: string, onToast: (msg: string) => void): Promise<void> {
    if (!result || !userId) return
    setSalvando(true)
    try {
      const res = await fetch('/api/calculos/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: userId,
          nome: nomeProduto || null,
          custo: parseFloat(cost) || 0,
          frete: parseFloat(freightUnit) || 0,
          despesas,
          taxas,
          margem: result.margin,
          preco_venda: result.price,
          lucro: result.profit,
          data_venda: dataVenda || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('[salvar-calculo] erro:', data)
        throw new Error(data.detail || data.error || 'Erro ao salvar')
      }
      ga.salvarCalculo()
      onToast('Cálculo salvo com sucesso!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('[salvar-calculo]', err)
      onToast(`Erro: ${msg}`)
    } finally {
      setSalvando(false)
    }
  }

  const promoPrice = result && parseFloat(discount) > 0
    ? result.price * (1 - parseFloat(discount) / 100)
    : null
  const promoProfit = promoPrice !== null && result ? promoPrice - result.base : null

  return {
    cost, setCost,
    freightUnit, setFreightUnit,
    margin, setMargin,
    despesas, setDespesas,
    taxas, setTaxas,
    result,
    discount, setDiscount,
    promoOpen, setPromoOpen,
    nomeProduto, setNomeProduto,
    dataVenda, setDataVenda,
    salvando,
    promoPrice, promoProfit,
    addRow, removeRow, updateRow,
    calcular, salvarCalculo,
  }
}
