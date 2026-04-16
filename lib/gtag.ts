export const GA_ID = 'G-5J3BJMJNKN'

const PRODUTO = {
  item_id: 'precifique_vitalicio',
  item_name: 'Precifique — Acesso Vitalício',
  price: 24.99,
  quantity: 1,
  currency: 'BRL',
}

// Pageview manual (para SPAs)
export function pageview(url: string) {
  if (typeof window === 'undefined') return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).gtag?.('config', GA_ID, { page_path: url })
}

// Evento genérico
export function event(action: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).gtag?.('event', action, params)
}

// Eventos pré-definidos do Precifique
export const ga = {
  // Checkout — visualizou a página de compra
  verPagina: () => event('view_item', {
    currency: 'BRL',
    value: 24.99,
    items: [PRODUTO],
  }),

  // Checkout — clicou em pagar (preencheu form e submeteu)
  iniciarCheckout: () => event('begin_checkout', {
    currency: 'BRL',
    value: 24.99,
    items: [PRODUTO],
  }),

  // Selecionou forma de pagamento
  selecionarPix: () => event('add_payment_info', {
    currency: 'BRL',
    value: 24.99,
    payment_type: 'pix',
    items: [PRODUTO],
  }),
  selecionarCartao: () => event('add_payment_info', {
    currency: 'BRL',
    value: 24.99,
    payment_type: 'cartao_credito',
    items: [PRODUTO],
  }),

  // Gerou Pix
  gerarPix: () => event('generate_pix', { currency: 'BRL', value: 24.99 }),

  // COMPRA CONFIRMADA — evento de conversão principal
  compraConfirmada: (transactionId?: string) => event('purchase', {
    transaction_id: transactionId ?? Date.now().toString(),
    currency: 'BRL',
    value: 24.99,
    items: [PRODUTO],
  }),

  // Login
  loginSucesso: () => event('login', { method: 'email' }),
  loginErro: (motivo: string) => event('login_error', { motivo }),

  // App interno
  abrirCalculadora: (nicho: string) => event('open_calculator', { nicho }),
  salvarCalculo: () => event('save_calculation'),
  compartilharCalculo: () => event('share_calculation'),
}
