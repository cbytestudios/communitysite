"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2, Shield, Crown, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <Crown className="h-4 w-4" />
      case "Moderator":
        return <Shield className="h-4 w-4" />
      default:
        return null
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-amber-gold text-charcoal"
      case "Moderator":
        return "bg-electric-blue text-charcoal"
      default:
        return "bg-sage-green text-charcoal"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-sage-green text-charcoal"
      case "Banned":
        return "bg-rust-red text-white"
      default:
        return "bg-sage-green/50 text-sage-green"
    }
  }

  return (
    <Card className="bg-charcoal-light/80 border-amber-gold/20">
      <CardHeader>
        <CardTitle className="text-amber-gold">User Management</CardTitle>
        <CardDescription className="text-sage-green/80">Manage community members and their permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-sage-green/60" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-charcoal/50 border-amber-gold/30 text-sage-green"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="border-amber-gold/30 text-amber-gold hover:bg-amber-gold/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-amber-gold mb-2" />
              <p className="text-sage-green/60">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sage-green/60">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-charcoal/50 rounded-lg border border-amber-gold/10"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-gold to-amber-gold/60 rounded-full flex items-center justify-center">
                  <span className="text-charcoal font-semibold">{user.username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sage-green">{user.username}</h4>
                    {user.discordId && <Shield className="h-4 w-4 text-electric-blue" />}
                  </div>
                  <p className="text-sage-green/60 text-sm">{user.email || 'Discord User'}</p>
                  <p className="text-sage-green/40 text-xs">
                    Joined {new Date(user.createdAt).toLocaleDateString()} • 
                    {user.isDiscordConnected ? ' Discord Connected' : ' Email User'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className={user.isDiscordConnected ? "bg-electric-blue text-charcoal" : "bg-sage-green text-charcoal"}>
                  {user.isDiscordConnected ? "Discord" : "Email"}
                </Badge>
                <Badge className={user.isEmailVerified || user.isDiscordConnected ? "bg-sage-green text-charcoal" : "bg-amber-gold text-charcoal"}>
                  {user.isEmailVerified || user.isDiscordConnected ? "Verified" : "Unverified"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rust-red/60 hover:text-rust-red hover:bg-rust-red/10"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to permanently delete user ${user.username}? This action cannot be undone and will remove them from the database.`)) {
                      try {
                        const response = await fetch('/api/admin/users', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: user._id })
                        })
                        if (response.ok) {
                          await fetchUsers() // Refresh the list
                        } else {
                          alert('Failed to delete user')
                        }
                      } catch (error) {
                        console.error('Error deleting user:', error)
                        alert('Failed to delete user')
                      }
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
