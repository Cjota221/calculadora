'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Suspense } from 'react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const welcome = params.get('welcome') === 'true'

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Se veio do checkout (welcome=true), limpa sessão anterior e força novo login
    if (welcome) {
      localStorage.removeItem('precifique_user')
      supabase.auth.signOut()
      return
    }
    if (localStorage.getItem('precifique_user')) router.replace('/app')
  }, [router, welcome])

  async function doLogin() {
    if (!login || !password) { setError('Preencha login e senha.'); return }
    setLoading(true); setError('')

    try {
      // Tentativa 1: Supabase Auth (novos usuários — login por email)
      if (login.includes('@')) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: login.trim(),
          password,
        })

        if (!authError && authData.user) {
          // Buscar dados na tabela usuarios_precifique
          const { data: userData } = await supabase
            .from('usuarios_precifique')
            .select('id, nome, email, status')
            .eq('auth_user_id', authData.user.id)
            .single()

          if (userData?.status === 'ativo') {
            localStorage.setItem('precifique_user', JSON.stringify({
              id: userData.id,
              nome: userData.nome,
              username: userData.email,
              avatar_data: null,
            }))
            router.replace('/app')
            return
          } else if (userData?.status === 'pendente') {
            setError('Seu pagamento ainda não foi confirmado. Aguarde alguns minutos ou fale no WhatsApp.')
            setLoading(false)
            return
          }
        }
      }

      // Tentativa 2: Auth legado (username + SHA-256) — usuários antigos
      const hash = await hashPassword(password)
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/precifique_users?username=eq.${encodeURIComponent(login)}&password_hash=eq.${hash}&ativo=eq.true&select=id,nome,username,avatar_data`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      )
      const data = await res.json()

      if (data?.length > 0) {
        fetch(`${SUPABASE_URL}/rest/v1/precifique_users?id=eq.${data[0].id}`, {
          method: 'PATCH',
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ultimo_acesso: new Date().toISOString() }),
        })
        localStorage.setItem('precifique_user', JSON.stringify({
          id: data[0].id, nome: data[0].nome, username: data[0].username, avatar_data: data[0].avatar_data ?? null,
        }))
        router.replace('/app')
        return
      }

      setError('Login ou senha incorretos.')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:1.5rem;background:linear-gradient(135deg,#0D0428 0%,#2A0A70 60%,#7C3AED 100%)}
        .login-card{width:100%;max-width:400px;background:#fff;border-radius:var(--radius);padding:2.5rem 2rem;box-shadow:0 24px 80px rgba(0,0,0,0.35)}
        .login-brand{text-align:center;margin-bottom:2rem}
        .login-brand h1{font-family:var(--font-d);font-size:2rem;font-weight:800;color:var(--text)}
        .login-brand h1 span{color:var(--pink)}
        .login-brand p{font-size:var(--fs-sm);color:var(--text3);margin-top:0.3rem}
        .welcome-banner{background:var(--green-dim);border:1px solid rgba(26,158,92,0.2);border-radius:var(--radius-sm);padding:0.85rem 1rem;font-size:var(--fs-sm);color:var(--green);margin-bottom:1.25rem;font-weight:600;text-align:center}
        .field{margin-bottom:1rem}
        .field label{display:block;font-size:var(--fs-xs);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text3);margin-bottom:0.4rem}
        .field input{width:100%;padding:0.85rem 1rem;background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-s);font-size:1rem;color:var(--text);outline:none;transition:border-color 0.2s,box-shadow 0.2s}
        .field input:focus{border-color:rgba(124,58,237,0.4);box-shadow:0 0 0 3px rgba(124,58,237,0.07);background:#fff}
        .field input::placeholder{color:var(--text3);font-weight:400}
        .btn-login{width:100%;padding:1rem;margin-top:0.5rem;background:var(--pink);color:#fff;border:none;border-radius:var(--radius-sm);font-family:var(--font-s);font-size:1rem;font-weight:800;cursor:pointer;transition:all 0.2s var(--ease);box-shadow:0 4px 16px rgba(124,58,237,0.28);display:flex;align-items:center;justify-content:center;gap:0.5rem}
        .btn-login:hover:not(:disabled){background:var(--pink2);transform:translateY(-1px);box-shadow:0 6px 22px rgba(124,58,237,0.38)}
        .btn-login:disabled{opacity:0.6;cursor:not-allowed}
        .error-box{background:var(--red-dim);border:1px solid rgba(217,53,53,0.2);border-radius:10px;padding:0.75rem 1rem;font-size:var(--fs-sm);color:var(--red);margin-top:0.75rem;text-align:center;font-weight:500}
        .login-footer{text-align:center;margin-top:1.5rem;display:flex;flex-direction:column;gap:0.4rem}
        .login-footer a{font-size:var(--fs-xs);color:var(--text3);text-decoration:none;transition:color 0.2s}
        .login-footer a:hover{color:var(--pink)}
        .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite}
      `}</style>

      <div className="login-card">
        <div className="login-brand">
          <h1>Precifique<span>.</span></h1>
          <p>Entre com seu login e senha</p>
        </div>

        {welcome && (
          <div className="welcome-banner">🎉 Acesso ativado! Faça login para começar.</div>
        )}

        <div className="field">
          <label>Email ou usuário</label>
          <input
            type="text"
            placeholder="seu@email.com"
            autoComplete="username"
            value={login}
            onChange={e => setLogin(e.target.value)}
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
          <Link href="/comprar">Ainda não tenho acesso — R$ 24,99</Link>
          <Link href="/">← Voltar para a página inicial</Link>
        </div>
      </div>
    </>
  )
}

export default function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
