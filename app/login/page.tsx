'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function Login() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('precifique_user')) {
      router.replace('/app')
    }
  }, [router])

  async function doLogin() {
    if (!username || !password) { setError('Preencha login e senha.'); return }
    setLoading(true); setError('')
    try {
      const hash = await hashPassword(password)
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/precifique_users?username=eq.${encodeURIComponent(username)}&password_hash=eq.${hash}&ativo=eq.true&select=id,nome,username,avatar_data`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      )
      const data = await res.json()
      if (data && data.length > 0) {
        // Atualiza ultimo_acesso
        fetch(`${SUPABASE_URL}/rest/v1/precifique_users?id=eq.${data[0].id}`, {
          method: 'PATCH',
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ultimo_acesso: new Date().toISOString() })
        })
        localStorage.setItem('precifique_user', JSON.stringify({ id: data[0].id, nome: data[0].nome, username: data[0].username, avatar_data: data[0].avatar_data ?? null }))
        router.replace('/app')
      } else {
        setError('Login ou senha incorretos.')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:1.5rem;background:var(--bg)}
        .login-card{width:100%;max-width:400px;background:var(--bg2);border:1px solid var(--border);border-radius:24px;padding:2.5rem 2rem;box-shadow:0 8px 40px rgba(0,0,0,0.08)}
        .login-brand{text-align:center;margin-bottom:2rem}
        .login-brand h1{font-family:var(--font-d);font-size:2rem;color:var(--text)}
        .login-brand h1 span{color:var(--pink)}
        .login-brand p{font-size:0.82rem;color:var(--text3);margin-top:0.3rem}
        .field{margin-bottom:1rem}
        .field label{display:block;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text3);margin-bottom:0.4rem}
        .field input{width:100%;padding:0.85rem 1rem;background:var(--bg3);border:1.5px solid var(--border);border-radius:12px;font-family:var(--font-s);font-size:0.95rem;color:var(--text);outline:none;transition:border-color 0.2s,box-shadow 0.2s}
        .field input:focus{border-color:rgba(201,32,158,0.35);box-shadow:0 0 0 3px rgba(201,32,158,0.06)}
        .field input::placeholder{color:var(--text3)}
        .btn-login{width:100%;padding:1rem;margin-top:0.5rem;background:var(--pink);color:#fff;border:none;border-radius:12px;font-family:var(--font-s);font-size:0.95rem;font-weight:700;cursor:pointer;transition:all 0.2s var(--ease);box-shadow:0 4px 16px rgba(201,32,158,0.25);display:flex;align-items:center;justify-content:center;gap:0.5rem}
        .btn-login:hover:not(:disabled){background:var(--pink2);transform:translateY(-1px);box-shadow:0 6px 22px rgba(201,32,158,0.35)}
        .btn-login:disabled{opacity:0.6;cursor:not-allowed}
        .error-box{background:var(--red-dim);border:1px solid rgba(217,53,53,0.2);border-radius:10px;padding:0.75rem 1rem;font-size:0.82rem;color:var(--red);margin-top:0.75rem;text-align:center;font-weight:500}
        .login-footer{text-align:center;margin-top:1.5rem}
        .login-footer a{font-size:0.78rem;color:var(--text3);text-decoration:none;transition:color 0.2s}
        .login-footer a:hover{color:var(--pink)}
        .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite}
      `}</style>

      <div className="login-card">
        <div className="login-brand">
          <h1>Precifique<span>.</span></h1>
          <p>Entre com seu login e senha</p>
        </div>

        <div className="field">
          <label>Login</label>
          <input
            type="text"
            placeholder="Seu usuário"
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doLogin()}
          />
        </div>

        <div className="field">
          <label>Senha</label>
          <input
            type="password"
            placeholder="Sua senha"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doLogin()}
          />
        </div>

        <button className="btn-login" onClick={doLogin} disabled={loading}>
          {loading ? <span className="spinner" /> : 'Entrar'}
        </button>

        {error && <div className="error-box">{error}</div>}

        <div className="login-footer">
          <Link href="/">Ainda não tenho acesso</Link>
        </div>
      </div>
    </>
  )
}
