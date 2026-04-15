import '@/styles/landing.css'
import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/landing/Hero'
import { SocialProof } from '@/components/landing/SocialProof'
import { Features } from '@/components/landing/Features'
import { AppPreview } from '@/components/landing/AppPreview'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { CtaBottom } from '@/components/landing/CtaBottom'
import { Footer } from '@/components/layout/Footer'

export default function Landing() {
  return (
    <>
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
