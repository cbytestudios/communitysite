"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Upload, 
  Save, 
  RefreshCw, 
  Globe, 
  Image as ImageIcon,
  Palette,
  Link,
  Download,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { toast } from "sonner"

interface WebsiteSettings {
  siteName: string
  siteDescription: string
  heroTitle: string
  heroDescription: string
  heroBackgroundImage: string
  themeMode?: 'dark' | 'light' | 'system'
  galleryImages: Array<{
    url: string
    caption?: string
    alt?: string
  }>
  socialLinks: {
    discord: string
    twitter: string
    youtube: string
    twitch: string
    steam: string
    facebook: string
  }
  contactEmail: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    featuredServerCard?: string
  }
  integrations: {
    discord: {
      enabled: boolean
      clientId: string
      clientSecret: string
      botToken: string
      guildId: string
    }
    steam: {
      enabled: boolean
      apiKey: string
    }
    google: {
      enabled: boolean
      clientId: string
      clientSecret: string
    }
  }
  emailSettings: {
    smtpHost: string
    smtpPort: number
    smtpUser: string
    smtpPassword: string
    fromEmail: string
    fromName: string
  }
  features: {
    userRegistration: boolean
    emailVerification: boolean
    serverListing: boolean
    communityForum: boolean
    eventCalendar: boolean
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string
    ogImage: string
  }
}

interface UpdateInfo {
  currentVersion: string
  latestVersion: string
  hasUpdate: boolean
  changelog: string[]
}

export function WebsiteSettings() {
  const [settings, setSettings] = useState<WebsiteSettings>({
    siteName: "Community Website",
    siteDescription: "A multi-game community platform",
    heroTitle: "Welcome to Our Gaming Community",
    heroDescription: "Join our multi-game community. Experience epic adventures, connect with players, and forge your legend across multiple gaming platforms.",
    heroBackgroundImage: "",
    themeMode: 'dark',
    galleryImages: [
      { url: "/gallery1.jpg", caption: "", alt: "" },
      { url: "/gallery2.jpg", caption: "", alt: "" },
      { url: "/gallery3.jpg", caption: "", alt: "" },
      { url: "/gallery4.jpg", caption: "", alt: "" }
    ],
    socialLinks: {
      discord: "",
      twitter: "",
      youtube: "",
      twitch: "",
      steam: "",
      facebook: ""
    },
    contactEmail: "",
    colors: {
      primary: "#FFC107",
      secondary: "#4FC3F7",
      accent: "#8BC34A",
      background: "#1A1A1A",
      surface: "#2D2D2D",
      text: "#FFFFFF",
      featuredServerCard: "#3a3a3c"
    },
    integrations: {
      discord: {
        enabled: false,
        clientId: "",
        clientSecret: "",
        botToken: "",
        guildId: ""
      },
      steam: {
        enabled: false,
        apiKey: ""
      },
      google: {
        enabled: false,
        clientId: "",
        clientSecret: ""
      }
    },
    emailSettings: {
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPassword: "",
      fromEmail: "",
      fromName: ""
    },
    features: {
      userRegistration: true,
      emailVerification: true,
      serverListing: true,
      communityForum: false,
      eventCalendar: false
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: "",
      ogImage: ""
    }
  })

  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    currentVersion: "1.0.0",
    latestVersion: "1.0.0",
    hasUpdate: false,
    changelog: []
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Auto-save: debounce writes when settings change
  const saveTimer = useRef<NodeJS.Timeout | null>(null)
  const isInitialLoad = useRef(true)

  useEffect(() => {
    fetchSettings()
    checkForUpdates()
  }, [])

  useEffect(() => {
    if (isInitialLoad.current) {
      // Skip auto-save immediately after initial fetch
      isInitialLoad.current = false
      return
    }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      // Fire-and-forget save, rely on API validation
      saveSettings()
    }, 600)
    // Cleanup on unmount
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [settings])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/website-settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    }
  }

  const checkForUpdates = async () => {
    try {
      const response = await fetch("/api/admin/check-updates")
      if (response.ok) {
        const data = await response.json()
        setUpdateInfo(data)
      }
    } catch (error) {
      console.error("Failed to check for updates:", error)
    }
  }

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/website-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success("Settings saved successfully!")
        // Notify public UI (e.g., Navigation) to refresh feature-based visibility immediately
        try {
          const detail = { features: settings.features }
          window.dispatchEvent(new CustomEvent('website-settings-updated', { detail }))
        } catch {}
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to save settings")
      }
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  const updateWebsite = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/admin/update-website", {
        method: "POST"
      })

      if (response.ok) {
        toast.success("Website updated successfully! Restarting...")
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      } else {
        toast.error("Failed to update website")
      }
    } catch (error) {
      toast.error("Failed to update website")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("image", file)

    try {
      const response = await fetch("/api/admin/upload-gallery-image", {
        method: "POST",
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        const newImages = [...settings.galleryImages]
        newImages[index] = { ...newImages[index], url: data.url }
        setSettings({ ...settings, galleryImages: newImages })
        toast.success("Image uploaded successfully!")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to upload image")
      }
    } catch (error) {
      toast.error("Failed to upload image")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-rye text-amber-gold">Website Settings</h2>
          <p className="text-sage-green/80">Customize your community website</p>
        </div>
        
        {updateInfo.hasUpdate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <Badge variant="secondary" className="bg-amber-gold/20 text-amber-gold border-amber-gold/30">
              <AlertCircle className="w-4 h-4 mr-1" />
              Update Available
            </Badge>
            <Button
              onClick={updateWebsite}
              disabled={isUpdating}
              className="bg-amber-gold hover:bg-amber-gold/90 text-charcoal"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Update Now
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 bg-charcoal-light/50 border border-amber-gold/20">
          <TabsTrigger value="general" className="data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="theme" className="data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal">
            <Palette className="w-4 h-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal">
            <Link className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="gallery" className="data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal">
            <ImageIcon className="w-4 h-4 mr-2" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal">
            <Link className="w-4 h-4 mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger value="updates" className="data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal">
            <RefreshCw className="w-4 h-4 mr-2" />
            Updates
          </TabsTrigger>
          <TabsTrigger value="features" className="data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal">
            <Settings className="w-4 h-4 mr-2" />
            Features
          </TabsTrigger>
        </TabsList>

        {/* Features tab */}
        <TabsContent value="features">
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Feature Flags
              </CardTitle>
              <CardDescription className="text-sage-green/80">
                Toggle built-in modules for your site. Changes auto-save.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg border border-amber-gold/20 bg-charcoal/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-sage-green">Server Listings</h3>
                      <p className="text-sage-green/60 text-sm">Enable public server listings and browser.</p>
                    </div>
                    <input
                      type="checkbox"
                      id="feature-server-listing"
                      checked={settings.features.serverListing}
                      onChange={(e) => setSettings({ ...settings, features: { ...settings.features, serverListing: e.target.checked } })}
                      className="w-4 h-4 text-amber-gold bg-charcoal border-amber-gold/30 rounded focus:ring-amber-gold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-amber-gold/20 bg-charcoal/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-sage-green">Community Forum</h3>
                      <p className="text-sage-green/60 text-sm">Enable a forum with categories and permissions.</p>
                    </div>
                    <input
                      type="checkbox"
                      id="feature-forum"
                      checked={settings.features.communityForum}
                      onChange={(e) => setSettings({ ...settings, features: { ...settings.features, communityForum: e.target.checked } })}
                      className="w-4 h-4 text-amber-gold bg-charcoal border-amber-gold/30 rounded focus:ring-amber-gold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-amber-gold/20 bg-charcoal/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-sage-green">Event Calendar</h3>
                      <p className="text-sage-green/60 text-sm">Enable community events and scheduling.</p>
                    </div>
                    <input
                      type="checkbox"
                      id="feature-events"
                      checked={settings.features.eventCalendar}
                      onChange={(e) => setSettings({ ...settings, features: { ...settings.features, eventCalendar: e.target.checked } })}
                      className="w-4 h-4 text-amber-gold bg-charcoal border-amber-gold/30 rounded focus:ring-amber-gold"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme Settings
              </CardTitle>
              <CardDescription className="text-sage-green/80">
                Control color palette and theme mode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sage-green">Theme Mode</Label>
                <div className="flex gap-2">
                  {(['dark','light','system'] as const).map(mode => (
                    <Button
                      key={mode}
                      type="button"
                      variant={settings.themeMode === mode ? 'default' : 'outline'}
                      className={settings.themeMode === mode ? 'bg-secondary text-secondary-foreground' : 'border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground'}
                      onClick={() => setSettings({ ...settings, themeMode: mode })}
                    >
                      {mode[0].toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-sage-green">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input id="primaryColor" type="color" value={settings.colors.primary} onChange={(e) => setSettings({ ...settings, colors: { ...settings.colors, primary: e.target.value } })} className="w-16 h-10 p-1 bg-charcoal border-amber-gold/30" />
                    <Input value={settings.colors.primary} onChange={(e) => setSettings({ ...settings, colors: { ...settings.colors, primary: e.target.value } })} className="bg-charcoal border-amber-gold/30 text-sage-green" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor" className="text-sage-green">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input id="secondaryColor" type="color" value={settings.colors.secondary} onChange={(e) => setSettings({ ...settings, colors: { ...settings.colors, secondary: e.target.value } })} className="w-16 h-10 p-1 bg-charcoal border-amber-gold/30" />
                    <Input value={settings.colors.secondary} onChange={(e) => setSettings({ ...settings, colors: { ...settings.colors, secondary: e.target.value } })} className="bg-charcoal border-amber-gold/30 text-sage-green" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor" className="text-sage-green">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input id="accentColor" type="color" value={settings.colors.accent} onChange={(e) => setSettings({ ...settings, colors: { ...settings.colors, accent: e.target.value } })} className="w-16 h-10 p-1 bg-charcoal border-amber-gold/30" />
                    <Input value={settings.colors.accent} onChange={(e) => setSettings({ ...settings, colors: { ...settings.colors, accent: e.target.value } })} className="bg-charcoal border-amber-gold/30 text-sage-green" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor" className="text-sage-green">Background</Label>
                  <div className="flex gap-2">
                    <Input id="backgroundColor" type="color" value={settings.colors.background} onChange={(e) => setSettings({ ...settings, colors: { ...settings.colors, background: e.target.value } })} className="w-16 h-10 p-1 bg-charcoal border-amber-gold/30" />
                    <Input value={settings.colors.background} onChange={(e) => setSettings({ ...settings, colors: { ...settings.colors, background: e.target.value } })} className="bg-charcoal border-amber-gold/30 text-sage-green" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surfaceColor" className="text-sage-green">Surface</Label>
                  <div className="flex gap-2">
                    <Input id="surfaceColor" type="color" value={settings.colors.surface} onChange={(e) => setSettings({ ...settings, colors: { ...settings.colors, surface: e.target.value } })} className="w-16 h-10 p-1 bg-charcoal border-amber-gold/30" />
                    <Input value={settings.colors.surface} onChange={(e) => setSettings({ ...settings, colors: { ...settings.colors, surface: e.target.value } })} className="bg-charcoal border-amber-gold/30 text-sage-green" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textColor" className="text-sage-green">Text</Label>
                  <div className="flex gap-2">
                    <Input id="textColor" type="color" value={settings.colors.text} onChange={(e) => setSettings({ ...settings, colors: { ...settings.colors, text: e.target.value } })} className="w-16 h-10 p-1 bg-charcoal border-amber-gold/30" />
                    <Input value={settings.colors.text} onChange={(e) => setSettings({ ...settings, colors: { ...settings.colors, text: e.target.value } })} className="bg-charcoal border-amber-gold/30 text-sage-green" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription className="text-sage-green/80">
                Configure basic website information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-sage-green">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-sage-green">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="heroTitle" className="text-sage-green">Hero Title</Label>
                <Input
                  id="heroTitle"
                  value={settings.heroTitle}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                  className="bg-charcoal border-amber-gold/30 text-sage-green"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="heroDescription" className="text-sage-green">Hero Description</Label>
                <Textarea
                  id="heroDescription"
                  value={settings.heroDescription}
                  onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                  className="bg-charcoal border-amber-gold/30 text-sage-green min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-sage-green">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={(settings as any).primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value } as any)}
                      className="w-16 h-10 p-1 bg-charcoal border-amber-gold/30"
                    />
                    <Input
                      value={(settings as any).primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value } as any)}
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor" className="text-sage-green">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={(settings as any).secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value } as any)}       
                      className="w-16 h-10 p-1 bg-charcoal border-amber-gold/30"
                    />
                    <Input
                      value={(settings as any).secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value } as any)}       
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold flex items-center gap-2">
                <Link className="w-5 h-5" />
                Integration Settings
              </CardTitle>
              <CardDescription className="text-sage-green/80">
                Configure third-party integrations and services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Discord Integration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-sage-green">Discord Integration</h3>
                    <p className="text-sage-green/60 text-sm">Enable Discord login and server integration</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="discord-enabled"
                      checked={settings.integrations.discord.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        integrations: {
                          ...settings.integrations,
                          discord: {
                            ...settings.integrations.discord,
                            enabled: e.target.checked
                          }
                        }
                      })}
                      className="w-4 h-4 text-amber-gold bg-charcoal border-amber-gold/30 rounded focus:ring-amber-gold"
                    />
                    <Label htmlFor="discord-enabled" className="text-sage-green">
                      {settings.integrations.discord.enabled ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </div>

                {settings.integrations.discord.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-charcoal/50 rounded-lg border border-amber-gold/20">
                    <div className="space-y-2">
                      <Label htmlFor="discord-client-id" className="text-sage-green">Client ID</Label>
                      <Input
                        id="discord-client-id"
                        value={settings.integrations.discord.clientId}
                        onChange={(e) => setSettings({
                          ...settings,
                          integrations: {
                            ...settings.integrations,
                            discord: {
                              ...settings.integrations.discord,
                              clientId: e.target.value
                            }
                          }
                        })}
                        className="bg-charcoal border-amber-gold/30 text-sage-green"
                        placeholder="Your Discord App Client ID"
                      />
                      <p className="text-xs text-sage-green/70 mt-1">
                        After enabling Discord, add this Redirect URI in your Discord Developer Portal:
                        <br />
                        <code className="text-amber-gold">https://YOUR_DOMAIN/api/discord/callback</code> or <code className="text-amber-gold">http://localhost:3000/api/discord/callback</code>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discord-client-secret" className="text-sage-green">Client Secret</Label>
                      <Input
                        id="discord-client-secret"
                        type="password"
                        value={settings.integrations.discord.clientSecret}
                        onChange={(e) => setSettings({
                          ...settings,
                          integrations: {
                            ...settings.integrations,
                            discord: {
                              ...settings.integrations.discord,
                              clientSecret: e.target.value
                            }
                          }
                        })}
                        className="bg-charcoal border-amber-gold/30 text-sage-green"
                        placeholder="Your Discord App Client Secret"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discord-bot-token" className="text-sage-green">Bot Token</Label>
                      <Input
                        id="discord-bot-token"
                        type="password"
                        value={settings.integrations.discord.botToken}
                        onChange={(e) => setSettings({
                          ...settings,
                          integrations: {
                            ...settings.integrations,
                            discord: {
                              ...settings.integrations.discord,
                              botToken: e.target.value
                            }
                          }
                        })}
                        className="bg-charcoal border-amber-gold/30 text-sage-green"
                        placeholder="Your Discord Bot Token"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discord-guild-id" className="text-sage-green">Guild ID</Label>
                      <Input
                        id="discord-guild-id"
                        value={settings.integrations.discord.guildId}
                        onChange={(e) => setSettings({
                          ...settings,
                          integrations: {
                            ...settings.integrations,
                            discord: {
                              ...settings.integrations.discord,
                              guildId: e.target.value
                            }
                          }
                        })}
                        className="bg-charcoal border-amber-gold/30 text-sage-green"
                        placeholder="Your Discord Server ID"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Steam Integration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-sage-green">Steam Integration</h3>
                    <p className="text-sage-green/60 text-sm">Enable Steam login and game server integration</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="steam-enabled"
                      checked={settings.integrations.steam.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        integrations: {
                          ...settings.integrations,
                          steam: {
                            ...settings.integrations.steam,
                            enabled: e.target.checked
                          }
                        }
                      })}
                      className="w-4 h-4 text-amber-gold bg-charcoal border-amber-gold/30 rounded focus:ring-amber-gold"
                    />
                    <Label htmlFor="steam-enabled" className="text-sage-green">
                      {settings.integrations.steam.enabled ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </div>

                {settings.integrations.steam.enabled && (
                  <div className="p-4 bg-charcoal/50 rounded-lg border border-amber-gold/20">
                    <div className="space-y-2">
                      <Label htmlFor="steam-api-key" className="text-sage-green">Steam API Key</Label>
                      <Input
                        id="steam-api-key"
                        type="password"
                        value={settings.integrations.steam.apiKey}
                        onChange={(e) => setSettings({
                          ...settings,
                          integrations: {
                            ...settings.integrations,
                            steam: {
                              ...settings.integrations.steam,
                              apiKey: e.target.value
                            }
                          }
                        })}
                        className="bg-charcoal border-amber-gold/30 text-sage-green"
                        placeholder="Your Steam Web API Key"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-amber-gold/20">
                <p className="text-sage-green/60 text-sm">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Integration settings are saved automatically when you update website settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Gallery Images
              </CardTitle>
              <CardDescription className="text-sage-green/80">
                Manage images used in the homepage hero background and gallery blocks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {settings.galleryImages.map((image, index) => (
                  <div key={index} className="space-y-3">
                    <Label className="text-sage-green">Image {index + 1}</Label>
                    <div className="relative group">
                      <div 
                        className="w-full h-32 bg-cover bg-center rounded-lg border-2 border-amber-gold/30"
                        style={{ backgroundImage: `url(${typeof image === 'string' ? image : image.url})` }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <label className="cursor-pointer">
                          <Upload className="w-8 h-8 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, index)}
                          />
                        </label>
                      </div>
                    </div>
                    <Input
                      value={typeof image === 'string' ? image : (image.url || '')}
                      onChange={(e) => {
                        const newImages = [...settings.galleryImages]
                        const prev = newImages[index] as any
                        newImages[index] = typeof prev === 'string' 
                          ? { url: e.target.value, caption: '', alt: '' }
                          : { ...prev, url: e.target.value }
                        setSettings({ ...settings, galleryImages: newImages })
                      }}
                      className="bg-charcoal border-amber-gold/30 text-sage-green text-sm"
                      placeholder="Image URL"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold flex items-center gap-2">
                <Link className="w-5 h-5" />
                Social Links
              </CardTitle>
              <CardDescription className="text-sage-green/80">
                Configure social media links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="discord" className="text-sage-green">Discord Server</Label>
                  <Input
                    id="discord"
                    value={settings.socialLinks.discord}
                    onChange={(e) => setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, discord: e.target.value }
                    })}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                    placeholder="https://discord.gg/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-sage-green">Twitter/X</Label>
                  <Input
                    id="twitter"
                    value={settings.socialLinks.twitter}
                    onChange={(e) => setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, twitter: e.target.value }
                    })}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube" className="text-sage-green">YouTube</Label>
                  <Input
                    id="youtube"
                    value={settings.socialLinks.youtube}
                    onChange={(e) => setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, youtube: e.target.value }
                    })}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitch" className="text-sage-green">Twitch</Label>
                  <Input
                    id="twitch"
                    value={settings.socialLinks.twitch}
                    onChange={(e) => setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, twitch: e.target.value }
                    })}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                    placeholder="https://twitch.tv/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates">
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Website Updates
              </CardTitle>
              <CardDescription className="text-sage-green/80">
                Check for and install website updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-charcoal/50 rounded-lg border border-amber-gold/20">
                <div>
                  <p className="text-sage-green font-medium">Current Version</p>
                  <p className="text-amber-gold text-lg font-rye">{updateInfo.currentVersion}</p>
                </div>
                <div>
                  <p className="text-sage-green font-medium">Latest Version</p>
                  <p className="text-amber-gold text-lg font-rye">{updateInfo.latestVersion}</p>
                </div>
                <div className="flex items-center gap-2">
                  {updateInfo.hasUpdate ? (
                    <Badge variant="secondary" className="bg-amber-gold/20 text-amber-gold border-amber-gold/30">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Update Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Up to Date
                    </Badge>
                  )}
                </div>
              </div>

              {updateInfo.hasUpdate && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sage-green font-medium mb-2">Changelog</h4>
                    <div className="bg-charcoal/50 rounded-lg p-4 border border-amber-gold/20">
                      <ul className="space-y-1 text-sage-green/80">
                        {updateInfo.changelog.map((change, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-amber-gold mt-1">•</span>
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Button
                    onClick={updateWebsite}
                    disabled={isUpdating}
                    className="w-full bg-amber-gold hover:bg-amber-gold/90 text-charcoal"
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Updating Website...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Update Website
                      </>
                    )}
                  </Button>
                </div>
              )}

              <Button
                onClick={checkForUpdates}
                variant="outline"
                className="w-full border-amber-gold/30 text-amber-gold hover:bg-amber-gold/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check for Updates
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

  {/* Save button removed: settings now autosave on change */}
    </div>
  )
}