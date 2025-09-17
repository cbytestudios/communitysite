"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  username: string
  email?: string
  profilePicture?: string
  isAdmin: boolean
  isOwner: boolean
  isEmailVerified: boolean
}

interface AuthContextType {
  user: User | null
  login: (token: string, userData: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkAuth = () => {
      // Always try to verify with server (it will check httpOnly cookies)
      fetch('/api/auth/verify', {
        credentials: 'include' // Include cookies in the request
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      })
      .catch((error) => {
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
    }

    checkAuth()
  }, [mounted])

  const login = (token: string, userData: User) => {
    // Token is already set as httpOnly cookie by the server
    setUser(userData)
  }

  const logout = async () => {
    // Call logout API to clear the httpOnly cookie
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    setUser(null)
  }

  // Don't render children until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
