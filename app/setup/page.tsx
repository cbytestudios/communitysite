"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle, Settings, User, Globe } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/session-provider"

export default function SetupPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    siteName: "Community Website",
    siteDescription: "A multi-game community platform"
  })

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch("/api/setup/initial")
      if (response.ok) {
        const data = await response.json()
        setNeedsSetup(data.needsSetup)
        if (!data.needsSetup) {
          router.push("/login")
        }
      }
    } catch (error) {
      console.error("Setup check failed:", error)
      toast.error("Failed to check setup status")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/setup/initial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          siteName: formData.siteName,
          siteDescription: formData.siteDescription
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("Setup completed successfully!")
        
        // Auto-login the user
        if (data.token && data.user) {
          login(data.token, data.user)
        }
        
        // Redirect to admin panel
        setTimeout(() => {
          router.push("/admin")
        }, 1500)
      } else {
        const error = await response.json()
        toast.error(error.error || "Setup failed")
      }
    } catch (error) {
      console.error("Setup failed:", error)
      toast.error("Setup failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-gold" />
      </div>
    )
  }

  if (!needsSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal flex items-center justify-center">
        <Card className="w-full max-w-md bg-charcoal-light/80 border-amber-gold/20">
          <CardContent className="flex flex-col items-center py-8">
            <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
            <h2 className="text-xl font-bold text-sage-green mb-2">Setup Already Complete</h2>
            <p className="text-sage-green/80 text-center mb-4">
              Your website has already been set up. Please log in to continue.
            </p>
            <Button 
              onClick={() => router.push("/login")}
              className="bg-amber-gold hover:bg-amber-gold/90 text-charcoal"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Settings className="w-12 h-12 text-amber-gold" />
            </div>
            <h1 className="text-3xl font-bold text-amber-gold mb-2">
              Welcome to Community Website
            </h1>
            <p className="text-sage-green/80">
              Let's set up your multi-game community platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-charcoal-light/80 border-amber-gold/20">
              <CardHeader>
                <CardTitle className="text-amber-gold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Admin Account
                </CardTitle>
                <CardDescription className="text-sage-green/80">
                  Create your owner/admin account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sage-green">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sage-green">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sage-green">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sage-green">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-charcoal-light/80 border-amber-gold/20">
              <CardHeader>
                <CardTitle className="text-amber-gold flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Website Settings
                </CardTitle>
                <CardDescription className="text-sage-green/80">
                  Basic information about your community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-sage-green">Site Name</Label>
                  <Input
                    id="siteName"
                    value={formData.siteName}
                    onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription" className="text-sage-green">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={formData.siteDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, siteDescription: e.target.value }))}
                    className="bg-charcoal border-amber-gold/30 text-sage-green"
                    rows={3}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <h4 className="text-amber-300 font-medium mb-2">What happens next?</h4>
              <ul className="text-sm text-sage-green/80 space-y-1">
                <li>• Your admin account will be created with full access</li>
                <li>• Basic website settings will be configured</li>
                <li>• You can customize everything from the admin panel</li>
                <li>• Add servers, configure integrations, and manage users</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-amber-gold hover:bg-amber-gold/90 text-charcoal font-semibold py-3"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}