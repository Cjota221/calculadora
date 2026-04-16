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

function wppRecuperacao(nome: string, telefone: string) {
  const num = '55' + telefone.replace(/\D/g, '')
  const msg = encodeURIComponent(
    `Olá ${nome.split(' ')[0]}! 👋 Vi que você iniciou o cadastro no Precifique mas o pagamento não foi confirmado ainda. Posso te ajudar a concluir? 😊`
  )
  return `https://wa.me/${num}?text=${msg}`
}

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
    <>
      {/* Card de pendentes com recuperação rápida */}
      {pendentes > 0 && filtroStatus === 'Todos' && (
        <div style={{ background: 'rgba(255,180,0,0.08)', border: '1.5px solid rgba(255,180,0,0.25)', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B', display: 'inline-block', flexShrink: 0 }} />
            <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{pendentes} pagamento{pendentes > 1 ? 's' : ''} pendente{pendentes > 1 ? 's' : ''}</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>— clique no WhatsApp para recuperar</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {compradores.filter(c => c.status === 'pendente').map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.7rem 1rem' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{c.nome}</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text3)', marginLeft: '0.5rem' }}>{c.email}</span>
                  {c.nicho && <span style={{ background: 'var(--pink-dim)', color: 'var(--pink)', fontSize: '0.65rem', fontWeight: 700, padding: '1px 7px', borderRadius: '99px', marginLeft: '0.5rem' }}>{c.nicho}</span>}
                  <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: '2px' }}>
                    Cadastrou em {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                {c.telefone ? (
                  <a
                    href={wppRecuperacao(c.nome, c.telefone)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#25D366', color: '#fff', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-s)', flexShrink: 0 }}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Recuperar
                  </a>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text3)', fontStyle: 'italic' }}>Sem WhatsApp</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabela completa */}
      <div className="table-wrap">
        <div className="table-head" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3>Todos os compradores</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '2px' }}>
              {ativos} ativos · {pendentes} pendentes · {compradores.length} total
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
                  <th>Ação</th>
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
                      <span
                        className={`badge ${c.status === 'ativo' ? 'badge-on' : c.status === 'cancelado' ? 'badge-off' : ''}`}
                        style={c.status === 'pendente' ? { background: '#FEF3C7', color: '#D97706', display: 'inline-block', fontSize: '0.68rem', fontWeight: 700, padding: '2px 10px', borderRadius: '99px' } : {}}
                      >
                        {c.status === 'ativo' ? 'Ativo' : c.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                      </span>
                    </td>
                    <td>
                      {c.status === 'pendente' && c.telefone ? (
                        <a
                          href={wppRecuperacao(c.nome, c.telefone)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-success"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Recuperar
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
