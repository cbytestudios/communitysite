"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Play, Users, Server, ChevronDown } from "lucide-react"
import { useRef } from "react"

const particles = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1,
  duration: Math.random() * 20 + 10,
}))

interface WebsiteSettings {
  siteName: string
  heroTitle: string
  heroDescription: string
  galleryImages: Array<{
    url: string
    caption?: string
    alt?: string
  }>
}

const defaultImages = [
  "/gallery1.jpg",
  "/gallery2.jpg",
  "/gallery3.jpg",
  "/gallery4.jpg",
]

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [settings, setSettings] = useState<WebsiteSettings>({
    siteName: "Community Website",
    heroTitle: "Welcome to Our Gaming Community",
    heroDescription: "Join our multi-game community. Experience epic adventures, connect with players, and forge your legend across multiple gaming platforms.",
    galleryImages: defaultImages.map(url => ({ url }))
  })
  const [shuffledImages, setShuffledImages] = useState<string[]>(defaultImages)
  const [discordCount, setDiscordCount] = useState<number>(0)
  const [gamePlayerCount, setGamePlayerCount] = useState<number>(0)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.8])

  useEffect(() => {
    setMounted(true)
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/website-settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        const imageUrls = data.galleryImages?.map((img: any) => img.url || img) || defaultImages
        setShuffledImages(imageUrls)
      }
    } catch (error) {
      console.error("Failed to fetch website settings:", error)
    }
  }

  useEffect(() => {
    if (!mounted || shuffledImages.length === 0) return

    // Shuffle images for non-deterministic order each load
    const shuffled = [...shuffledImages]
      .map((src) => ({ src, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ src }) => src)
    setShuffledImages(shuffled)

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % shuffled.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [mounted, shuffledImages.length])

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/api/discord/members", { cache: "no-store" })
        const data = await res.json()
        if (typeof data?.count === "number") setDiscordCount(data.count)
      } catch {}
    }
    fetchMembers()
    const t = setInterval(fetchMembers, 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    async function fetchGamePlayers() {
      try {
        const res = await fetch("/api/servers/public", { cache: "no-store" })
        const data = await res.json()
        if (Array.isArray(data)) {
          const totalPlayers = data.reduce((sum, server) => sum + (server.playerCount || 0), 0)
          setGamePlayerCount(totalPlayers)
        }
      } catch {}
    }
    fetchGamePlayers()
    const t = setInterval(fetchGamePlayers, 30_000) // Update every 30 seconds
    return () => clearInterval(t)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#060a12] via-[#0b0f17] to-[#0e1420]">
      <div className="absolute inset-0">
        {shuffledImages.map((image, index) => (
          <motion.div
            key={image}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${image})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentImageIndex ? 0.22 : 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        ))}
        {/* cyan/violet gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f17] via-transparent to-[#0b0f17] opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f17]/60 via-transparent to-[#0e1420]/90" />
        <div className="absolute inset-0" style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, rgba(124,77,255,0.15) 0%, rgba(0,0,0,0) 60%), radial-gradient(40% 40% at 70% 60%, rgba(0,209,255,0.12) 0%, rgba(0,0,0,0) 60%)"
        }} />
      </div>

      {/* parallax glow sheet */}
      <motion.div
        className="absolute inset-0"
        style={{ y, background: "linear-gradient(90deg, rgba(0,209,255,0.06), rgba(124,77,255,0.06))" }}
      />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{ opacity, scale }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <TypewriterText
            text={settings.heroTitle}
            className="font-[var(--font-display)] tracking-tight text-4xl md:text-7xl lg:text-8xl text-primary mb-6 leading-tight drop-shadow-[0_0_24px_rgba(0,209,255,0.25)]"
          />
        </motion.div>

        <motion.p
          className="text-xl md:text-2xl text-[color:var(--muted-foreground)] max-w-3xl mx-auto mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          {settings.heroDescription}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary)_85%,#fff)] px-8 py-4 text-lg font-semibold shadow-[0_10px_40px_rgba(0,209,255,0.25)]"
            >
              <Play className="w-5 h-5 mr-2" />
              Join Now
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground px-8 py-4 text-lg bg-transparent backdrop-blur-sm shadow-[0_10px_40px_rgba(124,77,255,0.2)]"
            >
              <Server className="w-5 h-5 mr-2" />
              Browse Servers
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.6 }}
        >
          <StatCard icon={Users} label="Discord Members" value={discordCount} delay={0} />
          <StatCard icon={Server} label="Online Players" value={gamePlayerCount} delay={0.2} />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        whileHover={{ scale: 1.1 }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
      >
        <div className="w-8 h-12 border-2 border-primary rounded-full flex justify-center backdrop-blur-sm bg-[rgba(0,209,255,0.08)]">
          <motion.div
            className="w-1 h-3 bg-primary rounded-full mt-2"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
        <ChevronDown className="w-6 h-6 text-primary mx-auto mt-2" />
      </motion.div>
    </section>
  )
}

function TypewriterText({ text, className }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return (
    <h1 className={className}>
      {displayText}
      <motion.span
        className="inline-block w-1 h-[0.8em] bg-primary ml-1"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
      />
    </h1>
  )
}

function StatCard({ icon: Icon, label, value, delay }: { icon: any; label: string; value: number; delay: number }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  // Reset animation whenever the target value changes
  useEffect(() => {
    setHasAnimated(false)
    setCount(0)
  }, [value])

  useEffect(() => {
    if (!hasAnimated && isInView) {
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          setHasAnimated(true)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [value, hasAnimated, isInView])

  return (
    <motion.div
      ref={ref}
      className="bg-muted/30 backdrop-blur-sm border border-primary/20 rounded-lg p-6 text-center shadow-xl"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{
        scale: 1.05,
        y: -5,
        boxShadow: "0 20px 40px rgba(0, 209, 255, 0.2)",
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
        <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
      </motion.div>
      <div className="text-3xl font-bold text-foreground mb-2 font-[var(--font-display)]">{count.toLocaleString()}</div>
      <div className="text-muted-foreground">{label}</div>
    </motion.div>
  )
}
