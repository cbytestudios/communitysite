"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, Settings, Users, Zap, Trash2, RefreshCw, Plus } from "lucide-react"
import { motion } from "framer-motion"

export function ServerManagement() {
  const [servers, setServers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/admin/servers')
      const data = await response.json()
      setServers(data.servers || [])
    } catch (error) {
      console.error('Failed to fetch servers:', error)
      // Fallback to mock data if API fails
      setServers([
        {
          id: 1,
          name: "Wild West RP",
          status: "Online",
          players: 89,
          maxPlayers: 100,
          uptime: "99.8%",
          cpu: 45,
          memory: 67,
          location: "US East",
          ip: "173.208.177.138",
          port: "30126"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServers()
  }, [])

  const removeServer = async (serverId: number, serverName: string) => {
    if (confirm(`Are you sure you want to remove server "${serverName}"? This will remove it from the admin dashboard.`)) {
      try {
        const response = await fetch('/api/admin/servers', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: serverId })
        })
        if (response.ok) {
          await fetchServers() // Refresh the list
        } else {
          alert('Failed to remove server')
        }
      } catch (error) {
        console.error('Error removing server:', error)
        alert('Failed to remove server')
      }
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Online":
        return "bg-sage-green text-charcoal"
      case "Maintenance":
        return "bg-amber-gold text-charcoal"
      case "Offline":
        return "bg-rust-red text-white"
      default:
        return "bg-sage-green/50 text-sage-green"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Online":
        return <Zap className="h-4 w-4" />
      case "Maintenance":
        return <Settings className="h-4 w-4" />
      default:
        return <Pause className="h-4 w-4" />
    }
  }

  return (
    <Card className="bg-charcoal-light/80 border-amber-gold/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-amber-gold">Server Management</CardTitle>
            <CardDescription className="text-sage-green/80">Monitor and control your RedM servers</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchServers}
              disabled={loading}
              className="border-amber-gold/30 text-amber-gold hover:bg-amber-gold/10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-sage-green/30 text-sage-green hover:bg-sage-green/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Server
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {servers.map((server, index) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 bg-charcoal/50 rounded-lg border border-amber-gold/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-sage-green">{server.name}</h3>
                  <Badge className={`${getStatusColor(server.status)} flex items-center gap-1`}>
                    {getStatusIcon(server.status)}
                    {server.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-sage-green/30 text-sage-green hover:bg-sage-green/10 bg-transparent"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-gold/30 text-amber-gold hover:bg-amber-gold/10 bg-transparent"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Restart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-rust-red/30 text-rust-red hover:bg-rust-red/10 bg-transparent"
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Stop
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeServer(server.id, server.name)}
                    className="border-rust-red/30 text-rust-red hover:bg-rust-red/10 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-electric-blue" />
                  <span className="text-sage-green/80 text-sm">
                    {server.players}/{server.maxPlayers} players
                  </span>
                </div>
                <div className="text-sage-green/80 text-sm">
                  Uptime: <span className="text-sage-green font-semibold">{server.uptime}</span>
                </div>
                <div className="text-sage-green/80 text-sm">
                  Location: <span className="text-sage-green font-semibold">{server.location}</span>
                </div>
                <div className="text-sage-green/80 text-sm">
                  Server ID: <span className="text-sage-green font-semibold">#{server.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-sage-green/80">Players</span>
                    <span className="text-sage-green">{Math.round((server.players / server.maxPlayers) * 100)}%</span>
                  </div>
                  <Progress value={(server.players / server.maxPlayers) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-sage-green/80">CPU Usage</span>
                    <span className="text-sage-green">{server.cpu}%</span>
                  </div>
                  <Progress value={server.cpu} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-sage-green/80">Memory</span>
                    <span className="text-sage-green">{server.memory}%</span>
                  </div>
                  <Progress value={server.memory} className="h-2" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
