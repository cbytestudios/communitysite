"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, Server, Users, BookOpen, HelpCircle, Settings, LogIn, LogOut, User, Calendar } from "lucide-react"
import { useAuth } from "@/components/session-provider"

// Dynamic nav items: base items + optional Community when enabled
const baseNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/servers", label: "Servers", icon: Server },
  { href: "/docs", label: "Documentation", icon: BookOpen },
  { href: "/support", label: "Support", icon: HelpCircle },
] as const

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Fetch public feature flags to determine if Community should be shown
  const [features, setFeatures] = useState<{ communityForum?: boolean; eventCalendar?: boolean } | null>(null)
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/website-settings', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setFeatures(data?.features || null)
        }
      } catch {}
    })()
  }, [])

  const navItems = (() => {
    const items = [...baseNavItems]
    let insertIndex = 2
    if (features?.communityForum) {
  items.splice(insertIndex, 0, { href: "/forum", label: "Forum", icon: Users } as any)
      insertIndex += 1
    }
    if (features?.eventCalendar) {
  items.splice(insertIndex, 0, { href: "/events", label: "Events", icon: Calendar } as any)
      insertIndex += 1
    }
    return items
  })()

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-charcoal-light/95 backdrop-blur-sm border-b border-amber-gold/20 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center">
              <img
                src="/logo.png"
                alt="logo"
                className="h-9 w-9 rounded-md shadow-lg"
              />
            </motion.div>
          </Link>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item, index) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={`relative flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 group ${
                        isActive
                          ? "text-amber-gold bg-amber-gold/10"
                          : "text-sage-green hover:text-amber-gold hover:bg-amber-gold/5"
                      }`}
                    >
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-amber-gold/10 rounded-md border border-amber-gold/30"
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sage-green hover:text-amber-gold hover:bg-amber-gold/10 transition-all duration-300"
                    asChild
                  >
                    <Link href="/profile">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </Button>
                </motion.div>
                {(user.isAdmin || user.isOwner) && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sage-green hover:text-amber-gold hover:bg-amber-gold/10 transition-all duration-300"
                      asChild
                    >
                      <Link href="/admin">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin
                      </Link>
                    </Button>
                  </motion.div>
                )}
                {/* Debug info - remove after testing */}
                {process.env.NODE_ENV === 'development' && user && (
                  <div className="text-xs text-sage-green/60 p-2 bg-charcoal/50 rounded">
                    Debug: isAdmin={user.isAdmin?.toString()}, isOwner={user.isOwner?.toString()}
                  </div>
                )}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sage-green hover:text-amber-gold hover:bg-amber-gold/10 transition-all duration-300"
                    onClick={() => logout()}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </motion.div>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-amber-gold to-amber-gold/80 hover:from-amber-gold/90 hover:to-amber-gold/70 text-charcoal font-semibold shadow-lg"
                  asChild
                >
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>

          <div className="md:hidden">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="text-sage-green hover:text-amber-gold transition-colors"
              >
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-charcoal-light/95 border-t border-amber-gold/20">
              {navItems.map((item, index) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                        isActive
                          ? "text-amber-gold bg-amber-gold/10 border-l-2 border-amber-gold"
                          : "text-sage-green hover:text-amber-gold hover:bg-amber-gold/5"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                )
              })}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="pt-4 pb-3 border-t border-amber-gold/20"
              >
                <div className="flex items-center px-3 space-y-2 flex-col">
                  {user ? (
                    <>
                      {(user.isAdmin || user.isOwner) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-sage-green hover:text-amber-gold hover:bg-amber-gold/10"
                          asChild
                        >
                          <Link href="/admin" onClick={() => setIsOpen(false)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Admin
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-sage-green hover:text-amber-gold hover:bg-amber-gold/10"
                        onClick={() => {
                          logout()
                          setIsOpen(false)
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-amber-gold to-amber-gold/80 hover:from-amber-gold/90 hover:to-amber-gold/70 text-charcoal font-semibold"
                      asChild
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </Link>
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
