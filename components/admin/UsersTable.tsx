import type { PrecifiqueUser } from '@/types'

interface UsersTableProps {
  users: PrecifiqueUser[]
  onToggle: (id: string, ativo: boolean) => void
  onRefresh: () => void
}

export function UsersTable({ users, onToggle, onRefresh }: UsersTableProps) {
  return (
    <div className="table-wrap">
      <div className="table-head">
        <h3>Todos os acessos</h3>
        <button className="btn btn-sm btn-refresh" onClick={onRefresh}>Atualizar</button>
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
                    ? <a href={`https://wa.me/55${u.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: 'var(--green)', textDecoration: 'none' }}>{u.whatsapp}</a>
                    : '—'}
                </td>
                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}</td>
                <td>{u.ultimo_acesso ? new Date(u.ultimo_acesso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Nunca'}</td>
                <td><span className={`badge ${u.ativo ? 'badge-on' : 'badge-off'}`}>{u.ativo ? 'Ativo' : 'Bloqueado'}</span></td>
                <td>
                  {u.ativo
                    ? <button className="btn btn-sm btn-danger" onClick={() => onToggle(u.id, false)}>Bloquear</button>
                    : <button className="btn btn-sm btn-success" onClick={() => onToggle(u.id, true)}>Ativar</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
