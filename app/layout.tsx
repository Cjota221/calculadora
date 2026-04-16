import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

const GA_ID = 'G-5J3BJMJNKN'
const SITE_URL = 'https://calculadoraprecifique.com'

export const viewport: Viewport = {
  themeColor: '#7C3AED',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Precifique — Calculadora de Precificação Profissional',
    template: '%s | Precifique',
  },
  description: 'Calcule o preço ideal dos seus produtos com margem real, ponto de equilíbrio e lucro garantido. Ferramenta completa para empreendedoras e artesãs.',
  keywords: ['calculadora de precificação', 'precificação de produtos', 'calcular preço de venda', 'margem de lucro', 'ponto de equilíbrio', 'precificação artesanato', 'precificação para empreendedoras'],
  authors: [{ name: 'Precifique' }],
  creator: 'Precifique',
  publisher: 'Precifique',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: 'Precifique',
    title: 'Precifique — Calculadora de Precificação Profissional',
    description: 'Calcule o preço ideal dos seus produtos com margem real, ponto de equilíbrio e lucro garantido.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Precifique — Calculadora de Precificação Profissional',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Precifique — Calculadora de Precificação Profissional',
    description: 'Calcule o preço ideal dos seus produtos com margem real e ponto de equilíbrio.',
    images: ['/og-image.png'],
  },
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
      <body>
        {children}
        <Script src="https://cjota-precifique.9eo9b2.easypanel.host/popup.js" strategy="afterInteractive" />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}</Script>
      </body>
    </html>
  )
}
