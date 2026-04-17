export function TabGuia() {
  return (
    <>
      <div className="guide-item">
        <div className="guide-item-head">
          <div className="gi-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
          <h3>Custo do Produto</h3>
        </div>
        <p>Valor que você paga ao fornecedor por cada unidade individual.</p>
        <div className="guide-formula">Valor total da compra ÷ Quantidade de pares</div>
        <p className="guide-example"><strong>Exemplo:</strong> comprou 12 pares por R$ 240 → custo unitário = R$ 20,00</p>
      </div>

      <div className="guide-item">
        <div className="guide-item-head">
          <div className="gi-icon">
            <svg viewBox="0 0 24 24">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 4v4h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <h3>Frete Unitário</h3>
        </div>
        <p>Rateie o custo do frete entre todos os produtos da entrega. Use a aba Frete para calcular automaticamente.</p>
        <div className="guide-formula">Frete total ÷ Quantidade de produtos</div>
        <p className="guide-example"><strong>Exemplo:</strong> R$ 60 de frete em 12 pares → R$ 5,00 por par</p>
      </div>

      <div className="guide-item">
        <div className="guide-item-head">
          <div className="gi-icon">
            <svg viewBox="0 0 24 24">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <h3>Taxas de Plataforma</h3>
        </div>
        <p>Plataformas e meios de pagamento cobram uma porcentagem sobre cada venda. Sempre inclua no cálculo!</p>
        <ul>
          <li>Shopee: aproximadamente 20%</li>
          <li>Mercado Livre: de 12% a 17%</li>
          <li>Cartão de crédito: de 3% a 5%</li>
          <li>Pix / dinheiro: geralmente 0%</li>
        </ul>
      </div>

      <div className="guide-item">
        <div className="guide-item-head">
          <div className="gi-icon">
            <svg viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <h3>Margem de Lucro</h3>
        </div>
        <p>Quanto você quer ganhar sobre o preço de venda. Esta calculadora usa o método margem sobre preço de venda:</p>
        <div className="guide-formula">Preço = Custo Total ÷ (1 − Margem% ÷ 100)</div>
        <ul>
          <li>Abaixo de 20% — margem muito fraca</li>
          <li>De 20% a 39% — razoável, pode melhorar</li>
          <li>De 40% a 59% — boa margem</li>
          <li>60% ou mais — margem excelente</li>
        </ul>
      </div>

      <div className="guide-item">
        <div className="guide-item-head">
          <div className="gi-icon">
            <svg viewBox="0 0 24 24">
              <line x1="12" y1="3" x2="12" y2="21" />
              <path d="M3 9l9-7 9 7" />
              <path d="M5 12H1l2 5h4l2-5H5z" />
              <path d="M19 12h-4l2 5h4l2-5h-4z" />
            </svg>
          </div>
          <h3>Ponto de Equilíbrio</h3>
        </div>
        <p>Quantas vendas você precisa fazer por mês para não ter prejuízo e cobrir todos os custos fixos.</p>
        <div className="guide-formula">Custos Fixos ÷ (Preço de Venda − Custo Variável)</div>
        <p className="guide-example"><strong>Exemplo:</strong> R$ 2.000 fixos ÷ margem de R$ 28/par = 72 pares por mês para equilibrar.</p>
      </div>

      <div className="guide-tip">
        <h3>A regra de ouro</h3>
        <p>Anote <strong>todos</strong> os seus custos reais antes de precificar. Um centavo ignorado multiplica o prejuízo. Lucro certo vem de controle consistente — não de achismo.</p>
      </div>
    </>
  )
}
