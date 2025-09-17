"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Server, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Users, 
  Wifi,
  Save,
  X,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

interface GameServer {
  id: string
  name: string
  description: string
  ip: string
  port: number
  apiKey?: string
  isPublic: boolean
  isOnline: boolean
  playerCount: number
  maxPlayers: number
  ping: number
  gameType: "roleplay" | "survival" | "minecraft" | "rust" | "gmod" | "csgo" | "other"
  createdAt: string
  updatedAt: string
}

export function ServerManagementNew() {
  const [servers, setServers] = useState<GameServer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingServer, setEditingServer] = useState<GameServer | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ip: "",
    port: 30120,
    apiKey: "",
    gameType: "other" as "roleplay" | "survival" | "minecraft" | "rust" | "gmod" | "csgo" | "other",
    isPublic: true
  })

  useEffect(() => {
    fetchServers()
    const interval = setInterval(fetchServers, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchServers = async () => {
    try {
      const response = await fetch("/api/admin/servers")
      if (response.ok) {
        const data = await response.json()
        setServers(data)
      }
    } catch (error) {
      console.error("Failed to fetch servers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingServer ? `/api/admin/servers/${editingServer.id}` : "/api/admin/servers"
      const method = editingServer ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingServer ? "Server updated successfully!" : "Server created successfully!")
        resetForm()
        fetchServers()
      } else {
        toast.error("Failed to save server")
      }
    } catch (error) {
      toast.error("Failed to save server")
    }
  }

  const deleteServer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this server?")) return

    try {
      const response = await fetch(`/api/admin/servers/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Server deleted successfully!")
        fetchServers()
      } else {
        toast.error("Failed to delete server")
      }
    } catch (error) {
      toast.error("Failed to delete server")
    }
  }

  const toggleServerVisibility = async (id: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/admin/servers/${id}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic })
      })

      if (response.ok) {
        toast.success(`Server ${isPublic ? "made public" : "made private"}`)
        fetchServers()
      } else {
        toast.error("Failed to update server visibility")
      }
    } catch (error) {
      toast.error("Failed to update server visibility")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      ip: "",
      port: 30120,
      apiKey: "",
      gameType: "other",
      isPublic: true
    })
    setEditingServer(null)
    setShowAddForm(false)
  }

  const startEdit = (server: GameServer) => {
    setFormData({
      name: server.name,
      description: server.description,
      ip: server.ip,
      port: server.port,
      apiKey: server.apiKey || "",
      gameType: server.gameType,
      isPublic: server.isPublic
    })
    setEditingServer(server)
    setShowAddForm(true)
  }

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? "bg-green-500" : "bg-red-500"
  }

  const getPingColor = (ping: number) => {
    if (ping < 50) return "text-green-400"
    if (ping < 100) return "text-yellow-400"
    return "text-red-400"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-rye text-amber-gold">Server Management</h2>
          <p className="text-sage-green/80">Manage your game servers and their visibility</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-amber-gold hover:bg-amber-gold/90 text-charcoal"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Server
        </Button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold flex items-center justify-between">
                <span>{editingServer ? "Edit Server" : "Add New Server"}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  className="text-sage-green hover:text-amber-gold"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sage-green">Server Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gameType" className="text-sage-green">Game Type</Label>
                    <select
                      id="gameType"
                      value={formData.gameType}
                      onChange={(e) => setFormData({ ...formData, gameType: e.target.value as "roleplay" | "survival" | "minecraft" | "rust" | "gmod" | "csgo" | "other" })}
                      className="w-full px-3 py-2 bg-charcoal border border-amber-gold/30 rounded-md text-sage-green"
                      required
                    >
                      <option value="other">Other</option>
                      <option value="minecraft">Minecraft</option>
                      <option value="rust">Rust</option>
                      <option value="gmod">Garry's Mod</option>
                      <option value="csgo">CS:GO</option>
                      <option value="roleplay">Roleplay</option>
                      <option value="survival">Survival</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sage-green">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ip" className="text-sage-green">Server IP</Label>
                    <Input
                      id="ip"
                      value={formData.ip}
                      onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                      placeholder="127.0.0.1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port" className="text-sage-green">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      value={formData.port}
                      onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className="text-sage-green">API Key (Optional)</Label>
                    <Input
                      id="apiKey"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                      placeholder="For enhanced monitoring"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  />
                  <Label htmlFor="isPublic" className="text-sage-green">
                    Make server visible on front page
                  </Label>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="bg-amber-gold hover:bg-amber-gold/90 text-charcoal"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingServer ? "Update Server" : "Create Server"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="border-amber-gold/30 text-amber-gold hover:bg-amber-gold/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-6">
        {servers.length === 0 ? (
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Server className="w-12 h-12 text-amber-gold/50 mb-4" />
              <h3 className="text-xl font-rye text-amber-gold mb-2">No Servers Found</h3>
              <p className="text-sage-green/70 text-center mb-4">
                Create your first server to get started with server management.
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-amber-gold hover:bg-amber-gold/90 text-charcoal"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Server
              </Button>
            </CardContent>
          </Card>
        ) : (
          servers.map((server) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="bg-charcoal-light/80 border-amber-gold/20 hover:border-amber-gold/40 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(server.isOnline)}`} />
                      <div>
                        <CardTitle className="text-amber-gold flex items-center gap-2">
                          {server.name}
                          <Badge variant="secondary" className="bg-amber-gold/20 text-amber-gold border-amber-gold/30">
                            {server.gameType.toUpperCase()}
                          </Badge>
                          {!server.isPublic && (
                            <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-sage-green/80">
                          {server.description || "No description provided"}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleServerVisibility(server.id, !server.isPublic)}
                        className="text-sage-green hover:text-amber-gold"
                      >
                        {server.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(server)}
                        className="text-sage-green hover:text-amber-gold"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteServer(server.id)}
                        className="text-sage-green hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-amber-gold" />
                      <span className="text-sage-green text-sm">
                        {server.ip}:{server.port}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-gold" />
                      <span className="text-sage-green text-sm">
                        {server.playerCount}/{server.maxPlayers}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-amber-gold" />
                      <span className={`text-sm ${getPingColor(server.ping)}`}>
                        {server.ping}ms
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(server.isOnline)}`} />
                      <span className="text-sage-green text-sm">
                        {server.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                  
                  {server.isPublic && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <Eye className="w-4 h-4" />
                        This server is visible on the front page
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}