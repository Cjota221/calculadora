import '@/styles/landing.css'
import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { CtaBottom } from '@/components/landing/CtaBottom'
import { Footer } from '@/components/layout/Footer'

export default function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CtaBottom />
      <Footer />
    </>
  )
}
