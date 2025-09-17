"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, MapPin, Wifi } from "lucide-react"

interface Server {
  _id: string
  name: string
  description: string
  ip: string
  port: number
  gameType: "fivem" | "redm" | "minecraft" | "rust" | "gmod" | "csgo" | "cs2" | "valorant" | "apex" | "cod" | "battlefield" | "ark" | "7dtd" | "terraria" | "satisfactory" | "valheim" | "palworld" | "other"
  isPublic: boolean
  isOnline: boolean
  playerCount: number
  maxPlayers: number
  ping: number
  lastChecked: string
  createdAt: string
}

// Hook to get user's geolocation for better ping calculation
function useGeolocation() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    // Only use IP-based location, no GPS/location permission required
    function tryIPGeolocation() {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (data.latitude && data.longitude) {
            setLocation({
              lat: data.latitude,
              lon: data.longitude,
            })
          }
        })
        .catch(() => console.log("IP geolocation failed"))
    }

    tryIPGeolocation()
  }, [])

  return location
}

// Enhanced ping measurement with geolocation consideration
function usePing(serverIp: string, serverPort: string, userLocation: { lat: number; lon: number } | null) {
  const [ping, setPing] = useState<number | null>(null)
  const [estimatedPing, setEstimatedPing] = useState<number | null>(null)

  useEffect(() => {
    // Calculate estimated ping based on geolocation
    if (userLocation) {
      const serverLat = 39.0458
      const serverLon = -76.6413
      const distance = calculateDistance(userLocation.lat, userLocation.lon, serverLat, serverLon)
      const estimated = Math.round(distance / 100 + 20)
      setEstimatedPing(estimated)
    }

    // Skip if no server target yet
    if (!serverIp || !serverPort) {
      setPing(null)
      return
    }

    const measurePing = async () => {
      const start = performance.now()
      try {
        await fetch(`/api/servers/ping?ip=${serverIp}&port=${serverPort}`, { method: "GET", cache: "no-store" })
        const end = performance.now()
        const actualPing = Math.round(end - start)
        setPing(actualPing)
      } catch (e) {
        setPing(estimatedPing)
      }
    }

    measurePing()
    const interval = setInterval(measurePing, 15000)
    return () => clearInterval(interval)
  }, [serverIp, serverPort, userLocation, estimatedPing])

  return ping || estimatedPing
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Hook to fetch real-time player data
function useServerData() {
  const [serverData, setServerData] = useState<{
    players: number
    maxPlayers: number
    serverName: string
  } | null>(null)

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        const response = await fetch('/api/servers/players', { cache: 'no-store' })
        const data = await response.json()
        setServerData({
          players: data.count || 0,
          maxPlayers: data.maxPlayers || 48,
          serverName: data.serverName || "Community Network"
        })
      } catch (error) {
        console.error('Failed to fetch server data:', error)
      }
    }

    fetchServerData()
    const interval = setInterval(fetchServerData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return serverData
}

// Helper to style ping
function getPingStatus(ping: number | null) {
  if (ping === null) {
    return { color: "text-gray-400", label: "N/A" }
  }
  if (ping < 50) {
    return { color: "text-green-500", label: `${ping}ms` }
  }
  if (ping < 100) {
    return { color: "text-yellow-500", label: `${ping}ms` }
  }
  return { color: "text-red-500", label: `${ping}ms` }
}

export function FeaturedServers() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showCopyToast, setShowCopyToast] = useState(false)
  const [servers, setServers] = useState<Server[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const userLocation = useGeolocation()

  // Fetch servers from API
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch("/api/servers/public")
        if (response.ok) {
          const data = await response.json()
          // Show public servers; prioritize featured/online via server order
          setServers(data.filter((server: Server) => server.isPublic))
        }
      } catch (error) {
        console.error("Failed to fetch servers:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchServers()
    // Refresh server data every 30 seconds
    const interval = setInterval(fetchServers, 30000)
    return () => clearInterval(interval)
  }, [])

  // Auto-rotate through servers when more than one
  useEffect(() => {
    if (servers.length <= 1 || isPaused) return
    const id = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % servers.length)
    }, 7000)
    return () => clearInterval(id)
  }, [servers.length, isPaused])

  const nextServer = () => {
    if (servers.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % servers.length)
    }
  }

  const prevServer = () => {
    if (servers.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + servers.length) % servers.length)
    }
  }


  const currentServer = servers[currentIndex]
  const serverIp = currentServer?.ip ?? ""
  const serverPort = currentServer?.port ? String(currentServer.port) : ""
  const ping = usePing(serverIp, serverPort, userLocation)
  const { color, label } = getPingStatus(ping)

  // Render nothing until at least one server is available
  if (!currentServer) {
    return null
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-card/20" style={{
      // allow override via CSS variable from theme applier
      background: undefined
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl text-secondary mb-4 font-[var(--font-display)] font-bold">Featured Servers</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover featured community servers across multiple games.
          </p>
        </motion.div>

        <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          {/* Pagination Dots */}
          {servers.length > 1 && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {servers.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to server ${idx + 1}`}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40
                    ${idx === currentIndex
                      ? 'border-primary bg-primary/50'
                      : 'border-foreground/40 hover:border-foreground/70 bg-transparent'}`}
                />
              ))}
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="western-card p-8 max-w-4xl mx-auto"
              style={{ background: `var(--featured-server-card, var(--card))` }}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl font-bold text-foreground">{currentServer.name}</h3>
                    <div className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${
                        currentServer.isOnline ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className={`text-sm ${
                        currentServer.isOnline ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {currentServer.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{currentServer.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                      {currentServer.gameType.toUpperCase()}
                    </Badge>
                    {currentServer.isPublic && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        Public
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Join Server
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-primary/20 text-primary hover:bg-primary/10"
                      onClick={async () => {
                        const serverAddress = `${currentServer.ip}:${currentServer.port}`
                        try {
                          await navigator.clipboard.writeText(serverAddress)
                          setShowCopyToast(true)
                          setTimeout(() => setShowCopyToast(false), 2000)
                        } catch (error) {
                          console.error('Failed to copy to clipboard:', error)
                        }
                      }}
                    >
                      Copy IP
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span>Players</span>
                    </div>
                    <span className="font-semibold">
                      <span className={currentServer.playerCount > 0 ? 'text-green-400' : 'text-muted-foreground'}>
                        {isLoading ? '...' : currentServer.playerCount}
                      </span>
                      <span className="text-muted-foreground">/{currentServer.maxPlayers}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-5 h-5 text-primary" />
                      <span>Ping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${color}`}>
                        {isLoading ? '...' : label}
                      </span>
                      {userLocation && !isLoading && (
                        <span className="text-xs text-muted-foreground">
                          (geo-based)
                        </span>
                      )}
                      {isLoading && (
                        <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span>Server</span>
                    </div>
                    <span className="font-semibold">{currentServer.ip}:{currentServer.port}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>Last Checked</span>
                    </div>
                    <span className="font-semibold text-green-400">
                      {new Date(currentServer.lastChecked).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
