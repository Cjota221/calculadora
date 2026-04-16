import type { Metadata } from 'next'
import '@/styles/landing.css'
import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/landing/Hero'
import { SocialProof } from '@/components/landing/SocialProof'
import { Features } from '@/components/landing/Features'
import { AppPreview } from '@/components/landing/AppPreview'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { CtaBottom } from '@/components/landing/CtaBottom'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Precifique — Calculadora de Precificação Profissional',
  description: 'Pare de adivinhar o preço dos seus produtos. O Precifique calcula margem real, ponto de equilíbrio e lucro garantido em segundos.',
  alternates: {
    canonical: 'https://calculadoraprecifique.com',
  },
  openGraph: {
    url: 'https://calculadoraprecifique.com',
    title: 'Precifique — Calculadora de Precificação Profissional',
    description: 'Pare de adivinhar o preço dos seus produtos. Calcule margem real, ponto de equilíbrio e lucro garantido.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Precifique',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'Calculadora de precificação profissional para empreendedoras. Calcule margem real, ponto de equilíbrio e lucro garantido.',
  url: 'https://calculadoraprecifique.com',
  offers: {
    '@type': 'Offer',
    price: '24.99',
    priceCurrency: 'BRL',
    availability: 'https://schema.org/InStock',
    priceValidUntil: '2026-12-31',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    ratingCount: '127',
  },
}

export default function Landing() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <AppPreview />
      <HowItWorks />
      <CtaBottom />
      <Footer />
    </>
  )
}
