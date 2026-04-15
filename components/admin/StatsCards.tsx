interface StatsCardsProps {
  total: number
  ativos: number
  bloqueados: number
}

export function StatsCards({ total, ativos, bloqueados }: StatsCardsProps) {
  return (
    <div className="stats">
      <div className="stat-card">
        <div className="stat-val">{total}</div>
        <div className="stat-lbl">Total de acessos</div>
      </div>
      <div className="stat-card">
        <div className="stat-val" style={{ color: 'var(--green)' }}>{ativos}</div>
        <div className="stat-lbl">Acessos ativos</div>
      </div>
      <div className="stat-card">
        <div className="stat-val" style={{ color: 'var(--red)' }}>{bloqueados}</div>
        <div className="stat-lbl">Bloqueados</div>
      </div>
    </div>
  )
}
