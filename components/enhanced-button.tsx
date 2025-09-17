"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

interface EnhancedButtonProps {
  children: ReactNode
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  className?: string
  onClick?: () => void
  href?: string
  glowEffect?: boolean
}

export function EnhancedButton({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  href,
  glowEffect = false,
}: EnhancedButtonProps) {
  const buttonContent = (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        variant={variant}
        size={size}
        className={`
          relative overflow-hidden transition-all duration-300
          ${glowEffect ? "shadow-lg hover:shadow-amber-gold/25 hover:shadow-2xl" : ""}
          ${className}
        `}
        onClick={onClick}
      >
        {glowEffect && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
        )}
        <span className="relative z-10">{children}</span>
      </Button>
    </motion.div>
  )

  if (href) {
    return (
      <a href={href} className="inline-block">
        {buttonContent}
      </a>
    )
  }

  return buttonContent
}
