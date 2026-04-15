'use client'
import { useState, useEffect, useCallback } from 'react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const ADMIN_PASSWORD = 'carol2025'

interface User {
  id: string
  nome: string
  username: string
  whatsapp: string
  ativo: boolean
  created_at: string
  ultimo_acesso: string | null
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function sbFetch(path: string, method = 'GET', body?: object) {
  const opts: RequestInit = {
    method,
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts)
  try { return await res.json() } catch { return null }
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pwd, setPwd] = useState('')
  const [pwdError, setPwdError] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newNome, setNewNome] = useState('')
  const [newWhats, setNewWhats] = useState('')
  const [newUser, setNewUser] = useState('')
  const [newPass, setNewPass] = useState('')

  function showToast(msg: string) {
    setToast(msg); setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2600)
  }

  const loadUsers = useCallback(async () => {
    const data = await sbFetch('precifique_users?select=*&order=created_at.desc')
    setUsers(data || [])
  }, [])

  useEffect(() => { if (authed) loadUsers() }, [authed, loadUsers])

  function adminLogin() {
    if (pwd === ADMIN_PASSWORD) { setAuthed(true) }
    else { setPwdError(true); setTimeout(() => setPwdError(false), 2000) }
  }

  async function criarAcesso() {
    if (!newNome || !newUser || !newPass) { showToast('Preencha nome, login e senha'); return }
    setCreating(true)
    try {
      const hash = await hashPassword(newPass)
      const res = await sbFetch('precifique_users', 'POST', { nome: newNome, whatsapp: newWhats, username: newUser.toLowerCase(), password_hash: hash, ativo: true })
      if (res && res[0] && res[0].id) {
        showToast(`Acesso criado para ${newNome}!`)
        setNewNome(''); setNewWhats(''); setNewUser(''); setNewPass('')
        loadUsers()
      } else if (res && res.code === '23505') {
        showToast('Esse login já existe. Escolha outro.')
      } else {
        showToast('Erro ao criar acesso. Tente novamente.')
      }
    } catch { showToast('Erro de conexão.') }
    setCreating(false)
  }

  async function toggleUser(id: string, ativo: boolean) {
    await sbFetch(`precifique_users?id=eq.${id}`, 'PATCH', { ativo })
    showToast(ativo ? 'Acesso ativado!' : 'Acesso bloqueado!')
    loadUsers()
  }

  const ativos = users.filter(u => u.ativo).length

  if (!authed) {
    return (
      <>
        <style>{`
          body{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:1.5rem;background:var(--bg)}
          .login-card{width:100%;max-width:380px;background:var(--bg2);border:1px solid var(--border);border-radius:24px;padding:2.5rem 2rem;box-shadow:0 8px 40px rgba(0,0,0,0.08)}
          .login-card h1{font-family:var(--font-d);font-size:1.6rem;margin-bottom:0.3rem}
          .login-card p{font-size:0.8rem;color:var(--text3);margin-bottom:1.75rem}
          .field{margin-bottom:1rem}
          .field label{display:block;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text3);margin-bottom:0.4rem}
          .field input{width:100%;padding:0.82rem 1rem;background:var(--bg3);border:1.5px solid var(--border);border-radius:11px;font-family:var(--font-s);font-size:0.93rem;color:var(--text);outline:none;transition:border-color 0.2s,box-shadow 0.2s}
          .field input:focus{border-color:rgba(201,32,158,0.35);box-shadow:0 0 0 3px rgba(201,32,158,0.06)}
          .field input::placeholder{color:var(--text3)}
          .error-box{background:var(--red-dim);border:1px solid rgba(217,53,53,0.2);border-radius:9px;padding:0.65rem 1rem;font-size:0.8rem;color:var(--red);margin-top:0.5rem;font-weight:500}
          .btn-primary{width:100%;padding:0.9rem 1.5rem;background:var(--pink);color:#fff;border:none;border-radius:11px;font-family:var(--font-s);font-size:0.9rem;font-weight:600;cursor:pointer;transition:all 0.2s var(--ease);box-shadow:0 4px 14px rgba(201,32,158,0.22)}
          .btn-primary:hover{background:var(--pink2);transform:translateY(-1px)}
        `}</style>
        <div className="login-card">
          <h1>Painel Admin</h1>
          <p>Precifique — Área restrita</p>
          <div className="field">
            <label>Senha de administrador</label>
            <input type="password" placeholder="Senha admin" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === 'Enter' && adminLogin()} />
          </div>
          <button className="btn-primary" onClick={adminLogin}>Entrar no painel</button>
          {pwdError && <div className="error-box">Senha incorreta.</div>}
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        body{background:var(--bg);min-height:100vh}
        .topbar{background:var(--bg2);border-bottom:1px solid var(--border);padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between}
        .topbar-brand{font-family:var(--font-d);font-size:1.3rem}
        .topbar-brand span{color:var(--pink)}
        .topbar-tag{font-size:0.75rem;color:var(--text3);font-family:var(--font-s);font-weight:400}
        .topbar-right{display:flex;align-items:center;gap:1rem}
        .topbar-user{font-size:0.78rem;color:var(--text2)}
        .btn-logout{font-size:0.78rem;font-weight:600;color:var(--text3);background:transparent;border:1.5px solid var(--border);border-radius:8px;padding:0.4rem 0.85rem;cursor:pointer;transition:all 0.2s;font-family:var(--font-s)}
        .btn-logout:hover{border-color:var(--border2);color:var(--text)}
        .main{max-width:860px;margin:0 auto;padding:2rem 1.5rem}
        .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem}
        .stat-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:1.25rem 1.5rem}
        .stat-val{font-family:var(--font-d);font-size:2rem;color:var(--text);line-height:1}
        .stat-lbl{font-size:0.72rem;color:var(--text3);margin-top:0.3rem;font-weight:500}
        .section-title{font-family:var(--font-d);font-size:1.4rem;margin-bottom:1.25rem}
        .create-card{background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:1.75rem;margin-bottom:2rem}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem}
        @media(max-width:500px){.form-grid{grid-template-columns:1fr}.stats{grid-template-columns:1fr 1fr}}
        .field{margin-bottom:0}
        .field label{display:block;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text3);margin-bottom:0.4rem}
        .field input{width:100%;padding:0.82rem 1rem;background:var(--bg3);border:1.5px solid var(--border);border-radius:11px;font-family:var(--font-s);font-size:0.93rem;color:var(--text);outline:none;transition:border-color 0.2s,box-shadow 0.2s}
        .field input:focus{border-color:rgba(201,32,158,0.35);box-shadow:0 0 0 3px rgba(201,32,158,0.06)}
        .field input::placeholder{color:var(--text3)}
        .btn{padding:0.82rem 1.5rem;border:none;border-radius:11px;font-family:var(--font-s);font-size:0.88rem;font-weight:600;cursor:pointer;transition:all 0.2s var(--ease);display:inline-flex;align-items:center;justify-content:center;gap:0.4rem}
        .btn-primary{background:var(--pink);color:#fff;box-shadow:0 4px 14px rgba(201,32,158,0.22)}
        .btn-primary:hover:not(:disabled){background:var(--pink2);transform:translateY(-1px)}
        .btn-primary:disabled{opacity:0.6;cursor:not-allowed}
        .btn-sm{padding:0.42rem 0.85rem;font-size:0.76rem;border-radius:8px}
        .btn-danger{background:var(--red-dim);color:var(--red);border:1px solid rgba(217,53,53,0.2)}
        .btn-danger:hover{background:rgba(217,53,53,0.14)}
        .btn-success{background:var(--green-dim);color:var(--green);border:1px solid rgba(26,158,92,0.2)}
        .btn-success:hover{background:rgba(26,158,92,0.14)}
        .btn-refresh{background:var(--bg3);border:1px solid var(--border);color:var(--text2)}
        .btn-refresh:hover{border-color:var(--border2)}
        .table-wrap{background:var(--bg2);border:1px solid var(--border);border-radius:20px;overflow:hidden}
        .table-head{padding:1.25rem 1.5rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
        .table-head h3{font-family:var(--font-d);font-size:1.1rem}
        table{width:100%;border-collapse:collapse}
        th{font-size:0.67rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text3);padding:0.75rem 1.5rem;text-align:left;border-bottom:1px solid var(--border);background:var(--bg3)}
        td{padding:0.9rem 1.5rem;font-size:0.83rem;border-bottom:1px solid var(--border);color:var(--text2)}
        tr:last-child td{border-bottom:none}
        tr:hover td{background:var(--bg3)}
        td strong{color:var(--text);font-weight:600}
        .badge{display:inline-block;font-size:0.68rem;font-weight:700;padding:2px 10px;border-radius:99px}
        .badge-on{background:var(--green-dim);color:var(--green)}
        .badge-off{background:var(--red-dim);color:var(--red)}
        .empty-state{text-align:center;padding:3rem 1rem;color:var(--text3);font-size:0.85rem}
        .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(60px);background:var(--text);color:#fff;padding:0.65rem 1.3rem;border-radius:99px;font-size:0.8rem;font-weight:600;z-index:999;transition:transform 0.3s var(--ease);white-space:nowrap;box-shadow:0 6px 20px rgba(0,0,0,0.18)}
        .toast.show{transform:translateX(-50%) translateY(0)}
      `}</style>

      <div className="topbar">
        <div className="topbar-brand">Precifique<span>.</span> <span className="topbar-tag">Admin</span></div>
        <div className="topbar-right">
          <span className="topbar-user">Carolina Azevedo</span>
          <button className="btn-logout" onClick={() => setAuthed(false)}>Sair</button>
        </div>
      </div>

      <div className="main">
        <div className="stats">
          <div className="stat-card"><div className="stat-val">{users.length}</div><div className="stat-lbl">Total de acessos</div></div>
          <div className="stat-card"><div className="stat-val" style={{color:'var(--green)'}}>{ativos}</div><div className="stat-lbl">Acessos ativos</div></div>
          <div className="stat-card"><div className="stat-val" style={{color:'var(--red)'}}>{users.length - ativos}</div><div className="stat-lbl">Bloqueados</div></div>
        </div>

        <h2 className="section-title">Criar novo acesso</h2>
        <div className="create-card">
          <div className="form-grid">
            <div className="field"><label>Nome da cliente</label><input type="text" placeholder="Ex: Maria Silva" value={newNome} onChange={e => setNewNome(e.target.value)} /></div>
            <div className="field"><label>WhatsApp</label><input type="text" placeholder="Ex: 62999999999" value={newWhats} onChange={e => setNewWhats(e.target.value)} /></div>
            <div className="field"><label>Login (usuário)</label><input type="text" placeholder="Ex: mariasilva" value={newUser} onChange={e => setNewUser(e.target.value)} /></div>
            <div className="field"><label>Senha</label><input type="text" placeholder="Crie uma senha" value={newPass} onChange={e => setNewPass(e.target.value)} /></div>
          </div>
          <button className="btn btn-primary" onClick={criarAcesso} disabled={creating}>
            {creating ? 'Criando...' : 'Criar acesso'}
          </button>
        </div>

        <h2 className="section-title">Clientes com acesso</h2>
        <div className="table-wrap">
          <div className="table-head">
            <h3>Todos os acessos</h3>
            <button className="btn btn-sm btn-refresh" onClick={loadUsers}>Atualizar</button>
          </div>
          {users.length === 0 ? (
            <div className="empty-state">Nenhum acesso criado ainda.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nome</th><th>Login</th><th>WhatsApp</th><th>Criado em</th><th>Último acesso</th><th>Status</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.nome}</strong></td>
                    <td>{u.username}</td>
                    <td>
                      {u.whatsapp
                        ? <a href={`https://wa.me/55${u.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{color:'var(--green)',textDecoration:'none'}}>{u.whatsapp}</a>
                        : '—'}
                    </td>
                    <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}</td>
                    <td>{u.ultimo_acesso ? new Date(u.ultimo_acesso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Nunca'}</td>
                    <td><span className={`badge ${u.ativo ? 'badge-on' : 'badge-off'}`}>{u.ativo ? 'Ativo' : 'Bloqueado'}</span></td>
                    <td>
                      {u.ativo
                        ? <button className="btn btn-sm btn-danger" onClick={() => toggleUser(u.id, false)}>Bloquear</button>
                        : <button className="btn btn-sm btn-success" onClick={() => toggleUser(u.id, true)}>Ativar</button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className={`toast${toastVisible ? ' show' : ''}`}>{toast}</div>
    </>
  )
}
