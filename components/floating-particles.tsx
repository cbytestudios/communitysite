"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  hue: number
}

export function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = []
      for (let i = 0; i < 28; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          duration: Math.random() * 18 + 10,
          hue: Math.random() > 0.5 ? 190 : 265, // cyan/violet hues
        })
      }
      setParticles(newParticles)
    }

    generateParticles()
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `hsl(${p.hue} 100% 60% / 0.12)`,
            filter: "blur(1px)",
          }}
          animate={{
            y: [0, -120, 0],
            opacity: [0, 0.9, 0],
            boxShadow: [
              `0 0 6px hsl(${p.hue} 100% 60% / 0.15)`,
              `0 0 16px hsl(${p.hue} 100% 60% / 0.25)`,
              `0 0 6px hsl(${p.hue} 100% 60% / 0.15)`,
            ],
          }}
          transition={{
            duration: p.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />)
      )}
    </div>
  )
}
