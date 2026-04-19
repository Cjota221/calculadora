export function AfiliadosSection() {
  return (
    <section className="lp-afiliados">
      <div className="af-inner">
        <div className="af-badge">💜 Programa de Afiliados</div>
        <h2 className="af-title">Indique e ganhe <strong>R$ 12,90</strong> por venda</h2>
        <p className="af-sub">Cadastre-se grátis, pegue seu link exclusivo e comece a divulgar agora. Sem burocracia.</p>
        <ul className="af-beneficios">
          <li>✅ 34% de comissão por cada acesso vitalício vendido</li>
          <li>✅ Link único rastreável</li>
          <li>✅ Painel com histórico de ganhos em tempo real</li>
          <li>✅ Pagamento via PIX direto pra você</li>
        </ul>
        <a href="/afiliados/cadastro" className="af-btn">Quero ser afiliada →</a>
        <p className="af-login-link">
          Já tem conta? <a href="/afiliados/login">Acessar meu painel</a>
        </p>
      </div>
    </section>
  )
}
