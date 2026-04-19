'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Afiliado {
  id: string; nome: string; email: string; codigo_afiliado: string
  chave_pix: string; tipo_pix: string; total_vendas: number; total_ganho: number
}
interface Comissao {
  id: string; comprador_email: string | null; valor_comissao: number
  status: string; pago_em: string | null; created_at: string
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function PainelAfiliado() {
  const router = useRouter()
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null)
  const [comissoes, setComissoes] = useState<Comissao[]>([])
  const [loading, setLoading] = useState(true)
  const [copiado, setCopiado] = useState(false)

  const carregar = useCallback(async (id: string) => {
    const res = await fetch(`/api/afiliados/painel?id=${id}`)
    if (!res.ok) { localStorage.removeItem('afiliado_session'); router.replace('/afiliados/login'); return }
    const data = await res.json()
    setAfiliado(data.afiliado)
    setComissoes(data.comissoes)
    setLoading(false)
  }, [router])

  useEffect(() => {
    const raw = localStorage.getItem('afiliado_session')
    if (!raw) { router.replace('/afiliados/login'); return }
    try { const s = JSON.parse(raw); carregar(s.id) } catch { router.replace('/afiliados/login') }
  }, [router, carregar])

  function sair() {
    localStorage.removeItem('afiliado_session')
    router.replace('/afiliados/login')
  }

  function copiarLink() {
    const link = `https://calculadoraprecifique.com/?ref=${afiliado!.codigo_afiliado}`
    navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f3ff' }}>
      <div style={{ color: '#7c3aed', fontFamily: 'sans-serif' }}>Carregando...</div>
    </div>
  )

  const aReceber = comissoes.filter(c => c.status === 'pendente').reduce((a, c) => a + c.valor_comissao, 0)
  const jaRecebido = comissoes.filter(c => c.status === 'pago').reduce((a, c) => a + c.valor_comissao, 0)
  const link = `calculadoraprecifique.com/?ref=${afiliado!.codigo_afiliado}`

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#f5f3ff;font-family:var(--font-s,'Inter',sans-serif);color:#1e1b4b}
        .topbar{background:#fff;border-bottom:1px solid #e9e3ff;padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
        .tb-brand{font-family:var(--font-d,'Plus Jakarta Sans',sans-serif);font-size:1.25rem;font-weight:800;color:#1e1b4b}
        .tb-brand span{color:#7c3aed}
        .tb-right{display:flex;align-items:center;gap:0.75rem}
        .tb-nome{font-size:0.82rem;color:#6d28d9;font-weight:600}
        .btn-sair{font-size:0.75rem;font-weight:600;color:#6b7280;background:transparent;border:1.5px solid #e5e7eb;border-radius:8px;padding:0.35rem 0.85rem;cursor:pointer;transition:all 0.2s}
        .btn-sair:hover{border-color:#c4b5fd;color:#7c3aed}
        .main{max-width:680px;margin:0 auto;padding:1.75rem 1.25rem 4rem}
        .link-card{background:#fff;border:1.5px solid #c4b5fd;border-radius:16px;padding:1.5rem;margin-bottom:1.5rem}
        .link-label{font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7c3aed;margin-bottom:0.5rem}
        .link-url{font-family:monospace;font-size:0.88rem;color:#1e1b4b;background:#f5f3ff;border-radius:8px;padding:0.65rem 1rem;margin-bottom:0.75rem;word-break:break-all}
        .btn-copiar{background:#7c3aed;color:#fff;border:none;border-radius:8px;padding:0.65rem 1.4rem;font-size:0.85rem;font-weight:700;cursor:pointer;transition:all 0.2s;font-family:inherit}
        .btn-copiar:hover{background:#6d28d9}
        .btn-copiar.ok{background:#16a34a}
        .stats{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.5rem}
        .stat{background:#fff;border:1px solid #e9e3ff;border-radius:14px;padding:1.1rem 1.25rem}
        .stat-lbl{font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#7c3aed;margin-bottom:0.3rem}
        .stat-val{font-family:var(--font-d,'Plus Jakarta Sans',sans-serif);font-size:1.6rem;font-weight:800;color:#1e1b4b;line-height:1}
        .stat-val.green{color:#16a34a}
        .stat-val.orange{color:#d97706}
        .section-title{font-family:var(--font-d,'Plus Jakarta Sans',sans-serif);font-size:1.1rem;font-weight:700;color:#1e1b4b;margin-bottom:0.9rem}
        .table-wrap{background:#fff;border:1px solid #e9e3ff;border-radius:16px;overflow:hidden;margin-bottom:1.5rem}
        table{width:100%;border-collapse:collapse}
        th{font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#7c3aed;padding:0.75rem 1.25rem;text-align:left;border-bottom:1px solid #e9e3ff;background:#faf5ff}
        td{padding:0.85rem 1.25rem;font-size:0.82rem;border-bottom:1px solid #f3f0ff;color:#374151}
        tr:last-child td{border-bottom:none}
        .badge-pago{background:#dcfce7;color:#16a34a;font-size:0.68rem;font-weight:700;padding:2px 10px;border-radius:99px}
        .badge-pendente{background:#fef3c7;color:#d97706;font-size:0.68rem;font-weight:700;padding:2px 10px;border-radius:99px}
        .empty{text-align:center;padding:2.5rem;color:#9ca3af;font-size:0.85rem}
        .pix-card{background:#fff;border:1px solid #e9e3ff;border-radius:14px;padding:1.1rem 1.25rem}
        .pix-label{font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#7c3aed;margin-bottom:0.3rem}
        .pix-val{font-size:0.9rem;color:#1e1b4b;font-weight:600}
      `}</style>

      <div className="topbar">
        <div className="tb-brand">Precifique<span>.</span></div>
        <div className="tb-right">
          <span className="tb-nome">{afiliado!.nome.split(' ')[0]}</span>
          <button className="btn-sair" onClick={sair}>Sair</button>
        </div>
      </div>

      <div className="main">
        <div className="link-card">
          <div className="link-label">🔗 Seu link exclusivo</div>
          <div className="link-url">{link}</div>
          <button className={`btn-copiar${copiado ? ' ok' : ''}`} onClick={copiarLink}>
            {copiado ? '✓ Copiado!' : 'Copiar link'}
          </button>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="stat-lbl">Total de vendas</div>
            <div className="stat-val">{afiliado!.total_vendas}</div>
          </div>
          <div className="stat">
            <div className="stat-lbl">Total ganho</div>
            <div className="stat-val">{fmt(afiliado!.total_ganho)}</div>
          </div>
          <div className="stat">
            <div className="stat-lbl">A receber</div>
            <div className="stat-val orange">{fmt(aReceber)}</div>
          </div>
          <div className="stat">
            <div className="stat-lbl">Já recebido</div>
            <div className="stat-val green">{fmt(jaRecebido)}</div>
          </div>
        </div>

        <div className="section-title">Histórico de comissões</div>
        <div className="table-wrap">
          {comissoes.length === 0 ? (
            <div className="empty">Nenhuma comissão ainda. Comece a divulgar seu link! 🚀</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Comprador</th>
                  <th>Comissão</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {comissoes.map(c => (
                  <tr key={c.id}>
                    <td>{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                    <td>{c.comprador_email ? c.comprador_email.replace(/(.{3}).*(@)/, '$1***$2') : '—'}</td>
                    <td><strong>{fmt(c.valor_comissao)}</strong></td>
                    <td>
                      {c.status === 'pago'
                        ? <span className="badge-pago">✅ Pago</span>
                        : <span className="badge-pendente">⏳ Pendente</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="section-title">Seus dados PIX</div>
        <div className="pix-card">
          <div className="pix-label">Tipo: {afiliado!.tipo_pix.toUpperCase()}</div>
          <div className="pix-val">{afiliado!.chave_pix}</div>
        </div>
      </div>
    </>
  )
}
