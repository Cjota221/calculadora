interface Lead {
  id: string
  nome: string
  telefone: string
  origem: string
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatPhone(tel: string) {
  const d = tel.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return tel
}

interface Props {
  leads: Lead[]
  onRefresh: () => void
}

export function LeadsTable({ leads, onRefresh }: Props) {
  return (
    <div className="table-wrap">
      <div className="table-head">
        <h3>Leads do popup <span style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 400 }}>({leads.length})</span></h3>
        <button className="btn btn-sm btn-refresh" onClick={onRefresh}>↻ Atualizar</button>
      </div>
      {leads.length === 0 ? (
        <div className="empty-state">Nenhum lead ainda.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>WhatsApp</th>
              <th>Cadastro</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id}>
                <td><strong>{l.nome}</strong></td>
                <td>
                  <a
                    href={`https://wa.me/55${l.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    {formatPhone(l.telefone)}
                  </a>
                </td>
                <td style={{ color: 'var(--text3)' }}>{formatDate(l.created_at)}</td>
                <td>
                  <a
                    href={`https://wa.me/55${l.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${l.nome}! 👋 Vi que você se interessou pelo Precifique. Posso te ajudar?`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-success"
                  >
                    Chamar no WPP
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
