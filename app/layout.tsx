import type React from "react"
import type { Metadata } from "next"
import { Inter, Exo_2 } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { FloatingParticles } from "@/components/floating-particles"
import { AuthProvider } from "@/components/session-provider"
import { SetupRedirect } from "@/components/setup-redirect"
import ThemeSettingsApplier from "@/components/theme-settings-applier"

const exo = Exo_2({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  preload: true,
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  preload: true,
})

export const metadata: Metadata = {
  title: "Community Website - Multi-Game Platform",
  description:
    "Join our multi-game community platform. Find servers, connect with players, and build your gaming community.",
  generator: "v0.app",
  keywords: "gaming, community, multiplayer, servers, roleplay, survival",
  icons: {
    icon: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${exo.variable} ${inter.variable} antialiased`}>
      <body className="min-h-screen">
        <AuthProvider>
          <SetupRedirect />
          <ThemeSettingsApplier />
          <FloatingParticles />
          <Navigation />
          <main className="relative z-10">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
