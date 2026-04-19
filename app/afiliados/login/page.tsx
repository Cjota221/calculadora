'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginAfiliado() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (localStorage.getItem('afiliado_session')) router.replace('/afiliados/painel')
  }, [router])

  async function entrar() {
    setErro('')
    if (!email || !senha) { setErro('Preencha email e senha.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/afiliados/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro ao entrar.'); return }
      localStorage.setItem('afiliado_session', JSON.stringify(data.afiliado))
      router.replace('/afiliados/painel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:1.5rem;background:linear-gradient(135deg,#0D0428 0%,#2A0A70 60%,#7C3AED 100%)}
        .af-card{width:100%;max-width:400px;background:#fff;border-radius:20px;padding:2.5rem 2rem;box-shadow:0 24px 80px rgba(0,0,0,0.35)}
        .af-brand{text-align:center;margin-bottom:0.5rem;font-family:var(--font-d);font-size:1.6rem;font-weight:800;color:var(--text)}
        .af-brand span{color:#7c3aed}
        .af-subtitle{text-align:center;font-size:0.82rem;color:var(--text3);margin-bottom:1.75rem}
        .af-title{font-family:var(--font-d);font-size:1.15rem;font-weight:700;color:var(--text);margin-bottom:1.25rem;text-align:center}
        .f{margin-bottom:0.9rem}
        .f label{display:block;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text3);margin-bottom:0.35rem}
        .f input{width:100%;padding:0.8rem 1rem;background:var(--bg3);border:1.5px solid var(--border);border-radius:10px;font-family:var(--font-s);font-size:0.93rem;color:var(--text);outline:none;transition:border-color 0.2s}
        .f input:focus{border-color:rgba(124,58,237,0.4);box-shadow:0 0 0 3px rgba(124,58,237,0.07)}
        .btn-af{width:100%;padding:1rem;margin-top:0.75rem;background:#7c3aed;color:#fff;border:none;border-radius:10px;font-family:var(--font-s);font-size:1rem;font-weight:800;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
        .btn-af:hover:not(:disabled){background:#6d28d9;transform:translateY(-1px)}
        .btn-af:disabled{opacity:0.6;cursor:not-allowed}
        .err{background:#fff0f0;border:1px solid rgba(217,53,53,0.2);border-radius:8px;padding:0.65rem 1rem;font-size:0.82rem;color:var(--red);margin-top:0.75rem;text-align:center}
        .af-footer{text-align:center;margin-top:1.25rem;font-size:0.75rem;color:var(--text3)}
        .af-footer a{color:#7c3aed;font-weight:600;text-decoration:none}
        .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
      <div className="af-card">
        <div className="af-brand">Precifique<span>.</span></div>
        <div className="af-subtitle">Programa de Afiliadas</div>
        <div className="af-title">Entrar no painel</div>
        <div className="f">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" onKeyDown={e => e.key === 'Enter' && entrar()} />
        </div>
        <div className="f">
          <label>Senha</label>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Sua senha" onKeyDown={e => e.key === 'Enter' && entrar()} />
        </div>
        <button className="btn-af" onClick={entrar} disabled={loading}>
          {loading ? <span className="spinner" /> : 'Entrar no painel'}
        </button>
        {erro && <div className="err">{erro}</div>}
        <div className="af-footer">
          Ainda não é afiliada? <a href="/afiliados/cadastro">Cadastre-se grátis →</a>
        </div>
      </div>
    </>
  )
}
