'use client'
import { useState } from 'react'

interface Comprador {
  id: string
  nome: string
  email: string
  telefone: string | null
  nicho: string | null
  status: string
  created_at: string
  ativado_em: string | null
}

interface CompradoresTableProps {
  compradores: Comprador[]
  onRefresh: () => void
}

const NICHOS = ['Todos', 'Moda e Roupas', 'Confeitaria e Doces', 'Alimentação', 'Artesanato / Handmade', 'Beleza e Cosméticos', 'Papelaria e Personalizados', 'Serviços', 'Outro']

export function CompradoresTable({ compradores, onRefresh }: CompradoresTableProps) {
  const [filtroNicho, setFiltroNicho] = useState('Todos')
  const [filtroStatus, setFiltroStatus] = useState('Todos')

  const filtrados = compradores.filter(c => {
    const okNicho = filtroNicho === 'Todos' || c.nicho === filtroNicho
    const okStatus = filtroStatus === 'Todos' || c.status === filtroStatus
    return okNicho && okStatus
  })

  const ativos = compradores.filter(c => c.status === 'ativo').length
  const pendentes = compradores.filter(c => c.status === 'pendente').length

  return (
    <div className="table-wrap">
      <div className="table-head" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3>Compradores</h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '2px' }}>
            {ativos} ativos · {pendentes} aguardando pagamento · {compradores.length} total
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={filtroNicho}
            onChange={e => setFiltroNicho(e.target.value)}
            style={{ padding: '0.38rem 0.75rem', border: '1.5px solid var(--border)', borderRadius: '8px', background: 'var(--bg3)', fontFamily: 'var(--font-s)', fontSize: '0.78rem', color: 'var(--text2)', cursor: 'pointer', outline: 'none' }}
          >
            {NICHOS.map(n => <option key={n}>{n}</option>)}
          </select>
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            style={{ padding: '0.38rem 0.75rem', border: '1.5px solid var(--border)', borderRadius: '8px', background: 'var(--bg3)', fontFamily: 'var(--font-s)', fontSize: '0.78rem', color: 'var(--text2)', cursor: 'pointer', outline: 'none' }}
          >
            <option>Todos</option>
            <option value="ativo">Ativo</option>
            <option value="pendente">Pendente</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <button className="btn btn-sm btn-refresh" onClick={onRefresh}>Atualizar</button>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="empty-state">
          {compradores.length === 0 ? 'Nenhum comprador ainda.' : 'Nenhum resultado para esse filtro.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Nicho</th>
                <th>Cadastro</th>
                <th>Ativado em</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.nome}</strong></td>
                  <td style={{ fontSize: '0.78rem' }}>{c.email}</td>
                  <td>
                    {c.telefone
                      ? <a href={`https://wa.me/55${c.telefone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: 'var(--green)', textDecoration: 'none' }}>{c.telefone}</a>
                      : '—'}
                  </td>
                  <td>
                    {c.nicho
                      ? <span style={{ background: 'var(--pink-dim)', color: 'var(--pink)', fontSize: '0.7rem', fontWeight: 700, padding: '2px 9px', borderRadius: '99px' }}>{c.nicho}</span>
                      : <span style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>—</span>}
                  </td>
                  <td>{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                  <td>{c.ativado_em ? new Date(c.ativado_em).toLocaleDateString('pt-BR') : '—'}</td>
                  <td>
                    <span className={`badge ${c.status === 'ativo' ? 'badge-on' : c.status === 'cancelado' ? 'badge-off' : ''}`}
                      style={c.status === 'pendente' ? { background: 'var(--bg3)', color: 'var(--text3)', display: 'inline-block', fontSize: '0.68rem', fontWeight: 700, padding: '2px 10px', borderRadius: '99px' } : {}}>
                      {c.status === 'ativo' ? 'Ativo' : c.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
