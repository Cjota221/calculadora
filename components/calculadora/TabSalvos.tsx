'use client'
import { useEffect, useState } from 'react'
import { fmt } from '@/lib/formatCurrency'

interface CalcSalvo {
  id: string
  nome: string | null
  custo: number
  margem: number
  preco_venda: number
  lucro: number
  data_venda: string | null
  created_at: string
}

interface TabSalvosProps {
  userId: string
}

export function TabSalvos({ userId }: TabSalvosProps) {
  const [items, setItems] = useState<CalcSalvo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/calculos/listar?usuario_id=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setItems(data)
        else setError(data.error || 'Erro ao carregar')
      })
      .catch(() => setError('Erro de conexão'))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <div className="salvos-empty">Carregando...</div>
  if (error) return <div className="salvos-empty salvos-error">{error}</div>

  if (items.length === 0) return (
    <div className="salvos-empty">
      <svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      <p>Nenhum cálculo salvo ainda.</p>
      <span>Calcule um preço e clique em "Salvar cálculo".</span>
    </div>
  )

  return (
    <div className="salvos-list">
      {items.map(item => (
        <div key={item.id} className="salvo-card">
          <div className="salvo-nome">{item.nome || 'Sem nome'}</div>
          <div className="salvo-preco">{fmt(item.preco_venda)}</div>
          <div className="salvo-meta">
            <span>Custo <strong>{fmt(item.custo)}</strong></span>
            <span>Margem <strong>{item.margem.toFixed(1)}%</strong></span>
            <span>Lucro <strong className="c-green">{fmt(item.lucro)}</strong></span>
          </div>
          <div className="salvo-data">
            {item.data_venda
              ? `Venda: ${new Date(item.data_venda + 'T12:00:00').toLocaleDateString('pt-BR')}`
              : new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
      ))}
    </div>
  )
}
