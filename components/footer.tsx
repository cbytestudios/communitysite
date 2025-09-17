"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Github, Twitter, Diamond as Discord } from "lucide-react"

interface PublicSettings {
  siteName?: string
  socialLinks?: {
    discord?: string
    twitter?: string
    youtube?: string
    twitch?: string
    steam?: string
    facebook?: string
  }
}

export function Footer() {
  const [settings, setSettings] = useState<PublicSettings>({})

  useEffect(() => {
    let aborted = false
    async function load() {
      try {
        const res = await fetch("/api/website-settings", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (!aborted) setSettings(data)
      } catch {}
    }
    load()
    return () => { aborted = true }
  }, [])

  const siteName = settings.siteName || "Community Hub"
  const links = settings.socialLinks || {}

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center" />
              <span className="font-western text-xl text-secondary">{siteName}</span>
            </div>
            <p className="text-muted-foreground max-w-md">
              The ultimate community hub for your gaming site. Join thousands of players in an amazing experience.
            </p>
            <div className="flex space-x-4 mt-6">
              {links.discord ? (
                <Link href={links.discord} className="text-muted-foreground hover:text-primary transition-colors" target="_blank" rel="noreferrer">
                  <Discord className="w-5 h-5" />
                </Link>
              ) : null}
              {links.twitter ? (
                <Link href={links.twitter} className="text-muted-foreground hover:text-primary transition-colors" target="_blank" rel="noreferrer">
                  <Twitter className="w-5 h-5" />
                </Link>
              ) : null}
              {links.facebook ? (
                <Link href={links.facebook} className="text-muted-foreground hover:text-primary transition-colors" target="_blank" rel="noreferrer">
                  <Github className="w-5 h-5" />
                </Link>
              ) : null}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/servers" className="text-muted-foreground hover:text-primary transition-colors">
                  Server Browser
                </Link>
              </li>
              <li>
                <Link href="/downloads" className="text-muted-foreground hover:text-primary transition-colors">
                  Downloads
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-muted-foreground hover:text-primary transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/support" className="text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/support/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/support/tickets" className="text-muted-foreground hover:text-primary transition-colors">
                  Submit Ticket
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
