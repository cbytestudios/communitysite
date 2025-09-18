"use client"
import { Footer } from "@/components/footer"
import { ServerBrowser } from "@/components/server-browser"
import { useEffect, useState } from "react"
import { notFound } from "next/navigation"

export default function ServersPage() {
  const [enabled, setEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    let aborted = false
    ;(async () => {
      try {
        const res = await fetch('/api/website-settings', { cache: 'no-store' })
        const data = res.ok ? await res.json() : {}
        if (!aborted) setEnabled(!!data?.features?.serverListing)
      } catch {
        if (!aborted) setEnabled(true)
      }
    })()
    return () => { aborted = true }
  }, [])

  // While loading, render nothing to avoid flicker
  if (enabled === null) return null

  if (!enabled) {
    // Return 404 when server listing is disabled
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-western text-3xl md:text-5xl text-secondary mb-4">Server Browser</h1>
            <p className="text-xl text-muted-foreground">Discover and join the best game servers in our community</p>
          </div>
          <ServerBrowser />
        </div>
      </main>
      <Footer />
    </div>
  )
}
