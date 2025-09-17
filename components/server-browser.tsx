"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Clock, MapPin, Search, Filter, RefreshCw, Play, Star, Shield, Zap, Server as ServerIcon } from "lucide-react"

interface Server {
  _id: string
  name: string
  description: string
  ip: string
  port: number
  gameType: "roleplay" | "survival" | "minecraft" | "rust" | "gmod" | "csgo" | "other"
  isPublic: boolean
  isOnline: boolean
  playerCount: number
  maxPlayers: number
  ping: number
  lastChecked: string
  createdAt: string
}

export function ServerBrowser() {
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGameType, setSelectedGameType] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchServers()
    const interval = setInterval(fetchServers, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchServers = async () => {
    try {
      const response = await fetch("/api/servers/public")
      if (response.ok) {
        const data = await response.json()
        setServers(data)
      }
    } catch (error) {
      console.error("Failed to fetch servers:", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchServers()
  }

  const filteredServers = useMemo(() => {
    return servers.filter((server) => {
      const matchesSearch =
        server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        server.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesGameType = selectedGameType === "all" || server.gameType === selectedGameType

      return matchesSearch && matchesGameType
    })
  }, [servers, searchTerm, selectedGameType])

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? "bg-green-500" : "bg-red-500"
  }

  const getPingColor = (ping: number) => {
    if (ping < 50) return "text-green-400"
    if (ping < 100) return "text-yellow-400"
    return "text-red-400"
  }

  const copyServerAddress = (server: Server) => {
    const address = `${server.ip}:${server.port}`
    navigator.clipboard.writeText(address)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search servers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedGameType} onValueChange={setSelectedGameType}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Game Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="roleplay">Roleplay</SelectItem>
              <SelectItem value="survival">Survival</SelectItem>
              <SelectItem value="minecraft">Minecraft</SelectItem>
              <SelectItem value="rust">Rust</SelectItem>
              <SelectItem value="cs2">CS2</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="border-amber-gold/30 text-amber-gold hover:bg-amber-gold/10"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {filteredServers.length === 0 ? (
        <Card className="bg-charcoal-light/80 border-amber-gold/20 p-12">
          <div className="text-center">
            <ServerIcon className="h-12 w-12 text-amber-gold/50 mx-auto mb-4" />
            <h3 className="text-xl font-rye text-amber-gold mb-2">No Servers Found</h3>
            <p className="text-sage-green/70">
              {searchTerm || selectedGameType !== "all" 
                ? "Try adjusting your search filters" 
                : "No public servers are currently available"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredServers.map((server, index) => (
              <motion.div
                key={server._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="bg-card/80 border-border hover:border-primary/40 transition-all duration-300 group">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(server.isOnline)}`} />
                          <h3 className="text-xl font-[var(--font-display)] text-foreground group-hover:text-primary transition-colors">
                            {server.name}
                          </h3>
                          <Badge variant="secondary">
                            {server.gameType.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {server.description || "No description available"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-foreground text-sm">
                          {server.playerCount}/{server.maxPlayers}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className={`h-4 w-4 text-primary`} />
                        <span className={`text-sm ${getPingColor(server.ping)}`}>
                          {server.ping}ms
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ServerIcon className="h-4 w-4 text-primary" />
                        <span className="text-foreground text-sm font-mono">
                          {server.ip}:{server.port}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(server.isOnline)}`} />
                        <span className="text-foreground text-sm">
                          {server.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Last updated: {new Date(server.lastChecked).toLocaleTimeString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyServerAddress(server)}
                        >
                          Copy Address
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          disabled={!server.isOnline}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="text-center text-sage-green/60 text-sm">
        Showing {filteredServers.length} of {servers.length} servers
      </div>
    </div>
  )
}