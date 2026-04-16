const steps = [
  {
    num: 1,
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: 'Preencha seus dados',
    desc: 'Nome, email e crie sua senha. Leva menos de 1 minuto.',
  },
  {
    num: 2,
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    title: 'Pague com segurança',
    desc: 'Pix ou cartão de crédito via Mercado Pago. Rápido e 100% seguro.',
  },
  {
    num: 3,
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: 'Acesso liberado na hora',
    desc: 'Confirmado o pagamento, seu acesso é ativado automaticamente. Sem espera.',
  },
  {
    num: 4,
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    title: 'Use para sempre',
    desc: 'Acesso vitalício. Paga uma vez e nunca mais paga nada.',
  },
]

export function HowItWorks() {
  return (
    <section className="lp-how">
      <div className="how-inner">
        <div className="section-label">Como funciona</div>
        <h2 className="section-title" style={{ textAlign: 'center' }}>Em 4 passos simples</h2>
        <div className="steps">
          {steps.map(s => (
            <div key={s.num} className="step">
              <div className="step-left">
                <div className="step-num">{s.num}</div>
              </div>
              <div className="step-content">
                <div className="step-icon">{s.icon}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
