"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { User, BarChart3, Server, MessageSquare, Download } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from 'react'

export function AnalyticsDashboard() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const [serverStats, setServerStats] = useState<{ count: number; maxPlayers: number; serverName: string } | null>(null)
  const [gamePlayers, setGamePlayers] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setTotalUsers(data.total))
    fetch('/api/servers/public')
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const totalPlayers = data.reduce((sum: number, server: any) => sum + (server.playerCount || 0), 0)
          const totalMaxPlayers = data.reduce((sum: number, server: any) => sum + (server.maxPlayers || 0), 0)
          setServerStats({
            count: totalPlayers,
            maxPlayers: totalMaxPlayers,
            serverName: `${data.length} Server${data.length !== 1 ? 's' : ''}`
          })
        }
      })
      .catch(() => setServerStats(null))
    // For now, we'll leave game players empty until we implement game-specific APIs
    setGamePlayers([])
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <Card className="bg-charcoal-light/80 border-amber-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sage-green/80 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-sage-green">{totalUsers !== null ? totalUsers : '...'}</p>
              </div>
              <User className="h-8 w-8 text-electric-blue" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-charcoal-light/80 border-amber-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sage-green/80 text-sm font-medium">Active Players</p>
                <p className="text-2xl font-bold text-sage-green">
                  {serverStats ? `${serverStats.count} / ${serverStats.maxPlayers}` : '...'}
                </p>
                <p className="text-sage-green/60 text-sm">{serverStats?.serverName || ''}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-amber-gold" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-charcoal-light/80 border-amber-gold/20 mt-6">
        <CardHeader>
          <CardTitle className="text-amber-gold">Game Player Data</CardTitle>
          <CardDescription className="text-sage-green/80">Live data from game servers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sage-green">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">Server</th>
                  <th className="px-4 py-2 text-left">Game</th>
                  <th className="px-4 py-2 text-left">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {gamePlayers.map((player, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{player.username}</td>
                    <td className="px-4 py-2">{player.serverName}</td>
                    <td className="px-4 py-2">{player.gameType}</td>
                    <td className="px-4 py-2">{new Date(player.lastSeen).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {gamePlayers.length === 0 && <div className="text-sage-green/60 mt-4">No game player data available. Connect your game servers to see player statistics.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
