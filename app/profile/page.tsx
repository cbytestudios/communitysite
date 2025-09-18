"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/session-provider"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Calendar, Link as LinkIcon, Check, X, Camera, Trash2 } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [profilePictureUrl, setProfilePictureUrl] = useState("")
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false)
  const [pictureError, setPictureError] = useState("")
  const [discordEnabled, setDiscordEnabled] = useState(false)

  // Check if Discord integration is enabled
  useEffect(() => {
    const checkDiscordIntegration = async () => {
      try {
        const response = await fetch('/api/website-settings')
        if (response.ok) {
          const data = await response.json()
          setDiscordEnabled(data.integrations?.discord?.enabled || false)
        }
      } catch (error) {
        console.error('Failed to check Discord integration:', error)
        setDiscordEnabled(false)
      }
    }

    if (user) {
      checkDiscordIntegration()
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal flex items-center justify-center">
        <div className="text-sage-green">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal flex items-center justify-center p-4">
        <Card className="bg-charcoal-light/80 backdrop-blur-sm border-amber-gold/20 max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-rye text-amber-gold">Access Denied</CardTitle>
            <CardDescription className="text-sage-green">
              You need to be signed in to view your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-amber-gold to-amber-gold/80 hover:from-amber-gold/90 hover:to-amber-gold/70 text-charcoal font-semibold">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Map Prisma user to the UI shape we expect without changing the DB schema here.
  const uiUser = {
    username: user?.username ?? null,
    email: user?.email ?? null,
    profilePicture: user?.profilePicture ?? null,
    // these discord-related fields may not exist on the Prisma User type; read defensively
    isDiscordConnected: (user as any)?.isDiscordConnected ?? false,
    discordAvatar: (user as any)?.discordAvatar ?? null,
    discordUsername: (user as any)?.discordUsername ?? null,
  }

  const handleConnectDiscord = async () => {
    setIsConnecting(true)
    try {
      // Redirect to a backend endpoint that will handle Discord OAuth (to be implemented)
      if (typeof window !== 'undefined') {
        window.location.href = '/api/discord/connect'
      }
    } catch (error) {
      console.error('Discord connection error:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnectDiscord = async () => {
    setIsDisconnecting(true)
    try {
      const response = await fetch('/api/user/disconnect-discord', {
        method: 'POST',
      })
      
      if (response.ok) {
        // Refresh user data - you might need to implement this or remove these lines
      }
    } catch (error) {
      console.error('Discord disconnection error:', error)
    } finally {
      setIsDisconnecting(false)
    }
  }

  const handleUpdateProfilePicture = async () => {
    if (!profilePictureUrl.trim()) {
      setPictureError("Please enter a valid image URL")
      return
    }

    setIsUpdatingPicture(true)
    setPictureError("")

    try {
      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profilePicture: profilePictureUrl.trim()
        }),
      })

      if (response.ok) {
        // Refresh user data - you might need to implement this or remove these lines
        setProfilePictureUrl("")
      } else {
        const data = await response.json()
        setPictureError(data.error || 'Failed to update profile picture')
      }
    } catch (error) {
      setPictureError('Failed to update profile picture')
    } finally {
      setIsUpdatingPicture(false)
    }
  }

  const handleRemoveProfilePicture = async () => {
    setIsUpdatingPicture(true)
    setPictureError("")

    try {
      const response = await fetch('/api/user/profile-picture', {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh user data - you might need to implement this or remove these lines
      } else {
        const data = await response.json()
        setPictureError(data.error || 'Failed to remove profile picture')
      }
    } catch (error) {
      setPictureError('Failed to remove profile picture')
    } finally {
      setIsUpdatingPicture(false)
    }
  }

  // Get the current profile picture to display
  const getCurrentProfilePicture = () => {
    if (uiUser.isDiscordConnected && uiUser.discordAvatar) {
      return uiUser.discordAvatar
    }
    return uiUser.profilePicture
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal p-4">
      <div className="max-w-4xl mx-auto pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-charcoal-light/80 backdrop-blur-sm border-amber-gold/20">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={getCurrentProfilePicture() || undefined} 
                    alt={user?.username || "User"} 
                  />
                  <AvatarFallback className="bg-amber-gold text-charcoal text-xl font-bold">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-rye text-amber-gold">
                    {user?.username || "User"}
                  </CardTitle>
                  <CardDescription className="text-sage-green">
                    Member since {new Date().toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Account Information */}
              <div>
                <h3 className="text-lg font-semibold text-amber-gold mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-sage-green/60" />
                    <span className="text-sage-green">Username:</span>
                    <span className="text-sage-green font-medium">{user?.username}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-sage-green/60" />
                    <span className="text-sage-green">Email:</span>
                    <span className="text-sage-green font-medium">{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-sage-green/60" />
                    <span className="text-sage-green">Member since:</span>
                    <span className="text-sage-green font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-amber-gold/20" />

              {/* Profile Picture Management */}
              <div>
                <h3 className="text-lg font-semibold text-amber-gold mb-4 flex items-center">
                  <Camera className="mr-2 h-5 w-5" />
                  Profile Picture
                </h3>
                
                <div className="space-y-4">
                  {uiUser.isDiscordConnected && uiUser.discordAvatar && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sage-green text-sm mb-2">
                        <Check className="inline h-4 w-4 mr-1 text-blue-400" />
                        Currently using Discord profile picture
                      </p>
                      <p className="text-sage-green/70 text-xs">
                        Your Discord avatar is automatically synced. You can still set a custom picture below to override it.
                      </p>
                    </div>
                  )}
                  
                  {pictureError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                      <p className="text-red-400 text-sm">{pictureError}</p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <Label htmlFor="profilePicture" className="text-sage-green">
                      Profile Picture URL
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="profilePicture"
                        type="url"
                        placeholder="https://example.com/your-picture.jpg"
                        value={profilePictureUrl}
                        onChange={(e) => setProfilePictureUrl(e.target.value)}
                        className="bg-charcoal/50 border-amber-gold/30 text-sage-green placeholder:text-sage-green/50"
                      />
                      <Button
                        onClick={handleUpdateProfilePicture}
                        disabled={isUpdatingPicture || !profilePictureUrl.trim()}
                        className="bg-amber-gold hover:bg-amber-gold/90 text-charcoal"
                      >
                        {isUpdatingPicture ? "Updating..." : "Update"}
                      </Button>
                    </div>
                  </div>
                  
                  {(uiUser.profilePicture || (uiUser.isDiscordConnected && uiUser.discordAvatar)) && (
                    <Button
                      onClick={handleRemoveProfilePicture}
                      disabled={isUpdatingPicture}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isUpdatingPicture ? "Removing..." : "Remove Profile Picture"}
                    </Button>
                  )}
                </div>
              </div>

              <Separator className="bg-amber-gold/20" />

              {/* Discord Connection - Only show if Discord integration is enabled */}
              {discordEnabled && (
                <div>
                  <h3 className="text-lg font-semibold text-amber-gold mb-4 flex items-center">
                    <LinkIcon className="mr-2 h-5 w-5" />
                    Discord Connection
                  </h3>
                
                {uiUser.isDiscordConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-sage-green font-medium">Discord Connected</p>
                          <p className="text-sage-green/70 text-sm">
                            Connected as {uiUser.discordUsername}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                        Connected
                      </Badge>
                    </div>
                    
                    <Button
                      onClick={handleDisconnectDiscord}
                      disabled={isDisconnecting}
                      variant="destructive"
                      className="w-full"
                    >
                      {isDisconnecting ? "Disconnecting..." : "Disconnect Discord"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <X className="h-5 w-5 text-red-400" />
                        <div>
                          <p className="text-sage-green font-medium">Discord Not Connected</p>
                          <p className="text-sage-green/70 text-sm">
                            Connect your Discord account to access exclusive features
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                        Not Connected
                      </Badge>
                    </div>
                    
                    <Button
                      onClick={handleConnectDiscord}
                      disabled={isConnecting}
                      className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
                    >
                      {isConnecting ? "Connecting..." : "Connect Discord"}
                    </Button>
                  </div>
                )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}