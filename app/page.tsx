import Link from 'next/link'

const MP_LINK = process.env.NEXT_PUBLIC_MP_LINK || '#'

export default function Landing() {
  return (
    <>
      <style>{`
        nav{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 1.5rem;background:var(--bg2);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}
        .nav-brand{font-family:var(--font-d);font-size:1.4rem;color:var(--text)}
        .nav-brand span{color:var(--pink)}
        .nav-login{font-size:0.82rem;font-weight:600;color:var(--pink);text-decoration:none;padding:0.5rem 1.1rem;border:1.5px solid rgba(201,32,158,0.3);border-radius:99px;transition:all 0.2s}
        .nav-login:hover{background:var(--pink-dim)}
        .hero{text-align:center;padding:4rem 1.5rem 3rem;max-width:640px;margin:0 auto}
        .hero-badge{display:inline-flex;align-items:center;gap:0.45rem;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--pink);background:var(--pink-dim);border:1px solid rgba(201,32,158,0.2);padding:0.35rem 1rem;border-radius:99px;margin-bottom:1.5rem}
        .hero-badge::before{content:'';width:6px;height:6px;background:var(--pink);border-radius:50%;animation:pulse 2s ease infinite}
        .hero h1{font-family:var(--font-d);font-size:clamp(2.4rem,6vw,3.6rem);font-weight:400;line-height:1.1;margin-bottom:1.25rem}
        .hero h1 em{font-style:italic;color:var(--pink)}
        .hero-p{font-size:1rem;color:var(--text2);line-height:1.7;margin-bottom:2.5rem;font-weight:300}
        .price-block{display:inline-flex;flex-direction:column;align-items:center;background:var(--bg2);border:1.5px solid var(--border);border-radius:20px;padding:1.5rem 2.5rem;margin-bottom:2rem;box-shadow:var(--shadow)}
        .price-from{font-size:0.75rem;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.2rem}
        .price-val{font-family:var(--font-d);font-size:3rem;color:var(--text);line-height:1}
        .price-val sup{font-family:var(--font-s);font-size:1.2rem;font-weight:600;vertical-align:top;margin-top:0.4rem;display:inline-block}
        .price-val sub{font-family:var(--font-s);font-size:1.5rem;vertical-align:bottom}
        .price-type{font-size:0.78rem;color:var(--green);font-weight:600;margin-top:0.35rem;letter-spacing:0.02em}
        .btn-buy{display:inline-flex;align-items:center;justify-content:center;gap:0.6rem;width:100%;max-width:380px;padding:1.1rem 2rem;background:var(--pink);color:#fff;border:none;border-radius:14px;font-family:var(--font-s);font-size:1rem;font-weight:700;cursor:pointer;text-decoration:none;box-shadow:0 6px 24px rgba(201,32,158,0.3);transition:all 0.2s var(--ease);letter-spacing:0.01em}
        .btn-buy:hover{background:var(--pink2);transform:translateY(-2px);box-shadow:0 10px 30px rgba(201,32,158,0.4)}
        .btn-wpp{display:inline-flex;align-items:center;justify-content:center;gap:0.6rem;width:100%;max-width:380px;padding:0.9rem 2rem;margin-top:0.75rem;background:transparent;color:#1A9E5C;border:1.5px solid rgba(26,158,92,0.3);border-radius:14px;font-family:var(--font-s);font-size:0.9rem;font-weight:600;text-decoration:none;transition:all 0.2s}
        .btn-wpp:hover{background:rgba(26,158,92,0.06);border-color:rgba(26,158,92,0.5)}
        .hero-note{font-size:0.72rem;color:var(--text3);margin-top:1rem}
        .features{padding:3rem 1.5rem;max-width:680px;margin:0 auto}
        .section-label{font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--pink);text-align:center;margin-bottom:0.6rem}
        .section-title{font-family:var(--font-d);font-size:clamp(1.6rem,4vw,2.2rem);text-align:center;margin-bottom:2.5rem;line-height:1.2}
        .features-grid{display:grid;grid-template-columns:1fr;gap:1rem}
        @media(min-width:560px){.features-grid{grid-template-columns:1fr 1fr}}
        .feat-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:1.4rem;transition:border-color 0.2s,box-shadow 0.2s}
        .feat-card:hover{border-color:var(--border2);box-shadow:var(--shadow)}
        .feat-icon{width:38px;height:38px;border-radius:10px;background:var(--pink-dim);border:1px solid rgba(201,32,158,0.12);display:flex;align-items:center;justify-content:center;margin-bottom:0.85rem}
        .feat-icon svg{width:17px;height:17px;stroke:var(--pink);fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
        .feat-card h3{font-family:var(--font-d);font-size:1rem;font-weight:400;margin-bottom:0.4rem}
        .feat-card p{font-size:0.82rem;color:var(--text2);line-height:1.6}
        .how{padding:3rem 1.5rem;background:var(--bg2);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
        .how-inner{max-width:560px;margin:0 auto;text-align:center}
        .steps{display:flex;flex-direction:column;gap:1rem;margin-top:2rem;text-align:left}
        .step{display:flex;gap:1rem;align-items:flex-start}
        .step-num{width:32px;height:32px;flex-shrink:0;border-radius:99px;background:var(--pink);color:#fff;font-family:var(--font-d);font-size:0.9rem;display:flex;align-items:center;justify-content:center;margin-top:2px}
        .step-text h4{font-size:0.92rem;font-weight:600;margin-bottom:0.2rem}
        .step-text p{font-size:0.82rem;color:var(--text2);line-height:1.55}
        .cta-bottom{padding:3.5rem 1.5rem;text-align:center;max-width:480px;margin:0 auto}
        .cta-bottom h2{font-family:var(--font-d);font-size:clamp(1.6rem,4vw,2.2rem);margin-bottom:0.75rem}
        .cta-bottom-p{font-size:0.9rem;color:var(--text2);margin-bottom:2rem;line-height:1.6}
        footer{text-align:center;padding:2rem 1rem;border-top:1px solid var(--border)}
        .footer-name{font-family:var(--font-d);font-size:1.1rem;margin-bottom:0.5rem}
        .footer-links{display:flex;flex-direction:column;align-items:center;gap:0.25rem}
        .footer-link{display:inline-flex;align-items:center;gap:0.4rem;font-size:0.78rem;color:var(--text2);text-decoration:none;transition:color 0.2s}
        .footer-link:hover{color:var(--pink)}
        .footer-link svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round}
        .footer-copy{font-size:0.67rem;color:var(--text3);margin-top:1rem}
        .cta-wrap{display:flex;flex-direction:column;align-items:center}
      `}</style>

      <nav>
        <div className="nav-brand">Precifique<span>.</span></div>
        <Link href="/login" className="nav-login">Já tenho acesso</Link>
      </nav>

      <section className="hero">
        <div className="hero-badge">Acesso Vitalício</div>
        <h1>Pare de chutar<br />o preço dos seus<br /><em>produtos</em></h1>
        <p className="hero-p">A calculadora profissional que te mostra o preço certo, a margem real e quantas vendas você precisa fazer para lucrar de verdade.</p>

        <div className="price-block">
          <div className="price-from">Acesso único por apenas</div>
          <div className="price-val"><sup>R$</sup>24<sub>,99</sub></div>
          <div className="price-type">Paga uma vez · Acesso para sempre</div>
        </div>

        <div className="cta-wrap">
          <a href={MP_LINK} className="btn-buy">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            Quero meu acesso por R$ 24,99
          </a>
          <a href="https://wa.me/5562822370750?text=Ol%C3%A1%20Carolina%2C%20acabei%20de%20pagar%20o%20Precifique%20e%20quero%20meu%20acesso!" className="btn-wpp" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="#1A9E5C"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Já paguei — quero meu acesso
          </a>
        </div>
        <div className="hero-note">Após o pagamento, clique no botão verde acima e envie o comprovante</div>
      </section>

      <section className="features">
        <div className="section-label">O que está incluído</div>
        <h2 className="section-title">Tudo que você precisa para<br />precificar com confiança</h2>
        <div className="features-grid">
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></div>
            <h3>Calculadora de Preço Ideal</h3>
            <p>Informe o custo, despesas e margem desejada. Receba o preço exato para lucrar sem achismo.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>
            <h3>Calculadora de Frete</h3>
            <p>Divida o frete entre os produtos e saiba exatamente quanto cada peça custa de verdade.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
            <h3>Taxas de Plataforma</h3>
            <p>Adicione múltiplas taxas (app, cartão, marketplace) e veja o impacto real no seu lucro.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l9-7 9 7"/><path d="M5 12H1l2 5h4l2-5H5z"/><path d="M19 12h-4l2 5h4l2-5h-4z"/></svg></div>
            <h3>Ponto de Equilíbrio</h3>
            <p>Descubra quantas unidades precisa vender por mês para cobrir todos os seus custos fixos.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
            <h3>Indicador de Margem</h3>
            <p>Saiba se sua margem está fraca, razoável, boa ou excelente antes de publicar o preço.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
            <h3>Envio pelo WhatsApp</h3>
            <p>Compartilhe o resultado calculado direto pelo WhatsApp com um clique.</p>
          </div>
        </div>
      </section>

      <section className="how">
        <div className="how-inner">
          <div className="section-label">Como funciona</div>
          <h2 className="section-title">Simples assim</h2>
          <div className="steps">
            <div className="step"><div className="step-num">1</div><div className="step-text"><h4>Faça o pagamento</h4><p>Clique no botão de compra e pague R$ 24,99 pelo Mercado Pago. Rápido e seguro.</p></div></div>
            <div className="step"><div className="step-num">2</div><div className="step-text"><h4>Me chame no WhatsApp</h4><p>Clique no botão verde e envie o comprovante. Respondo em poucos minutos.</p></div></div>
            <div className="step"><div className="step-num">3</div><div className="step-text"><h4>Receba seu login e senha</h4><p>Crio seu acesso na hora e você já pode usar a calculadora imediatamente.</p></div></div>
            <div className="step"><div className="step-num">4</div><div className="step-text"><h4>Use para sempre</h4><p>Acesso vitalício. Paga uma vez e nunca mais paga nada.</p></div></div>
          </div>
        </div>
      </section>

      <section className="cta-bottom">
        <h2>Pronta para precificar<br /><em style={{fontStyle:'italic',color:'var(--pink)'}}>com inteligência?</em></h2>
        <p className="cta-bottom-p">Pare de perder dinheiro por preço errado. Invista R$ 24,99 uma única vez e lucre para sempre.</p>
        <div className="cta-wrap">
          <a href={MP_LINK} className="btn-buy" style={{maxWidth:'100%'}}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/></svg>
            Quero meu acesso agora — R$ 24,99
          </a>
          <a href="https://wa.me/5562822370750?text=Ol%C3%A1%20Carolina%2C%20acabei%20de%20pagar%20o%20Precifique%20e%20quero%20meu%20acesso!" className="btn-wpp" target="_blank" rel="noreferrer" style={{maxWidth:'100%'}}>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="#1A9E5C"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Já paguei — quero meu acesso
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-name">Carolina Azevedo</div>
        <div className="footer-links">
          <a href="tel:+5562822370750" className="footer-link">
            <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .06h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.21-1.21a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
            (62) 8223-7075
          </a>
          <a href="https://instagram.com/caroline_azevedo15" target="_blank" rel="noreferrer" className="footer-link">
            <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            @caroline_azevedo15
          </a>
        </div>
        <div className="footer-copy">© 2025 Precifique — Todos os direitos reservados</div>
      </footer>
    </>
  )
}
