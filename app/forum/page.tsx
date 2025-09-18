"use client"

import { Footer } from "@/components/footer"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/session-provider"

function ForumCategoryList() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/forum/categories', { cache: 'no-store' })
        const data = res.ok ? await res.json() : { categories: [] }
        setItems(data.categories || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])
  if (loading) return <div className="text-sage-green/70">Loading…</div>
  if (!items.length) return <div className="text-sage-green/70">No categories yet.</div>
  return (
    <div className="divide-y divide-amber-gold/10 rounded-lg border border-amber-gold/20">
      {items.map((c) => (
        <a key={c.id} href={`/forum/${c.id}`} className="block p-4 hover:bg-charcoal/40 transition">
          <div className="text-sage-green font-medium">{c.name}</div>
          {c.description && <div className="text-sage-green/70 text-sm">{c.description}</div>}
        </a>
      ))}
    </div>
  )
}

export default function ForumHomePage() {
  const [features, setFeatures] = useState<{ communityForum?: boolean } | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/website-settings', { cache: 'no-store' })
        const data = res.ok ? await res.json() : {}
        setFeatures(data?.features || {})
      } catch {
        setFeatures({})
      }
    })()
  }, [])

  const enabled = !!features?.communityForum
  const { user } = useAuth()
  const isAdmin = !!user && (user.isAdmin || user.isOwner)

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-western text-3xl md:text-5xl text-secondary mb-2">Forum</h1>
            <p className="text-muted-foreground">Discuss, share, and collaborate with the community.</p>
          </div>

          {!enabled ? (
            <div className="p-6 rounded-lg border border-amber-gold/20 bg-charcoal/40 text-sage-green">
              Forum is disabled. Enable it in Admin → Settings → Features.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl text-sage-green">Categories</h2>
                {isAdmin && <Link href="/forum/manage" className="text-amber-gold hover:underline">Manage</Link>}
              </div>
              <ForumCategoryList />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}