import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comprar Acesso Vitalício — Precifique',
  description: 'Adquira o acesso vitalício ao Precifique por R$ 24,99 e calcule o preço ideal dos seus produtos para sempre.',
  robots: { index: false, follow: false },
  alternates: {
    canonical: 'https://calculadoraprecifique.com/comprar',
  },
  openGraph: {
    url: 'https://calculadoraprecifique.com/comprar',
    title: 'Adquira o Precifique — Acesso Vitalício por R$ 24,99',
    description: 'Calcule o preço ideal dos seus produtos com margem real e ponto de equilíbrio. Pagamento único, acesso para sempre.',
  },
}

export default function ComprarLayout({ children }: { children: React.ReactNode }) {
  return children
}
