export function CtaBottom() {
  return (
    <section className="lp-cta">
      <div className="cta-inner">
        <div className="cta-eyebrow">Oferta exclusiva</div>
        <h2>Pronta para lucrar<br /><em>de verdade?</em></h2>
        <p>Pare de perder dinheiro por preço errado.<br />Uma única vez e é seu para sempre.</p>

        <div className="cta-offer-box">
          <style>{`
            .cta-offer-box {
              background: rgba(255,255,255,0.07);
              border: 1.5px solid rgba(255,255,255,0.18);
              border-radius: 24px;
              padding: 2rem 1.75rem;
              margin: 0 auto 2rem;
              max-width: 400px;
            }
            .cta-price-big {
              display: flex;
              align-items: flex-start;
              justify-content: center;
              gap: 0.15rem;
              line-height: 1;
              margin-bottom: 0.5rem;
            }
            .cta-price-cur {
              font-family: var(--font-d);
              font-size: 1.5rem;
              font-weight: 700;
              color: rgba(255,255,255,0.8);
              padding-top: 0.6rem;
            }
            .cta-price-int {
              font-family: var(--font-d);
              font-size: 4.5rem;
              font-weight: 900;
              color: #fff;
              line-height: 1;
              letter-spacing: -0.03em;
            }
            .cta-price-dec {
              font-family: var(--font-d);
              font-size: 1.5rem;
              font-weight: 700;
              color: rgba(255,255,255,0.8);
              padding-top: 0.6rem;
            }
            .cta-price-tag {
              font-size: 0.78rem;
              color: rgba(255,255,255,0.55);
            }
            @media (max-width: 380px) {
              .cta-price-int { font-size: 3.8rem; }
            }
          `}</style>
          <div className="cta-price-big">
            <span className="cta-price-cur">R$</span>
            <span className="cta-price-int">37</span>
            <span className="cta-price-dec">,90</span>
          </div>
          <div className="cta-price-tag">✓ Acesso vitalício · Paga uma vez</div>
        </div>

        <div className="cta-cta-wrap">
          <a href="/comprar" className="btn-buy-white">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            Garantir acesso por R$ 37,90
          </a>
          <p className="cta-guarantee">✓ Acesso liberado automaticamente após o pagamento</p>
        </div>
      </div>
    </section>
  )
}
