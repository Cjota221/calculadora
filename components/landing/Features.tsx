const features = [
  {
    icon: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
    title: 'Calculadora de Preço Ideal',
    desc: 'Informe o custo, despesas e margem desejada. Receba o preço exato para lucrar sem achismo.',
  },
  {
    icon: <><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
    title: 'Calculadora de Frete',
    desc: 'Divida o frete entre os produtos e saiba exatamente quanto cada peça custa de verdade.',
  },
  {
    icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>,
    title: 'Taxas de Plataforma',
    desc: 'Adicione múltiplas taxas (app, cartão, marketplace) e veja o impacto real no seu lucro.',
  },
  {
    icon: <><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l9-7 9 7"/><path d="M5 12H1l2 5h4l2-5H5z"/><path d="M19 12h-4l2 5h4l2-5h-4z"/></>,
    title: 'Ponto de Equilíbrio',
    desc: 'Descubra quantas unidades precisa vender por mês para cobrir todos os seus custos fixos.',
  },
  {
    icon: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
    title: 'Indicador de Margem',
    desc: 'Saiba se sua margem está fraca, razoável, boa ou excelente antes de publicar o preço.',
  },
  {
    icon: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
    title: 'Envio pelo WhatsApp',
    desc: 'Compartilhe o resultado calculado direto pelo WhatsApp com um clique.',
  },
]

export function Features() {
  return (
    <section className="features">
      <div className="section-label">O que está incluído</div>
      <h2 className="section-title">Tudo que você precisa para<br />precificar com confiança</h2>
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
