"use client"

import { Footer } from "@/components/footer"
import { EventsCalendar } from "@/components/events-calendar"
import { useEffect, useState } from "react"
import { notFound } from "next/navigation"

export default function EventsPage() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  useEffect(() => {
    let aborted = false
    ;(async () => {
      try {
        const res = await fetch('/api/website-settings', { cache: 'no-store' })
        const data = res.ok ? await res.json() : {}
        if (!aborted) setEnabled(!!data?.features?.eventCalendar)
      } catch {
        if (!aborted) setEnabled(false)
      }
    })()
    return () => { aborted = true }
  }, [])

  if (enabled === null) return null
  if (!enabled) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-western text-3xl md:text-5xl text-secondary mb-2">Events</h1>
            <p className="text-muted-foreground">Community calendar and upcoming activities.</p>
          </div>

          <EventsCalendar />
        </div>
      </main>
      <Footer />
    </div>
  )
}