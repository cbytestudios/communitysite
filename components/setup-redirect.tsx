"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function SetupRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(false) // Start as false to avoid loading screen

  useEffect(() => {
    // Don't redirect if already on setup page or API routes
    if (pathname.startsWith('/setup') || pathname.startsWith('/api')) {
      return
    }

    // Only check setup if we're on the home page and not authenticated
    // This prevents the loading screen from showing to all users
    if (pathname === '/') {
      const checkSetup = async () => {
        try {
          // First check if user is already logged in
          const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null
          if (authToken) {
            // User is logged in, no need to check setup
            return
          }

          setChecking(true)
          const response = await fetch('/api/setup/initial')
          if (response.ok) {
            const data = await response.json()
            if (data.needsSetup) {
              router.push('/setup')
            }
          }
        } catch (error) {
          console.error('Setup check failed:', error)
        } finally {
          setChecking(false)
        }
      }

      // Small delay to avoid hydration issues
      const timer = setTimeout(checkSetup, 500)
      return () => clearTimeout(timer)
    }
  }, [pathname, router])

  // Only show loading state on home page when actually checking
  if (checking && pathname === '/') {
    return (
      <div className="fixed inset-0 bg-charcoal/80 flex items-center justify-center z-50">
        <div className="text-amber-gold">Checking setup status...</div>
      </div>
    )
  }

  return null
}