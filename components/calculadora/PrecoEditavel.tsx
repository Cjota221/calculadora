'use client'
import { useState, useEffect, useRef } from 'react'
import type { CalcResult } from '@/types'
import { fmt } from '@/lib/formatCurrency'

interface Props {
  result: CalcResult
}

export function PrecoEditavel({ result }: Props) {
  const [editando, setEditando] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [precoCustom, setPrecoCustom] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditando(false)
    setPrecoCustom(null)
  }, [result])

  useEffect(() => {
    if (editando) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editando])

  const precoAtual = precoCustom ?? result.price
  const taxaReal = precoAtual * (result.taxaPct / 100)
  const lucroReal = precoAtual - result.base - taxaReal
  const margemReal = precoAtual > 0 ? (lucroReal / precoAtual) * 100 : 0
  const editado = precoCustom !== null && precoCustom !== result.price

  function abrirEdicao() {
    setInputVal(precoAtual.toFixed(2))
    setEditando(true)
  }

  function confirmar() {
    const novo = parseFloat(inputVal)
    if (!novo || novo <= 0) return
    setPrecoCustom(novo)
    setEditando(false)
  }

  function cancelar() {
    setEditando(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') confirmar()
    if (e.key === 'Escape') cancelar()
  }

  return (
    <>
      <div className="pe-wrapper">
        {editando ? (
          <div className="pe-edit">
            <span className="pe-prefix">R$</span>
            <input
              ref={inputRef}
              type="number"
              className="pe-input"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKey}
              step="0.01"
              min="0"
            />
            <button className="pe-btn pe-confirm" onClick={confirmar} title="Confirmar">✓</button>
            <button className="pe-btn pe-cancel" onClick={cancelar} title="Cancelar">✕</button>
          </div>
        ) : (
          <div className="pe-view">
            <span className="res-price c-pink">{fmt(precoAtual)}</span>
            <button className="pe-lapis" onClick={abrirEdicao} title="Editar preço">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            {editado && <span className="pe-badge">preço editado</span>}
          </div>
        )}
      </div>

      <div className="res-profit">
        Lucro líquido por unidade:{' '}
        <strong className={lucroReal < 0 ? 'c-red' : ''}>{lucroReal < 0 ? '-' : ''}{fmt(Math.abs(lucroReal))}</strong>
        {editado && (
          <span className="pe-margem"> · Margem real: <strong>{margemReal.toFixed(1)}%</strong></span>
        )}
      </div>
    </>
  )
}
