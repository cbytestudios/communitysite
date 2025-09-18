"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Server, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star,
  StarOff,
  Activity,
  Users,
  Wifi,
  WifiOff,
  Settings,
  Save,
  X
} from "lucide-react"
import { toast } from "sonner"

interface GameServer {
  id: string
  name: string
  description: string
  ip: string
  port: number
  queryPort?: number
  gameType: string
  gameVersion: string
  connectUrl: string
  serverImage: string
  tags: string[]
  isPublic: boolean
  isFeatured: boolean
  isOnline: boolean
  playerCount: number
  maxPlayers: number
  ping: number
  uptime: number
  lastChecked: Date
  serverInfo: {
    map: string
    gameMode: string
    website: string
    discord: string
    rules: string[]
    mods: Array<{
      name: string
      version: string
      required: boolean
    }>
  }
  stats: {
    totalConnections: number
    peakPlayers: number
    averagePlaytime: number
    lastPeakDate: Date
  }
  adminSettings: {
    autoUpdate: boolean
    queryInterval: number
    alertsEnabled: boolean
    maintenanceMode: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const gameTypes = [
  "fivem", "redm", "minecraft", "rust", "gmod", "csgo", "cs2",
  "valorant", "apex", "cod", "battlefield", "ark", "7dtd",
  "terraria", "satisfactory", "valheim", "palworld", "other"
]

export function ServerManagementEnhanced() {
  const [servers, setServers] = useState<GameServer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingServer, setEditingServer] = useState<GameServer | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ip: "",
    port: 30120,
    queryPort: null as number | null,
    gameType: "other",
    gameVersion: "",
    connectUrl: "",
    serverImage: "",
    tags: [] as string[],
    isPublic: true,
    isFeatured: false,
    maxPlayers: 32,
    serverInfo: {
      map: "",
      gameMode: "",
      website: "",
      discord: "",
      rules: [] as string[],
      mods: [] as Array<{ name: string; version: string; required: boolean }>
    },
    adminSettings: {
      autoUpdate: true,
      queryInterval: 60,
      alertsEnabled: true,
      maintenanceMode: false
    }
  })

  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    try {
      const response = await fetch("/api/admin/servers")
      if (response.ok) {
        const data = await response.json()
        setServers(data)
      } else {
        toast.error("Failed to fetch servers")
      }
    } catch (error) {
      toast.error("Failed to fetch servers")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("Form submitted with data:", formData)
    
    try {
      const url = editingServer 
        ? `/api/admin/servers/${editingServer.id}`
        : "/api/admin/servers"
      
      const method = editingServer ? "PUT" : "POST"
      
      console.log("Making request to:", url, "with method:", method)
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      console.log("Response status:", response.status)
      
      if (response.ok) {
        toast.success(editingServer ? "Server updated successfully!" : "Server created successfully!")
        setIsDialogOpen(false)
        resetForm()
        fetchServers()
      } else {
        const data = await response.json()
        console.error("Error response:", data)
        toast.error(data.error || "Failed to save server")
      }
    } catch (error) {
      console.error("Request failed:", error)
      toast.error("Failed to save server")
    }
  }

  const handleEdit = (server: GameServer) => {
    setEditingServer(server)
    setFormData({
      name: server.name,
      description: server.description,
      ip: server.ip,
      port: server.port,
      queryPort: server.queryPort || null,
      gameType: server.gameType,
      gameVersion: server.gameVersion || "",
      connectUrl: server.connectUrl || "",
      serverImage: server.serverImage || "",
      tags: server.tags || [],
      isPublic: server.isPublic,
      isFeatured: server.isFeatured,
      maxPlayers: server.maxPlayers,
      serverInfo: {
        map: server.serverInfo?.map || "",
        gameMode: server.serverInfo?.gameMode || "",
        website: server.serverInfo?.website || "",
        discord: server.serverInfo?.discord || "",
        rules: server.serverInfo?.rules || [],
        mods: server.serverInfo?.mods || []
      },
      adminSettings: {
        autoUpdate: server.adminSettings?.autoUpdate ?? true,
        queryInterval: server.adminSettings?.queryInterval || 60,
        alertsEnabled: server.adminSettings?.alertsEnabled ?? true,
        maintenanceMode: server.adminSettings?.maintenanceMode || false
      }
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (serverId: string) => {
    if (!confirm("Are you sure you want to delete this server?")) return

    try {
      const response = await fetch(`/api/admin/servers/${serverId}`, {
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

  const toggleVisibility = async (serverId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/admin/servers/${serverId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic })
      })

      if (response.ok) {
        toast.success(`Server ${!isPublic ? 'made public' : 'made private'}`)
        fetchServers()
      } else {
        toast.error("Failed to update server visibility")
      }
    } catch (error) {
      toast.error("Failed to update server visibility")
    }
  }

  const toggleFeatured = async (serverId: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/servers/${serverId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured })
      })

      if (response.ok) {
        toast.success(`Server ${!isFeatured ? 'featured' : 'unfeatured'}`)
        fetchServers()
      } else {
        toast.error("Failed to update server featured status")
      }
    } catch (error) {
      toast.error("Failed to update server featured status")
    }
  }

  const resetForm = () => {
    setEditingServer(null)
    setFormData({
      name: "",
      description: "",
      ip: "",
      port: 30120,
      queryPort: null,
      gameType: "other",
      gameVersion: "",
      connectUrl: "",
      serverImage: "",
      tags: [],
      isPublic: true,
      isFeatured: false,
      maxPlayers: 32,
      serverInfo: {
        map: "",
        gameMode: "",
        website: "",
        discord: "",
        rules: [],
        mods: []
      },
      adminSettings: {
        autoUpdate: true,
        queryInterval: 60,
        alertsEnabled: true,
        maintenanceMode: false
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-rye text-amber-gold">Server Management</h2>
          <p className="text-sage-green/80">Manage your game servers</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-amber-gold hover:bg-amber-gold/90 text-charcoal"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Server
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-charcoal-light/90 border-amber-gold/20 text-sage-green">
            <DialogHeader>
              <DialogTitle className="text-primary">
                {editingServer ? "Edit Server" : "Add New Server"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Configure your game server settings
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 bg-muted border border-border">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="connection">Connection</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">Server Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-input border-border text-foreground"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gameType" className="text-foreground">Game Type *</Label>
                      <Select value={formData.gameType} onValueChange={(value) => setFormData({ ...formData, gameType: value })}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {gameTypes.map((type) => (
                            <SelectItem key={type} value={type} className="text-popover-foreground">
                              {type.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-foreground">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-input border-border text-foreground"
                      rows={3}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="connection" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ip" className="text-foreground">IP Address *</Label>
                      <Input
                        id="ip"
                        value={formData.ip}
                        onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                        className="bg-input border-border text-foreground"
                        placeholder="127.0.0.1"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="port" className="text-foreground">Port *</Label>
                      <Input
                        id="port"
                        type="number"
                        value={formData.port}
                        onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                        className="bg-input border-border text-foreground"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxPlayers" className="text-foreground">Max Players</Label>
                      <Input
                        id="maxPlayers"
                        type="number"
                        value={formData.maxPlayers}
                        onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="connectUrl" className="text-foreground">Connect URL</Label>
                    <Input
                      id="connectUrl"
                      value={formData.connectUrl}
                      onChange={(e) => setFormData({ ...formData, connectUrl: e.target.value })}
                      className="bg-input border-border text-foreground"
                      placeholder="fivem://connect/127.0.0.1:30120"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-amber-gold font-semibold">Visibility</h4>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="isPublic" className="text-sage-green">Public Server</Label>
                        <Switch
                          id="isPublic"
                          checked={formData.isPublic}
                          onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="isFeatured" className="text-sage-green">Featured Server</Label>
                        <Switch
                          id="isFeatured"
                          checked={formData.isFeatured}
                          onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-amber-gold font-semibold">Admin Settings</h4>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="autoUpdate" className="text-sage-green">Auto Update</Label>
                        <Switch
                          id="autoUpdate"
                          checked={formData.adminSettings.autoUpdate}
                          onCheckedChange={(checked) => setFormData({ 
                            ...formData, 
                            adminSettings: { ...formData.adminSettings, autoUpdate: checked }
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="alertsEnabled" className="text-sage-green">Alerts Enabled</Label>
                        <Switch
                          id="alertsEnabled"
                          checked={formData.adminSettings.alertsEnabled}
                          onCheckedChange={(checked) => setFormData({ 
                            ...formData, 
                            adminSettings: { ...formData.adminSettings, alertsEnabled: checked }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gameVersion" className="text-foreground">Game Version</Label>
                      <Input
                        id="gameVersion"
                        value={formData.gameVersion}
                        onChange={(e) => setFormData({ ...formData, gameVersion: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="queryInterval" className="text-foreground">Query Interval (seconds)</Label>
                      <Input
                        id="queryInterval"
                        type="number"
                        value={formData.adminSettings.queryInterval}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          adminSettings: { ...formData.adminSettings, queryInterval: parseInt(e.target.value) }
                        })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="serverImage" className="text-foreground">Server Image URL</Label>
                    <Input
                      id="serverImage"
                      value={formData.serverImage}
                      onChange={(e) => setFormData({ ...formData, serverImage: e.target.value })}
                      className="bg-input border-border text-foreground"
                      placeholder="https://example.com/server-banner.jpg"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-border text-foreground hover:bg-accent"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingServer ? "Update Server" : "Create Server"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {servers.map((server) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="bg-charcoal-light/80 border-amber-gold/20 hover:border-amber-gold/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-amber-gold flex items-center gap-2">
                        {server.isFeatured && <Star className="w-4 h-4 fill-current" />}
                        {server.name}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {server.gameType.toUpperCase()} • {server.ip}:{server.port}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      {server.isOnline ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-500" />
                      )}
                      {server.isPublic ? (
                        <Eye className="w-4 h-4 text-blue-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-sage-green">
                      <Users className="w-4 h-4" />
                      {server.playerCount}/{server.maxPlayers}
                    </div>
                    <div className="flex items-center gap-2 text-sage-green">
                      <Activity className="w-4 h-4" />
                      {server.ping}ms
                    </div>
                  </div>
                  
                  {server.description && (
                    <p className="text-sage-green/80 text-sm line-clamp-2">
                      {server.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      // Normalize tags: support string (comma-separated) or array
                      const normalizeTags = (tags: unknown): string[] => {
                        if (Array.isArray(tags)) {
                          return tags.map((t) => String(t).trim()).filter(Boolean)
                        }
                        if (typeof tags === 'string') {
                          return tags.split(',').map((t) => t.trim()).filter(Boolean)
                        }
                        return []
                      }

                      const tagList = normalizeTags(server.tags)

                      return tagList.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={`${server.id}-tag-${index}-${tag}`} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                    })()}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleVisibility(server.id, server.isPublic)}
                        className="border-border text-foreground hover:bg-accent"
                      >
                        {server.isPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleFeatured(server.id, server.isFeatured)}
                        className="border-border text-foreground hover:bg-accent"
                      >
                        {server.isFeatured ? <Star className="w-3 h-3 fill-current" /> : <StarOff className="w-3 h-3" />}
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(server)}
                        className="border-border text-foreground hover:bg-accent"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(server.id)}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      {!isLoading && servers.length === 0 && (
        <Card className="bg-card/80 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Server className="w-12 h-12 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No Servers Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by adding your first game server
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Server
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}