import { useState } from 'react'

interface AdminLoginProps {
  onSuccess: () => void
}

const ADMIN_PASSWORD = 'carol2025'

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState(false)

  function handleLogin() {
    if (pwd === ADMIN_PASSWORD) {
      onSuccess()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1.5rem', background: 'var(--bg)' }}>
      <div className="login-card" style={{ maxWidth: 380 }}>
        <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '1.6rem', marginBottom: '0.3rem' }}>Painel Admin</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: '1.75rem' }}>Precifique — Área restrita</p>
        <div className="field">
          <label>Senha de administrador</label>
          <input
            type="password"
            placeholder="Senha admin"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '0.82rem 1rem', background: 'var(--bg3)', border: '1.5px solid var(--border)', borderRadius: '11px', fontFamily: 'var(--font-s)', fontSize: '0.93rem', color: 'var(--text)', outline: 'none' }}
          />
        </div>
        <button
          onClick={handleLogin}
          style={{ width: '100%', padding: '0.9rem 1.5rem', background: 'var(--pink)', color: '#fff', border: 'none', borderRadius: '11px', fontFamily: 'var(--font-s)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Entrar no painel
        </button>
        {error && (
          <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(217,53,53,0.2)', borderRadius: '9px', padding: '0.65rem 1rem', fontSize: '0.8rem', color: 'var(--red)', marginTop: '0.5rem', fontWeight: 500 }}>
            Senha incorreta.
          </div>
        )}
      </div>
    </div>
  )
}
