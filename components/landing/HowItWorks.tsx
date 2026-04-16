const steps = [
  {
    num: 1,
    emoji: '📝',
    title: 'Preencha seus dados',
    desc: 'Nome, email e crie sua senha. Leva menos de 1 minuto.',
  },
  {
    num: 2,
    emoji: '💳',
    title: 'Pague com segurança',
    desc: 'Pix ou cartão de crédito via Mercado Pago. Rápido e 100% seguro.',
  },
  {
    num: 3,
    emoji: '✅',
    title: 'Acesso liberado na hora',
    desc: 'Confirmado o pagamento, seu acesso é ativado automaticamente. Sem espera.',
  },
  {
    num: 4,
    emoji: '🚀',
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
                <h4>{s.emoji} {s.title}</h4>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
