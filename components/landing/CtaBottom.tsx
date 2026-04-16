'use client'
import { useState, useEffect } from 'react'

function pad(n: number) { return String(n).padStart(2, '0') }
function getSecondsUntilMidnight() {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(23, 59, 59, 0)
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000))
}

export function CtaBottom() {
  const [secs, setSecs] = useState(getSecondsUntilMidnight())
  useEffect(() => {
    const id = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [])
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60

  return (
    <section className="lp-cta">
      <style>{`
        .cta-offer-box {
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: 24px;
          padding: 2rem 1.75rem;
          margin: 0 auto 2rem;
          max-width: 400px;
        }
        .cta-urgency {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(239,68,68,0.2);
          border: 1px solid rgba(239,68,68,0.4);
          color: #FCA5A5;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0.3rem 0.85rem;
          border-radius: 99px;
          margin-bottom: 1.25rem;
        }
        .cta-price-de {
          font-size: 1rem;
          color: rgba(255,255,255,0.4);
          text-decoration: line-through;
          font-weight: 500;
          margin-bottom: 0.25rem;
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
          margin-bottom: 1.5rem;
        }
        .cta-countdown {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0;
        }
        .cta-t-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 0.55rem 0.85rem;
          min-width: 56px;
        }
        .cta-t-num {
          font-family: var(--font-d);
          font-size: 1.6rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }
        .cta-t-lbl {
          font-size: 0.55rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.45);
          margin-top: 3px;
        }
        .cta-t-sep {
          font-family: var(--font-d);
          font-size: 1.6rem;
          font-weight: 800;
          color: rgba(255,255,255,0.25);
          margin-bottom: 12px;
        }
        @media (max-width: 380px) {
          .cta-t-block { min-width: 48px; padding: 0.5rem 0.65rem; }
          .cta-t-num { font-size: 1.35rem; }
          .cta-price-int { font-size: 3.8rem; }
        }
      `}</style>

      <div className="cta-inner">
        <div className="cta-eyebrow">Oferta exclusiva</div>
        <h2>Pronta para lucrar<br /><em>de verdade?</em></h2>
        <p>Pare de perder dinheiro por preço errado.<br />Uma única vez e é seu para sempre.</p>

        <div className="cta-offer-box">
          <div className="cta-urgency">
            <span>⏰</span> Oferta termina hoje
          </div>
          <div className="cta-price-de">De R$ 34,99</div>
          <div className="cta-price-big">
            <span className="cta-price-cur">R$</span>
            <span className="cta-price-int">24</span>
            <span className="cta-price-dec">,99</span>
          </div>
          <div className="cta-price-tag">✓ Acesso vitalício · Paga uma vez</div>

          <div className="cta-countdown">
            <div className="cta-t-block">
              <span className="cta-t-num">{pad(h)}</span>
              <span className="cta-t-lbl">horas</span>
            </div>
            <span className="cta-t-sep">:</span>
            <div className="cta-t-block">
              <span className="cta-t-num">{pad(m)}</span>
              <span className="cta-t-lbl">min</span>
            </div>
            <span className="cta-t-sep">:</span>
            <div className="cta-t-block">
              <span className="cta-t-num">{pad(s)}</span>
              <span className="cta-t-lbl">seg</span>
            </div>
          </div>
        </div>

        <div className="cta-cta-wrap">
          <a href="/comprar" className="btn-buy-white">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            Garantir oferta por R$ 24,99
          </a>
          <p className="cta-guarantee">✓ Acesso liberado automaticamente após o pagamento</p>
        </div>
      </div>
    </section>
  )
}
