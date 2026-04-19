'use client'
import { useState, useEffect } from 'react'

export function OfertaBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(show)
  }, [])

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
        .oferta-por {
          font-family: var(--font-d);
          font-size: 1.45rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
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
          .oferta-float { padding: 0.7rem 1rem; }
          .oferta-cta { font-size: 0.78rem; padding: 0.55rem 0.9rem; }
        }
      `}</style>

      <div className="oferta-float">
        <div className="oferta-left">
          <span className="oferta-label">Acesso vitalício · Paga uma vez</span>
          <span className="oferta-por">R$ 37,90</span>
        </div>
        <a href="/comprar" className="oferta-cta">Garantir →</a>
      </div>
    </>
  )
}
