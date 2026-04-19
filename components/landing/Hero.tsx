export function Hero() {
  return (
    <section className="lp-hero">
      <div className="hero-inner">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Acesso vitalício · Paga uma vez
        </div>

        <h1 className="hero-h1">
          Pare de chutar<br />
          o preço e comece<br />
          <em>lucrar de verdade</em>
        </h1>

        <p className="hero-sub">
          A calculadora que mostra o preço certo, a margem real
          e quantas vendas você precisa fazer para o seu negócio crescer.
        </p>

        <div className="hero-price-wrap">
          <div className="hero-price-val">
            <span className="price-cur">R$</span>
            <span className="price-int">37</span>
            <span className="price-dec">,90</span>
          </div>
          <div className="hero-price-tag">Paga uma vez · Acesso para sempre</div>
        </div>

        <div className="hero-cta-wrap">
          <a href="/comprar" className="btn-buy">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            Garantir acesso por R$ 37,90
          </a>
          <p className="hero-note">✓ Acesso liberado automaticamente após o pagamento</p>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num">5</span>
            <span className="hero-stat-lbl">Ferramentas</span>
          </div>
          <div className="hero-stat-div" />
          <div className="hero-stat">
            <span className="hero-stat-num">R$37,90</span>
            <span className="hero-stat-lbl">Paga uma vez</span>
          </div>
          <div className="hero-stat-div" />
          <div className="hero-stat">
            <span className="hero-stat-num">∞</span>
            <span className="hero-stat-lbl">Cálculos</span>
          </div>
        </div>
      </div>
    </section>
  )
}
