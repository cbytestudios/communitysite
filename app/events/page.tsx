"use client"

import { Footer } from "@/components/footer"
import { EventsCalendar } from "@/components/events-calendar"
import { useEffect, useState } from "react"

export default function EventsPage() {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/website-settings', { cache: 'no-store' })
        const data = res.ok ? await res.json() : {}
        setEnabled(!!data?.features?.eventCalendar)
      } catch {
        setEnabled(false)
      }
    })()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-western text-3xl md:text-5xl text-secondary mb-2">Events</h1>
            <p className="text-muted-foreground">Community calendar and upcoming activities.</p>
          </div>

          {!enabled ? (
            <div className="p-6 rounded-lg border border-amber-gold/20 bg-charcoal/40 text-sage-green">
              Events are disabled. Enable them in Admin → Settings → Features.
            </div>
          ) : (
            <EventsCalendar />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}