import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Precifique — Calculadora de Precificação Profissional',
  description: 'Calcule o preço ideal dos seus produtos com margem real e ponto de equilíbrio.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Precifique',
  },
  themeColor: '#7C3AED',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
