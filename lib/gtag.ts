export const GA_ID = 'G-5J3BJMJNKN'

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
  // Checkout
  iniciarCheckout: () => event('begin_checkout', { currency: 'BRL', value: 24.99 }),
  selecionarPix: () => event('select_payment_method', { payment_type: 'pix' }),
  selecionarCartao: () => event('select_payment_method', { payment_type: 'cartao' }),
  gerarPix: () => event('generate_pix', { currency: 'BRL', value: 24.99 }),
  pagamentoCartao: () => event('payment_attempt', { payment_type: 'cartao' }),
  compraConfirmada: () => event('purchase', { currency: 'BRL', value: 24.99, transaction_id: Date.now().toString() }),

  // Login
  loginSucesso: () => event('login', { method: 'email' }),
  loginErro: (motivo: string) => event('login_error', { motivo }),

  // App interno
  abrirCalculadora: (nicho: string) => event('open_calculator', { nicho }),
  salvarCalculo: () => event('save_calculation'),
  compartilharCalculo: () => event('share_calculation'),
}
