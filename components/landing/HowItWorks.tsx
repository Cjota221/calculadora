const steps = [
  {
    num: '01',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: 'Preencha seus dados',
    desc: 'Nome, email e crie sua senha. Leva menos de 1 minuto.',
  },
  {
    num: '02',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    title: 'Pague com segurança',
    desc: 'Pix ou cartão via Mercado Pago. Rápido e 100% seguro.',
  },
  {
    num: '03',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: 'Acesso liberado na hora',
    desc: 'Pagamento confirmado, acesso ativado automaticamente.',
  },
  {
    num: '04',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    title: 'Use para sempre',
    desc: 'Acesso vitalício. Paga uma vez, usa para sempre.',
  },
]

export function HowItWorks() {
  return (
    <section className="lp-how">
      <div className="how-inner">
        <div className="section-label">Como funciona</div>
        <h2 className="section-title">Em 4 passos simples</h2>
        <div className="steps">
          {steps.map((s, i) => (
            <div key={s.num} className="step">
              <div className="step-top">
                <span className="step-num">{s.num}</span>
                <div className="step-icon">{s.icon}</div>
              </div>
              <div className="step-body">
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
              {i < steps.length - 1 && <div className="step-arrow" aria-hidden>→</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
