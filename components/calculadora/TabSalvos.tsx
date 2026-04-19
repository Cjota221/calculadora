'use client'
import { useEffect, useState } from 'react'
import { fmt } from '@/lib/formatCurrency'

interface CalcSalvo {
  id: string
  nome: string | null
  custo: number
  frete: number
  margem: number
  preco_venda: number
  lucro: number
  data_venda: string | null
  created_at: string
}

interface TabSalvosProps {
  userId: string
}

interface EditState {
  id: string
  nome: string
  frete: number
  custo: string
  margem: string
  preco_venda: string
  lucro: string
  data_venda: string
}

function recalcular(custo: string, margem: string, frete: number) {
  const c = parseFloat(custo) || 0
  const m = parseFloat(margem) || 0
  const base = c + frete
  if (m <= 0 || m >= 100) return { preco_venda: '', lucro: '' }
  const preco = base / (1 - m / 100)
  const lucro = preco - base
  return {
    preco_venda: preco.toFixed(2),
    lucro: lucro.toFixed(2),
  }
}

export function TabSalvos({ userId }: TabSalvosProps) {
  const [items, setItems] = useState<CalcSalvo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<EditState | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  function openEdit(item: CalcSalvo) {
    setEditing({
      id: item.id,
      nome: item.nome || '',
      frete: item.frete || 0,
      custo: item.custo.toString(),
      margem: item.margem.toString(),
      preco_venda: item.preco_venda.toString(),
      lucro: item.lucro.toString(),
      data_venda: item.data_venda || '',
    })
  }

  function handleEditCusto(v: string) {
    setEditing(prev => {
      if (!prev) return prev
      const calc = recalcular(v, prev.margem, prev.frete)
      return { ...prev, custo: v, ...calc }
    })
  }

  function handleEditMargem(v: string) {
    setEditing(prev => {
      if (!prev) return prev
      const calc = recalcular(prev.custo, v, prev.frete)
      return { ...prev, margem: v, ...calc }
    })
  }

  async function confirmEdit() {
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch(`/api/calculos/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: userId,
          nome: editing.nome,
          custo: parseFloat(editing.custo) || 0,
          margem: parseFloat(editing.margem) || 0,
          preco_venda: parseFloat(editing.preco_venda) || 0,
          lucro: parseFloat(editing.lucro) || 0,
          data_venda: editing.data_venda || null,
        }),
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      setItems(prev => prev.map(it =>
        it.id === editing.id
          ? {
              ...it,
              nome: editing.nome || null,
              custo: parseFloat(editing.custo) || 0,
              margem: parseFloat(editing.margem) || 0,
              preco_venda: parseFloat(editing.preco_venda) || 0,
              lucro: parseFloat(editing.lucro) || 0,
              data_venda: editing.data_venda || null,
            }
          : it
      ))
      setEditing(null)
    } catch {
      alert('Erro ao atualizar o cálculo. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/calculos/${id}?usuario_id=${userId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao apagar')
      setItems(prev => prev.filter(it => it.id !== id))
    } catch {
      alert('Erro ao apagar o cálculo. Tente novamente.')
    } finally {
      setDeletingId(null)
    }
  }

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
    <>
      <div className="salvos-list">
        {items.map(item => (
          <div key={item.id} className="salvo-card">
            <div className="salvo-card-header">
              <div className="salvo-nome">{item.nome || 'Sem nome'}</div>
              <div className="salvo-actions">
                <button
                  className="salvo-btn salvo-btn-edit"
                  onClick={() => openEdit(item)}
                  title="Editar"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar
                </button>
                <button
                  className="salvo-btn salvo-btn-delete"
                  onClick={() => {
                    if (window.confirm(`Apagar "${item.nome || 'este cálculo'}"?`)) {
                      confirmDelete(item.id)
                    }
                  }}
                  disabled={deletingId === item.id}
                  title="Apagar"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  {deletingId === item.id ? 'Apagando...' : 'Apagar'}
                </button>
              </div>
            </div>
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

      {editing && (
        <div className="salvo-modal-overlay" onClick={() => setEditing(null)}>
          <div className="salvo-modal" onClick={e => e.stopPropagation()}>
            <div className="salvo-modal-header">
              <span>Editar cálculo</span>
              <button className="salvo-modal-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="salvo-modal-body">
              <label>
                Nome do produto
                <input
                  type="text"
                  value={editing.nome}
                  onChange={e => setEditing(prev => prev && { ...prev, nome: e.target.value })}
                  placeholder="Ex: Camiseta básica"
                />
              </label>
              <div className="salvo-modal-row">
                <label>
                  Custo (R$)
                  <input
                    type="number"
                    value={editing.custo}
                    onChange={e => handleEditCusto(e.target.value)}
                    min="0" step="0.01"
                  />
                </label>
                <label>
                  Margem (%)
                  <input
                    type="number"
                    value={editing.margem}
                    onChange={e => handleEditMargem(e.target.value)}
                    min="0" step="0.1"
                  />
                </label>
              </div>
              <div className="salvo-modal-row">
                <label>
                  Preço de venda (R$)
                  <input
                    type="number"
                    value={editing.preco_venda}
                    onChange={e => setEditing(prev => prev && { ...prev, preco_venda: e.target.value })}
                    min="0" step="0.01"
                  />
                </label>
                <label>
                  Lucro (R$)
                  <input
                    type="number"
                    value={editing.lucro}
                    onChange={e => setEditing(prev => prev && { ...prev, lucro: e.target.value })}
                    step="0.01"
                  />
                </label>
              </div>
              <label>
                Data da venda
                <input
                  type="date"
                  value={editing.data_venda}
                  onChange={e => setEditing(prev => prev && { ...prev, data_venda: e.target.value })}
                />
              </label>
            </div>
            <div className="salvo-modal-footer">
              <button className="salvo-modal-cancel" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="salvo-modal-save" onClick={confirmEdit} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
