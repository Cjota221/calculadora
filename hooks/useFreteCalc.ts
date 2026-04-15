'use client'
import { useState } from 'react'
import type { FreteResult } from '@/types'

export function useFreteCalc() {
  const [freightTotal, setFreightTotal] = useState('')
  const [freightQty, setFreightQty] = useState('')
  const [result, setResult] = useState<FreteResult | null>(null)

  function calcular(onToast: (msg: string) => void): void {
    const total = parseFloat(freightTotal) || 0
    const qty = parseFloat(freightQty) || 0
    if (total <= 0) { onToast('Informe o valor do frete'); return }
    if (qty < 1) { onToast('Informe a quantidade de produtos'); return }
    setResult({ unit: total / qty, total, qty })
  }

  return { freightTotal, setFreightTotal, freightQty, setFreightQty, result, calcular }
}
