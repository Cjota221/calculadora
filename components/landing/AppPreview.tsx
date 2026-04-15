export function AppPreview() {
  return (
    <section className="lp-preview">
      <div className="preview-inner">
        <div className="section-label">Veja como funciona</div>
        <h2 className="section-title">O resultado aparece<br />na hora</h2>
        <div className="preview-card">
          <div className="preview-row">
            <span className="preview-row-label">Custo do produto</span>
            <span className="preview-row-val">R$ 45,00</span>
          </div>
          <div className="preview-row">
            <span className="preview-row-label">Frete por unidade</span>
            <span className="preview-row-val">R$ 3,50</span>
          </div>
          <div className="preview-row">
            <span className="preview-row-label">Embalagem</span>
            <span className="preview-row-val">R$ 2,00</span>
          </div>
          <div className="preview-row">
            <span className="preview-row-label">Taxa do app (5%)</span>
            <span className="preview-row-val">R$ 2,50</span>
          </div>
          <div className="preview-row">
            <span className="preview-row-label">Margem desejada</span>
            <span className="preview-row-val">40%</span>
          </div>
          <div className="preview-result">
            <div className="preview-result-label">Preço ideal de venda</div>
            <div className="preview-result-price">R$ 74,50</div>
            <div className="preview-result-profit">Lucro líquido por unidade: <strong>R$ 21,50</strong></div>
          </div>
        </div>
      </div>
    </section>
  )
}
