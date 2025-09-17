"use client"

import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { FeaturedServers } from "@/components/featured-servers"
import { NewsFeed } from "@/components/news-feed"
import { ImageGallery } from "@/components/image-gallery"
import { PageTransition } from "@/components/page-transition"
import { ScrollReveal } from "@/components/scroll-reveal"

export default function HomePage() {
  return (
    <PageTransition>
      <div className="min-h-screen flex-col">
        <main className="flex-1">
          <HeroSection />

          <ScrollReveal direction="up" delay={0.2}>
            <FeaturedServers />
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.3}>
            <ImageGallery />
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.4}>
            <NewsFeed />
          </ScrollReveal>
        </main>

        <ScrollReveal direction="up" delay={0.6}>
          <Footer />
        </ScrollReveal>
      </div>
    </PageTransition>
  )
}
