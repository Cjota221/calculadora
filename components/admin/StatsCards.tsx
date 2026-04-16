function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface Stats {
  total: number
  ativos: number
  pendentes: number
  faturamento: number
  novosHoje: number
  novosSemana: number
  novosMes: number
  faturamentoMes: number
}

interface StatsCardsProps {
  stats: Stats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const { total, ativos, pendentes, faturamento, novosHoje, novosSemana, novosMes, faturamentoMes } = stats
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>

      {/* Faturamento */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="stat-card stat-highlight">
          <div className="stat-icon">💰</div>
          <div className="stat-val stat-green">{fmt(faturamento)}</div>
          <div className="stat-lbl">Faturamento total</div>
          <div className="stat-sub">{ativos} vendas × R$ 24,99</div>
        </div>
        <div className="stat-card stat-highlight">
          <div className="stat-icon">📅</div>
          <div className="stat-val stat-purple">{fmt(faturamentoMes)}</div>
          <div className="stat-lbl">Faturamento este mês</div>
          <div className="stat-sub">{Math.round(faturamentoMes / 24.99)} vendas no mês</div>
        </div>
      </div>

      {/* Base de usuárias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-val">{total}</div>
          <div className="stat-lbl">Total na base</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-val stat-green">{ativos}</div>
          <div className="stat-lbl">Ativas</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-val stat-yellow">{pendentes}</div>
          <div className="stat-lbl">Pendentes</div>
        </div>
      </div>

      {/* Novos cadastros */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="stat-card">
          <div className="stat-val">{novosHoje}</div>
          <div className="stat-lbl">Novos hoje</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{novosSemana}</div>
          <div className="stat-lbl">Novos esta semana</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{novosMes}</div>
          <div className="stat-lbl">Novos este mês</div>
        </div>
      </div>

    </div>
  )
}
