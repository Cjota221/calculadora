'use client'
import { useState } from 'react'
import type { EqResult } from '@/types'

export function useEquilibrio() {
  const [fixedCosts, setFixedCosts] = useState('')
  const [eqSell, setEqSell] = useState('')
  const [eqCost, setEqCost] = useState('')
  const [result, setResult] = useState<EqResult | null>(null)

  function calcular(onToast: (msg: string) => void): void {
    const fixed = parseFloat(fixedCosts) || 0
    const sell = parseFloat(eqSell) || 0
    const variable = parseFloat(eqCost) || 0
    if (fixed <= 0) { onToast('Informe os custos fixos'); return }
    if (sell <= 0) { onToast('Informe o preço de venda'); return }
    if (variable <= 0) { onToast('Informe o custo variável'); return }
    if (variable >= sell) { onToast('Custo variável não pode ser maior que o preço de venda'); return }
    const contrib = sell - variable
    const be = Math.ceil(fixed / contrib)
    setResult({ be, contrib, rev: be * sell, daily: Math.ceil(be / 22), fixed })
  }

  return { fixedCosts, setFixedCosts, eqSell, setEqSell, eqCost, setEqCost, result, calcular }
}
