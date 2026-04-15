const steps = [
  { num: 1, title: 'Faça o pagamento', desc: 'Clique no botão de compra e pague R$ 24,99 pelo Mercado Pago. Rápido e seguro.' },
  { num: 2, title: 'Me chame no WhatsApp', desc: 'Clique no botão verde e envie o comprovante. Respondo em poucos minutos.' },
  { num: 3, title: 'Receba seu login e senha', desc: 'Crio seu acesso na hora e você já pode usar a calculadora imediatamente.' },
  { num: 4, title: 'Use para sempre', desc: 'Acesso vitalício. Paga uma vez e nunca mais paga nada.' },
]

export function HowItWorks() {
  return (
    <section className="how">
      <div className="how-inner">
        <div className="section-label">Como funciona</div>
        <h2 className="section-title">Simples assim</h2>
        <div className="steps">
          {steps.map(s => (
            <div key={s.num} className="step">
              <div className="step-num">{s.num}</div>
              <div className="step-text">
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
