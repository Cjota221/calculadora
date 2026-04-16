import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#7C3AED',
}

export const metadata: Metadata = {
  title: 'Precifique — Calculadora de Precificação Profissional',
  description: 'Calcule o preço ideal dos seus produtos com margem real e ponto de equilíbrio.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/Logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/Logo.png', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Precifique',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/Logo.png" type="image/png" />
        <link rel="shortcut icon" href="/Logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Logo.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
