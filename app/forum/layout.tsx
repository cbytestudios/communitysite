"use client"

import { useEffect, useState } from "react"
import { notFound, usePathname } from "next/navigation"

// Gate all /forum routes except /forum/manage (admin UI can still appear but should rely on its own auth)
export default function ForumLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [enabled, setEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    let aborted = false
    ;(async () => {
      try {
        const res = await fetch('/api/website-settings', { cache: 'no-store' })
        const data = res.ok ? await res.json() : {}
        if (!aborted) setEnabled(!!data?.features?.communityForum)
      } catch {
        if (!aborted) setEnabled(false)
      }
    })()
    return () => { aborted = true }
  }, [])

  // Always allow admin manage page to load; that page enforces admin auth itself
  const isManage = pathname?.startsWith('/forum/manage')

  if (enabled === null && !isManage) return null
  if (!isManage && enabled === false) notFound()

  return <>{children}</>
}