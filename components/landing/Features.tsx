const features = [
  {
    icon: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
    title: 'Preço ideal na hora',
    desc: 'Informe custo, despesas e margem. O app calcula o preço exato — sem chute, sem erro.',
  },
  {
    icon: <><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
    title: 'Frete rateado por peça',
    desc: 'Divida o frete entre os produtos e saiba o custo real de cada unidade.',
  },
  {
    icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>,
    title: 'Taxas de plataforma',
    desc: 'Adicione taxas do app, cartão e marketplace. Veja o impacto real no seu lucro antes de vender.',
  },
  {
    icon: <><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l9-7 9 7"/><path d="M9 22V12h6v10"/></>,
    title: 'Ponto de equilíbrio',
    desc: 'Descubra quantas peças precisa vender por mês para cobrir todos os seus custos fixos.',
  },
  {
    icon: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
    title: 'Indicador de margem',
    desc: 'Saiba se a margem está fraca, razoável ou ótima antes de publicar o preço.',
  },
  {
    icon: <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>,
    title: 'Salvar cálculos',
    desc: 'Guarde os cálculos dos seus produtos com nome e data de venda para consultar depois.',
  },
]

export function Features() {
  return (
    <section className="lp-features">
      <div className="section-label">O que está incluído</div>
      <h2 className="section-title">Tudo que você precisa para<br />precificar com confiança</h2>
      <p className="section-sub">6 ferramentas em um só lugar. Feito para revendedoras que querem lucrar de verdade.</p>
      <div className="features-grid">
        {features.map(f => (
          <div key={f.title} className="feat-card">
            <div className="feat-icon">
              <svg viewBox="0 0 24 24">{f.icon}</svg>
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
