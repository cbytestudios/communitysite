"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface GlitchTextProps {
  text: string
  className?: string
  glitchOnHover?: boolean
}

export function GlitchText({ text, className = "", glitchOnHover = false }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false)
  const [glitchText, setGlitchText] = useState(text)

  const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?"

  const triggerGlitch = () => {
    if (isGlitching) return

    setIsGlitching(true)
    let iterations = 0
    const maxIterations = 10

    const interval = setInterval(() => {
      setGlitchText(
        text
          .split("")
          .map((char, index) => {
            if (index < iterations) return text[index]
            return glitchChars[Math.floor(Math.random() * glitchChars.length)]
          })
          .join(""),
      )

      if (iterations >= text.length) {
        clearInterval(interval)
        setGlitchText(text)
        setIsGlitching(false)
      }

      iterations += 1 / 3
    }, 30)
  }

  useEffect(() => {
    if (!glitchOnHover) {
      const timer = setInterval(() => {
        if (Math.random() < 0.1) triggerGlitch()
      }, 3000)
      return () => clearInterval(timer)
    }
  }, [glitchOnHover])

  return (
    <motion.span
      className={`relative ${className}`}
      onMouseEnter={glitchOnHover ? triggerGlitch : undefined}
      animate={
        isGlitching
          ? {
              x: [0, -2, 2, -1, 1, 0],
              textShadow: ["0 0 0 transparent", "2px 0 0 #ff0000, -2px 0 0 #00ffff", "0 0 0 transparent"],
            }
          : {}
      }
      transition={{ duration: 0.1, repeat: isGlitching ? 3 : 0 }}
    >
      {glitchText}
    </motion.span>
  )
}
