"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/components/session-provider"

export default function ForumCategoryPage() {
  const params = useParams() as { categoryId: string }
  const router = useRouter()
  const { user } = useAuth()

  const [category, setCategory] = useState<any | null>(null)
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!params?.categoryId) return
    ;(async () => {
      try {
        const catsRes = await fetch('/api/forum/categories', { cache: 'no-store' })
        const cats = catsRes.ok ? await catsRes.json() : { categories: [] }
        const cat = (cats.categories || []).find((c: any) => c.id === params.categoryId)
        setCategory(cat || null)
        const thrRes = await fetch(`/api/forum/threads?categoryId=${params.categoryId}`, { cache: 'no-store' })
        const thr = thrRes.ok ? await thrRes.json() : { threads: [] }
        setThreads(thr.threads || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [params?.categoryId])

  const startThread = async () => {
    if (!title.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, categoryId: params.categoryId })
      })
      if (res.ok) {
        setTitle("")
        setContent("")
        const thrRes = await fetch(`/api/forum/threads?categoryId=${params.categoryId}`, { cache: 'no-store' })
        const thr = thrRes.ok ? await thrRes.json() : { threads: [] }
        setThreads(thr.threads || [])
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-sage-green/70">Loading…</div>
          ) : !category ? (
            <div className="text-sage-green/70">Category not found.</div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="font-western text-3xl md:text-5xl text-secondary mb-2">{category.name}</h1>
                {category.description && (
                  <p className="text-muted-foreground">{category.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <h2 className="text-xl text-sage-green">Threads</h2>
                <div className="rounded-lg border border-amber-gold/20 divide-y divide-amber-gold/10">
                  {threads.length === 0 ? (
                    <div className="p-4 text-sage-green/70">No threads yet.</div>
                  ) : threads.map((t) => (
                    <div key={t.id} className="p-4 hover:bg-charcoal/40">
                      <div className="text-sage-green">{t.title}</div>
                      <div className="text-sage-green/60 text-xs">{new Date(t.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl text-sage-green">New Topic</h2>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full bg-charcoal border-amber-gold/30 text-sage-green rounded px-3 py-2" />
                <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Content (optional)" className="w-full bg-charcoal border-amber-gold/30 text-sage-green rounded px-3 py-2 min-h-[120px]" />
                <button onClick={startThread} disabled={creating || !title.trim()} className="px-4 py-2 bg-amber-gold text-charcoal rounded disabled:opacity-50">
                  {creating ? 'Creating…' : 'Create Topic'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}