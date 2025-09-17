"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Clock, MapPin, Play, Star, Shield, Zap, Globe, MessageCircle } from "lucide-react"

interface Server {
  id: number
  name: string
  description: string
  players: number
  maxPlayers: number
  ping: number
  location: string
  gameMode: string
  tags: string[]
  uptime: string
  version: string
  website?: string
  discord?: string
  featured: boolean
  whitelist: boolean
  lastUpdate: Date
}

interface ServerDetailModalProps {
  server: Server | null
  isOpen: boolean
  onClose: () => void
}

export function ServerDetailModal({ server, isOpen, onClose }: ServerDetailModalProps) {
  if (!server) return null

  const getPingColor = (ping: number) => {
    if (ping < 50) return "text-green-400"
    if (ping < 100) return "text-yellow-400"
    return "text-red-400"
  }

  const getPlayerColor = (players: number, maxPlayers: number) => {
    const ratio = players / maxPlayers
    if (ratio < 0.5) return "text-green-400"
    if (ratio < 0.8) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto western-card">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              {server.name}
              {server.featured && (
                <Badge className="bg-secondary text-secondary-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {server.whitelist && (
                <Badge variant="outline" className="border-primary text-primary">
                  <Shield className="w-3 h-3 mr-1" />
                  Whitelist
                </Badge>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Server Status */}
          <Card className="p-6 bg-muted/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold">
                  <span className={getPlayerColor(server.players, server.maxPlayers)}>{server.players}</span>
                  <span className="text-muted-foreground">/{server.maxPlayers}</span>
                </div>
                <div className="text-sm text-muted-foreground">Players Online</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className={`text-2xl font-bold ${getPingColor(server.ping)}`}>{server.ping}ms</div>
                <div className="text-sm text-muted-foreground">Ping</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-green-400">{server.uptime}</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{server.location}</div>
                <div className="text-sm text-muted-foreground">Location</div>
              </div>
            </div>
          </Card>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">About This Server</h3>
            <p className="text-muted-foreground leading-relaxed">{server.description}</p>
          </div>

          {/* Server Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Server Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Game Mode</span>
                  <Badge variant="secondary">{server.gameMode}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="text-foreground">{server.version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="text-foreground">{server.lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Server Tags</h3>
              <div className="flex flex-wrap gap-2">
                {server.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-accent/20 text-accent-foreground">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Links */}
          {(server.website || server.discord) && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Links</h3>
              <div className="flex gap-3">
                {server.website && (
                  <Button
                    variant="outline"
                    className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </Button>
                )}
                {server.discord && (
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Discord
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1">
              <Play className="w-4 h-4 mr-2" />
              Join Server
            </Button>
            <Button
              variant="outline"
              className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
            >
              <Star className="w-4 h-4 mr-2" />
              Add to Favorites
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
