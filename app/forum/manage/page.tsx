"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/session-provider"
import { Footer } from "@/components/footer"
import { ForumManagement } from "@/components/admin/forum-management"

export default function ForumManagePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user || (!user.isAdmin && !user.isOwner)) router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user || (!user.isAdmin && !user.isOwner)) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ForumManagement />
        </div>
      </main>
      <Footer />
    </div>
  )
}