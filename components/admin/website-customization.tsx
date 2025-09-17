"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Palette, 
  Image, 
  Type, 
  Settings, 
  Upload, 
  Trash2, 
  Save, 
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  X,
  Loader2,
  Check,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

interface WebsiteSettings {
  siteName: string
  siteDescription: string
  heroTitle: string
  heroDescription: string
  heroBackgroundImage: string
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

const defaultSettings: WebsiteSettings = {
  siteName: "Community Website",
  siteDescription: "A multi-game community platform",
  heroTitle: "Welcome to Our Gaming Community",
  heroDescription: "Join our multi-game community. Experience epic adventures, connect with players, and forge your legend across multiple gaming platforms.",
  heroBackgroundImage: "",
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
    text: "#FFFFFF"
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
}

export function WebsiteCustomization() {
  const [settings, setSettings] = useState<WebsiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [newGalleryImage, setNewGalleryImage] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/website-settings")
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...defaultSettings, ...data })
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
      toast.error("Failed to load website settings")
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/website-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success("Website settings saved successfully!")
      } else {
        let message = "Failed to save settings"
        try {
          const error = await response.json()
          message = error?.error || message
        } catch {
          // Non-JSON response (e.g., 401 HTML), keep default message
        }
        toast.error(message)
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const uploadGalleryImage = async (file: File) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/admin/upload-gallery-image", {
        method: "POST",
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        const newImage = { url: data.url, caption: "", alt: "" }
        setSettings(prev => ({
          ...prev,
          galleryImages: [...prev.galleryImages, newImage]
        }))
        toast.success("Image uploaded successfully!")
      } else {
        toast.error("Failed to upload image")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    setSettings(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }))
  }

  const addGalleryImageUrl = () => {
    if (newGalleryImage.trim()) {
      const newImage = { url: newGalleryImage.trim(), caption: "", alt: "" }
      setSettings(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, newImage]
      }))
      setNewGalleryImage("")
    }
  }

  const testEmailSettings = async () => {
    setTestingEmail(true)
    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: settings.contactEmail,
          subject: "Email Configuration Test",
          text: "This is a test email to verify your SMTP configuration is working correctly."
        })
      })

      if (response.ok) {
        toast.success("Test email sent successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to send test email")
      }
    } catch (error) {
      console.error("Email test error:", error)
      toast.error("Failed to send test email")
    } finally {
      setTestingEmail(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-amber-gold">Website Customization</h2>
          <p className="text-sage-green/80">Customize your website appearance and functionality</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="bg-amber-gold hover:bg-amber-gold/90 text-charcoal"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button 
            onClick={() => setSettings(defaultSettings)}
            variant="outline"
            className="border-amber-gold/40 text-amber-gold hover:bg-amber-gold/10"
            title="Revert to default colors (requires Save to apply)"
          >
            Reset Colors
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-charcoal-light/50 border border-amber-gold/20">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold">General Settings</CardTitle>
              <CardDescription className="text-sage-green/80">
                Basic website information and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-sage-green">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-sage-green">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="text-sage-green">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  className="bg-charcoal border-amber-gold/30 text-sage-green"
                  rows={3}
                />
              </div>

              <Separator className="bg-amber-gold/20" />

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-amber-gold">Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(settings.features).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-sage-green capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            features: { ...prev.features, [key]: checked }
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold">Color Scheme</CardTitle>
              <CardDescription className="text-sage-green/80">
                Customize your website's color palette
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(settings.colors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-sage-green capitalize">{key}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={value}
                        onChange={(e) => 
                          setSettings(prev => ({
                            ...prev,
                            colors: { ...prev.colors, [key]: e.target.value }
                          }))
                        }
                        className="w-12 h-10 p-1 bg-charcoal border-amber-gold/30"
                      />
                      <Input
                        value={value}
                        onChange={(e) => 
                          setSettings(prev => ({
                            ...prev,
                            colors: { ...prev.colors, [key]: e.target.value }
                          }))
                        }
                        className="bg-charcoal border-amber-gold/30 text-sage-green"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Branding */}
              <div className="mt-6 space-y-4">
                <CardTitle className="text-amber-gold">Branding</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sage-green">Logo URL</Label>
                    <Input
                      value={(settings as any).assets?.logoUrl || ""}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        assets: { ...(prev as any).assets, logoUrl: e.target.value }
                      }))}
                      placeholder="/logo.png or https://..."
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sage-green">Favicon URL</Label>
                    <Input
                      value={(settings as any).assets?.faviconUrl || ""}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        assets: { ...(prev as any).assets, faviconUrl: e.target.value }
                      }))}
                      placeholder="/favicon.ico or https://..."
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                    />
                  </div>
                </div>
              </div>

              {/* Featured Server Card Color */}
              <div className="mt-6 space-y-2">
                <Label className="text-sage-green">Featured Server Card Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={(settings.colors as any).featuredServerCard || "#3a3a3c"}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      colors: { ...prev.colors, featuredServerCard: e.target.value }
                    }))}
                    className="w-12 h-10 p-1 bg-charcoal border-amber-gold/30"
                  />
                  <Input
                    value={(settings.colors as any).featuredServerCard || "#3a3a3c"}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      colors: { ...prev.colors, featuredServerCard: e.target.value }
                    }))}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                  />
                </div>
                <p className="text-xs text-sage-green/70">This controls the card color for the Featured Server section.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold">Hero Section</CardTitle>
              <CardDescription className="text-sage-green/80">
                Customize the main hero section content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroTitle" className="text-sage-green">Hero Title</Label>
                <Input
                  id="heroTitle"
                  value={settings.heroTitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, heroTitle: e.target.value }))}
                  className="bg-charcoal border-amber-gold/30 text-sage-green"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="heroDescription" className="text-sage-green">Hero Description</Label>
                <Textarea
                  id="heroDescription"
                  value={settings.heroDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, heroDescription: e.target.value }))}
                  className="bg-charcoal border-amber-gold/30 text-sage-green"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold">SEO Settings</CardTitle>
              <CardDescription className="text-sage-green/80">
                Search engine optimization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle" className="text-sage-green">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={settings.seo.metaTitle}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    seo: { ...prev.seo, metaTitle: e.target.value }
                  }))}
                  className="bg-charcoal border-amber-gold/30 text-sage-green"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaDescription" className="text-sage-green">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.seo.metaDescription}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    seo: { ...prev.seo, metaDescription: e.target.value }
                  }))}
                  className="bg-charcoal border-amber-gold/30 text-sage-green"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keywords" className="text-sage-green">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  value={settings.seo.keywords}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    seo: { ...prev.seo, keywords: e.target.value }
                  }))}
                  className="bg-charcoal border-amber-gold/30 text-sage-green"
                  placeholder="gaming, community, multiplayer, servers"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold">Gallery Images</CardTitle>
              <CardDescription className="text-sage-green/80">
                Manage images displayed in the hero section slideshow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {settings.galleryImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-charcoal rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.alt || `Gallery image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.jpg'
                        }}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeGalleryImage(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="mt-2 space-y-1">
                      <Input
                        placeholder="Image caption"
                        value={image.caption || ""}
                        onChange={(e) => {
                          const newImages = [...settings.galleryImages]
                          newImages[index] = { ...newImages[index], caption: e.target.value }
                          setSettings(prev => ({ ...prev, galleryImages: newImages }))
                        }}
                        className="bg-charcoal border-amber-gold/30 text-sage-green text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-amber-gold/20" />

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-amber-gold">Add New Image</h4>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Image URL"
                    value={newGalleryImage}
                    onChange={(e) => setNewGalleryImage(e.target.value)}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                  />
                  <Button 
                    onClick={addGalleryImageUrl}
                    disabled={!newGalleryImage.trim()}
                    className="bg-amber-gold hover:bg-amber-gold/90 text-charcoal"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-center">
                  <Label htmlFor="imageUpload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-amber-gold/30 rounded-lg p-6 hover:border-amber-gold/50 transition-colors">
                      {uploadingImage ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-amber-gold mr-2" />
                          <span className="text-sage-green">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-amber-gold mb-2" />
                          <span className="text-sage-green">Click to upload image</span>
                          <span className="text-sage-green/60 text-sm">PNG, JPG, GIF up to 10MB</span>
                        </div>
                      )}
                    </div>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadGalleryImage(file)
                      }}
                      disabled={uploadingImage}
                    />
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold">Discord Integration</CardTitle>
              <CardDescription className="text-sage-green/80">
                Configure Discord OAuth and bot integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sage-green">Enable Discord Integration</Label>
                <Switch
                  checked={settings.integrations.discord.enabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      integrations: {
                        ...prev.integrations,
                        discord: { ...prev.integrations.discord, enabled: checked }
                      }
                    }))
                  }
                />
              </div>

              {settings.integrations.discord.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sage-green">Client ID</Label>
                      <Input
                        value={settings.integrations.discord.clientId}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          integrations: {
                            ...prev.integrations,
                            discord: { ...prev.integrations.discord, clientId: e.target.value }
                          }
                        }))}
                        className="bg-charcoal border-amber-gold/30 text-sage-green"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sage-green">Guild ID</Label>
                      <Input
                        value={settings.integrations.discord.guildId}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          integrations: {
                            ...prev.integrations,
                            discord: { ...prev.integrations.discord, guildId: e.target.value }
                          }
                        }))}
                        className="bg-charcoal border-amber-gold/30 text-sage-green"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sage-green">Client Secret</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords ? "text" : "password"}
                        value={settings.integrations.discord.clientSecret}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          integrations: {
                            ...prev.integrations,
                            discord: { ...prev.integrations.discord, clientSecret: e.target.value }
                          }
                        }))}
                        className="bg-charcoal border-amber-gold/30 text-sage-green pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-sage-green hover:text-amber-gold"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sage-green">Bot Token</Label>
                    <Input
                      type={showPasswords ? "text" : "password"}
                      value={settings.integrations.discord.botToken}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        integrations: {
                          ...prev.integrations,
                          discord: { ...prev.integrations.discord, botToken: e.target.value }
                        }
                      }))}
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold">Steam Integration</CardTitle>
              <CardDescription className="text-sage-green/80">
                Configure Steam Web API integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sage-green">Enable Steam Integration</Label>
                <Switch
                  checked={settings.integrations.steam.enabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      integrations: {
                        ...prev.integrations,
                        steam: { ...prev.integrations.steam, enabled: checked }
                      }
                    }))
                  }
                />
              </div>

              {settings.integrations.steam.enabled && (
                <div className="space-y-2">
                  <Label className="text-sage-green">Steam Web API Key</Label>
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={settings.integrations.steam.apiKey}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      integrations: {
                        ...prev.integrations,
                        steam: { ...prev.integrations.steam, apiKey: e.target.value }
                      }
                    }))}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                    placeholder="Get your API key from https://steamcommunity.com/dev/apikey"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold">Google Integration</CardTitle>
              <CardDescription className="text-sage-green/80">
                Configure Google OAuth integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sage-green">Enable Google Integration</Label>
                <Switch
                  checked={settings.integrations.google.enabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      integrations: {
                        ...prev.integrations,
                        google: { ...prev.integrations.google, enabled: checked }
                      }
                    }))
                  }
                />
              </div>

              {settings.integrations.google.enabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sage-green">Client ID</Label>
                    <Input
                      value={settings.integrations.google.clientId}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        integrations: {
                          ...prev.integrations,
                          google: { ...prev.integrations.google, clientId: e.target.value }
                        }
                      }))}
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sage-green">Client Secret</Label>
                    <Input
                      type={showPasswords ? "text" : "password"}
                      value={settings.integrations.google.clientSecret}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        integrations: {
                          ...prev.integrations,
                          google: { ...prev.integrations.google, clientSecret: e.target.value }
                        }
                      }))}
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold">Email Settings</CardTitle>
              <CardDescription className="text-sage-green/80">
                Configure SMTP settings for sending emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sage-green">SMTP Host</Label>
                  <Input
                    value={settings.emailSettings.smtpHost}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emailSettings: { ...prev.emailSettings, smtpHost: e.target.value }
                    }))}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sage-green">SMTP Port</Label>
                  <Input
                    type="number"
                    value={settings.emailSettings.smtpPort}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emailSettings: { ...prev.emailSettings, smtpPort: parseInt(e.target.value) || 587 }
                    }))}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sage-green">SMTP Username</Label>
                  <Input
                    value={settings.emailSettings.smtpUser}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emailSettings: { ...prev.emailSettings, smtpUser: e.target.value }
                    }))}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sage-green">SMTP Password</Label>
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={settings.emailSettings.smtpPassword}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emailSettings: { ...prev.emailSettings, smtpPassword: e.target.value }
                    }))}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sage-green">From Email</Label>
                  <Input
                    type="email"
                    value={settings.emailSettings.fromEmail}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emailSettings: { ...prev.emailSettings, fromEmail: e.target.value }
                    }))}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sage-green">From Name</Label>
                  <Input
                    value={settings.emailSettings.fromName}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emailSettings: { ...prev.emailSettings, fromName: e.target.value }
                    }))}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={testEmailSettings}
                  disabled={testingEmail || !settings.emailSettings.smtpHost}
                  variant="outline"
                  className="border-amber-gold/30 text-sage-green hover:bg-amber-gold/10"
                >
                  {testingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Test...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-sage-green hover:text-amber-gold"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPasswords ? " Hide" : " Show"} Passwords
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}