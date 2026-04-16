'use client'
import { useState, useEffect } from 'react'

function getSecondsUntilMidnight() {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(23, 59, 59, 0)
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000))
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function OfertaBanner() {
  const [secs, setSecs] = useState(getSecondsUntilMidnight())
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Aparece após 2s para não poluir o carregamento inicial
    const show = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(show)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [])

  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60

  if (!visible) return null

  return (
    <>
      <style>{`
        .oferta-float {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 150;
          background: linear-gradient(90deg, #1a0050, #4c1d95, #7C3AED);
          border-top: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 -4px 32px rgba(124,58,237,0.5);
          padding: 0.85rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          animation: slideUp 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .oferta-left {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }
        .oferta-label {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.6);
        }
        .oferta-prices {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        .oferta-de {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.45);
          text-decoration: line-through;
          font-weight: 500;
        }
        .oferta-por {
          font-family: var(--font-d);
          font-size: 1.45rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }
        .oferta-timer {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          padding: 0.45rem 0.75rem;
          flex-shrink: 0;
        }
        .t-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 28px;
        }
        .t-num {
          font-family: var(--font-d);
          font-size: 1.15rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }
        .t-lbl {
          font-size: 0.45rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(255,255,255,0.5);
          margin-top: 1px;
        }
        .t-sep {
          font-size: 1rem;
          font-weight: 700;
          color: rgba(255,255,255,0.35);
          margin: 0 1px;
          padding-bottom: 4px;
        }
        .oferta-cta {
          background: #fff;
          color: #7C3AED;
          font-family: var(--font-s);
          font-size: 0.82rem;
          font-weight: 800;
          padding: 0.65rem 1.1rem;
          border-radius: 10px;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          transition: opacity 0.15s, transform 0.15s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.25);
        }
        .oferta-cta:hover { opacity: 0.92; transform: translateY(-1px); }
        @media (max-width: 500px) {
          .oferta-float {
            padding: 0.7rem 1rem;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .oferta-left { flex: 1; }
          .oferta-timer { padding: 0.35rem 0.55rem; }
          .t-num { font-size: 1rem; }
          .oferta-cta { font-size: 0.78rem; padding: 0.55rem 0.9rem; }
        }
        @media (max-width: 360px) {
          .oferta-timer { display: none; }
          .oferta-float { justify-content: space-between; }
        }
      `}</style>

      <div className="oferta-float">
        <div className="oferta-left">
          <span className="oferta-label">🔥 Oferta termina hoje</span>
          <div className="oferta-prices">
            <span className="oferta-de">R$ 34,99</span>
            <span className="oferta-por">R$ 24,99</span>
          </div>
        </div>

        <div className="oferta-timer">
          <div className="t-block">
            <span className="t-num">{pad(h)}</span>
            <span className="t-lbl">h</span>
          </div>
          <span className="t-sep">:</span>
          <div className="t-block">
            <span className="t-num">{pad(m)}</span>
            <span className="t-lbl">m</span>
          </div>
          <span className="t-sep">:</span>
          <div className="t-block">
            <span className="t-num">{pad(s)}</span>
            <span className="t-lbl">s</span>
          </div>
        </div>

        <a href="/comprar" className="oferta-cta">Garantir →</a>
      </div>
    </>
  )
}
