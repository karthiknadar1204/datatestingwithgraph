"use client"

import Navigation from "@/components/landing/Navigation"
import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import Benefits from "@/components/landing/Benefits"
import Testimonials from "@/components/landing/Testimonials"
import SocialProof from "@/components/landing/SocialProof"
import Pricing from "@/components/landing/Pricing"
import CTA from "@/components/landing/CTA"
import Footer from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navigation />
      <Hero />
      <Features />
      <Benefits />
      <Testimonials />
      <SocialProof />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
