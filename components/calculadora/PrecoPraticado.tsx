'use client'
import { useState, useEffect } from 'react'
import type { CalcResult } from '@/types'

interface Props {
  result: CalcResult
}

type Estado = 'prejuizo' | 'abaixo' | 'limite' | 'otimo'

function calcularComparacao(precoPraticado: number, result: CalcResult) {
  const taxaReal = precoPraticado * (result.taxaPct / 100)
  const lucroReal = precoPraticado - result.base - taxaReal
  const diferenca = precoPraticado - result.price

  let estado: Estado
  if (lucroReal < 0) {
    estado = 'prejuizo'
  } else if (diferenca < -5) {
    estado = 'abaixo'
  } else if (diferenca <= 5) {
    estado = 'limite'
  } else {
    estado = 'otimo'
  }

  return { lucroReal, diferenca, estado }
}

const ICONS: Record<Estado, string> = {
  prejuizo: '🔴',
  abaixo: '⚠️',
  limite: '🟡',
  otimo: '✅',
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function PrecoPraticado({ result }: Props) {
  const [valor, setValor] = useState('')

  useEffect(() => { setValor('') }, [result])

  const praticado = parseFloat(valor)
  const comparacao = praticado > 0 ? calcularComparacao(praticado, result) : null

  function getMensagens(c: ReturnType<typeof calcularComparacao>) {
    const difFmt = fmt(Math.abs(c.diferenca))
    const lucroFmt = fmt(c.lucroReal)
    const idealFmt = fmt(result.price)
    switch (c.estado) {
      case 'prejuizo':
        return {
          linha1: 'Atenção! Você está vendendo no prejuízo.',
          linha2: `Seu preço está R$ ${fmt(Math.abs(c.lucroReal))} abaixo do mínimo para cobrir os custos.`,
        }
      case 'abaixo':
        return {
          linha1: `Você está R$ ${difFmt} abaixo do preço ideal.`,
          linha2: `Seu lucro real é R$ ${lucroFmt}/un. Considere aumentar o preço.`,
        }
      case 'limite':
        return {
          linha1: `Você está próxima do preço ideal (R$ ${idealFmt}).`,
          linha2: `Seu lucro real é R$ ${lucroFmt}/un.`,
        }
      case 'otimo':
        return {
          linha1: `Ótimo! Você vende R$ ${difFmt} acima do preço ideal.`,
          linha2: `Seu lucro real é R$ ${lucroFmt}/un. 🎉`,
        }
    }
  }

  return (
    <div className="pp-wrapper">
      <div className="pp-label">
        <span>✏️ Qual preço você pratica?</span>
        <span className="pp-hint">Digite o preço que você cobra de verdade</span>
      </div>
      <div className="pp-input-row">
        <span className="pp-prefix">R$</span>
        <input
          type="number"
          className="pp-input"
          placeholder="0,00"
          step="0.01"
          min="0"
          value={valor}
          onChange={e => setValor(e.target.value)}
        />
      </div>

      {comparacao && (() => {
        const msgs = getMensagens(comparacao)
        return (
          <div className={`pp-comparacao pp-${comparacao.estado}`}>
            <span className="pp-icon">{ICONS[comparacao.estado]}</span>
            <div className="pp-texto">
              <p className="pp-linha1">{msgs.linha1}</p>
              <p className="pp-linha2">{msgs.linha2}</p>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
