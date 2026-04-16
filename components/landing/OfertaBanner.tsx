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

  useEffect(() => {
    const id = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [])

  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60

  return (
    <>
      <style>{`
        .oferta-banner{background:linear-gradient(90deg,#5B21B6,#7C3AED,#6D28D9);padding:0.65rem 1rem;display:flex;align-items:center;justify-content:center;gap:0.75rem;flex-wrap:wrap;position:sticky;top:0;z-index:100}
        .oferta-text{font-size:0.82rem;font-weight:600;color:#fff;text-align:center;line-height:1.4}
        .oferta-text s{opacity:0.65;font-weight:400}
        .oferta-timer{display:flex;align-items:center;gap:0.25rem;background:rgba(0,0,0,0.25);border-radius:8px;padding:0.3rem 0.65rem}
        .timer-block{display:flex;flex-direction:column;align-items:center}
        .timer-num{font-family:var(--font-d);font-size:1.05rem;font-weight:700;color:#fff;line-height:1}
        .timer-sep{font-size:1rem;font-weight:700;color:rgba(255,255,255,0.5);margin:0 1px;align-self:flex-start;margin-top:1px}
        .timer-lbl{font-size:0.48rem;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.55);margin-top:1px}
        .oferta-btn{background:#fff;color:#7C3AED;font-size:0.78rem;font-weight:700;padding:0.4rem 1rem;border-radius:99px;text-decoration:none;white-space:nowrap;transition:opacity 0.15s;font-family:var(--font-s)}
        .oferta-btn:hover{opacity:0.9}
        @media(max-width:480px){.oferta-text{font-size:0.76rem}.oferta-btn{display:none}}
      `}</style>
      <div className="oferta-banner">
        <span className="oferta-text">
          🔥 Oferta por tempo limitado — <s>R$ 34,99</s> por apenas <strong>R$ 24,99</strong>
        </span>
        <div className="oferta-timer">
          <div className="timer-block">
            <span className="timer-num">{pad(h)}</span>
            <span className="timer-lbl">hrs</span>
          </div>
          <span className="timer-sep">:</span>
          <div className="timer-block">
            <span className="timer-num">{pad(m)}</span>
            <span className="timer-lbl">min</span>
          </div>
          <span className="timer-sep">:</span>
          <div className="timer-block">
            <span className="timer-num">{pad(s)}</span>
            <span className="timer-lbl">seg</span>
          </div>
        </div>
        <a href="/comprar" className="oferta-btn">Garantir oferta →</a>
      </div>
    </>
  )
}
