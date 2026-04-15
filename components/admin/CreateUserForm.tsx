import { useState } from 'react'
import { hashPassword } from '@/lib/hashPassword'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface CreateUserFormProps {
  onCreated: (nome: string) => void
  onError: (msg: string) => void
}

export function CreateUserForm({ onCreated, onError }: CreateUserFormProps) {
  const [nome, setNome] = useState('')
  const [whats, setWhats] = useState('')
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)

  async function criar() {
    if (!nome || !user || !pass) { onError('Preencha nome, login e senha'); return }
    setLoading(true)
    try {
      const hash = await hashPassword(pass)
      const res = await fetch(`${SUPABASE_URL}/rest/v1/precifique_users`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ nome, whatsapp: whats, username: user.toLowerCase(), password_hash: hash, ativo: true }),
      })
      const data = await res.json()
      if (data && data[0] && data[0].id) {
        onCreated(nome)
        setNome(''); setWhats(''); setUser(''); setPass('')
      } else if (data && data.code === '23505') {
        onError('Esse login já existe. Escolha outro.')
      } else {
        onError('Erro ao criar acesso. Tente novamente.')
      }
    } catch {
      onError('Erro de conexão.')
    }
    setLoading(false)
  }

  return (
    <div className="create-card">
      <div className="form-grid">
        <div className="field"><label>Nome da cliente</label><input type="text" placeholder="Ex: Maria Silva" value={nome} onChange={e => setNome(e.target.value)} /></div>
        <div className="field"><label>WhatsApp</label><input type="text" placeholder="Ex: 62999999999" value={whats} onChange={e => setWhats(e.target.value)} /></div>
        <div className="field"><label>Login (usuário)</label><input type="text" placeholder="Ex: mariasilva" value={user} onChange={e => setUser(e.target.value)} /></div>
        <div className="field"><label>Senha</label><input type="text" placeholder="Crie uma senha" value={pass} onChange={e => setPass(e.target.value)} /></div>
      </div>
      <button className="btn btn-primary" onClick={criar} disabled={loading}>
        {loading ? 'Criando...' : 'Criar acesso'}
      </button>
    </div>
  )
}
