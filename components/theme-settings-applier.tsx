"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

// Applies saved website colors to CSS variables on public pages only
export default function ThemeSettingsApplier() {
  const pathname = usePathname()

  useEffect(() => {
    // Do nothing on admin routes
    if (pathname?.startsWith("/admin")) return

    let aborted = false

    async function applyTheme() {
      try {
        const res = await fetch("/api/website-settings", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (aborted) return

        const colors = data?.colors || {}
        const assets = data?.assets || {}
        const root = document.documentElement

        // Optional theme mode support (dark default). Safe if missing.
        const mode: string | undefined = (data?.themeMode || data?.mode || "dark").toLowerCase()
        const html = document.documentElement
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        if (mode === "light") html.classList.remove("dark")
        else if (mode === "system") prefersDark ? html.classList.add("dark") : html.classList.remove("dark")
        else html.classList.add("dark")

        // Map settings to CSS variables used by Tailwind theme tokens
        if (colors.background) root.style.setProperty("--background", colors.background)
        if (colors.text) root.style.setProperty("--foreground", colors.text)
        if (colors.primary) root.style.setProperty("--primary", colors.primary)
        if (colors.secondary) root.style.setProperty("--secondary", colors.secondary)
        if (colors.accent) root.style.setProperty("--accent", colors.accent)
        if (colors.surface) {
          root.style.setProperty("--card", colors.surface)
          root.style.setProperty("--popover", colors.surface)
          root.style.setProperty("--muted", colors.surface)
          root.style.setProperty("--sidebar", colors.surface)
        }
        if (colors.featuredServerCard) {
          root.style.setProperty("--featured-server-card", colors.featuredServerCard)
        }

        // Apply dynamic logo and favicon if provided
        if (assets.logoUrl) {
          const logoLinks = document.querySelectorAll<HTMLImageElement>('img[alt*="logo" i]')
          logoLinks.forEach(img => {
            try { img.src = assets.logoUrl } catch {}
          })
        }
        if (assets.faviconUrl) {
          let link: HTMLLinkElement | null = document.querySelector("link[rel='icon']")
          if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
          }
          link.href = assets.faviconUrl
        }

        // Ensure body uses variable-driven colors on public pages
        const cls = document.body.classList
        cls.add("bg-background", "text-foreground")
      } catch (_) {
        // ignore
      }
    }

    applyTheme()
    return () => {
      aborted = true
    }
  }, [pathname])

  return null
}