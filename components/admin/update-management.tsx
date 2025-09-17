"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  RefreshCw, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  GitBranch,
  User,
  Calendar,
  Loader2,
  AlertTriangle,
  Info
} from "lucide-react"
import { toast } from "sonner"

interface UpdateInfo {
  currentVersion: string
  latestVersion: string
  hasUpdate: boolean
  commitsAhead: number
  latestCommit?: {
    hash: string
    message: string
    author: string
    date: string
  }
  changelog: string[]
  error?: string
}

export function UpdateManagement() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [checkingUpdates, setCheckingUpdates] = useState(false)

  useEffect(() => {
    checkForUpdates()
  }, [])

  const checkForUpdates = async () => {
    setCheckingUpdates(true)
    try {
      const response = await fetch("/api/admin/check-updates")
      if (response.ok) {
        const data = await response.json()
        setUpdateInfo(data)
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to check for updates")
      }
    } catch (error) {
      console.error("Update check failed:", error)
      toast.error("Failed to check for updates")
    } finally {
      setLoading(false)
      setCheckingUpdates(false)
    }
  }

  const performUpdate = async () => {
    if (!updateInfo?.hasUpdate) return

    setUpdating(true)
    try {
      const response = await fetch("/api/admin/update-website", {
        method: "POST"
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        
        // Wait a moment then reload the page
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      } else {
        const error = await response.json()
        toast.error(error.error || "Update failed")
        setUpdating(false)
      }
    } catch (error) {
      console.error("Update failed:", error)
      toast.error("Update failed")
      setUpdating(false)
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
          <h2 className="text-2xl font-bold text-amber-gold">Website Updates</h2>
          <p className="text-sage-green/80">Manage and apply easily.</p>
        </div>
        <Button 
          onClick={checkForUpdates} 
          disabled={checkingUpdates}
          variant="outline"
          className="border-amber-gold/30 text-sage-green hover:bg-amber-gold/10"
        >
          {checkingUpdates ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Check for Updates
            </>
          )}
        </Button>
      </div>

      {updateInfo?.error ? (
        process.env.NODE_ENV === 'development' ? (
          <Card className="bg-charcoal-light/80 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Update Check Failed
              </CardTitle>
              <CardDescription className="text-sage-green/80">
                Unable to check for updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-300">{updateInfo.error}</p>
              </div>
              <div className="mt-4 text-sm text-sage-green/60">
                <p>This usually means:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Git is not installed or configured</li>
                  <li>No git repository is initialized</li>
                  <li>No remote origin is configured</li>
                  <li>Network connectivity issues</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Up to Date
              </CardTitle>
              <CardDescription className="text-sage-green/80">
                Current version: {updateInfo?.currentVersion || "Unknown"}
              </CardDescription>
            </CardHeader>
          </Card>
        )
      ) : (
        <>
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold flex items-center gap-2">
                {updateInfo?.hasUpdate ? (
                  <>
                    <Download className="w-5 h-5 text-green-400" />
                    Updates Available
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Up to Date
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-sage-green/80">
                Current version: {updateInfo?.currentVersion || "Unknown"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {updateInfo?.hasUpdate ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                        {updateInfo.commitsAhead} commit{updateInfo.commitsAhead !== 1 ? 's' : ''} ahead
                      </Badge>
                    </div>
                    <Button 
                      onClick={performUpdate}
                      disabled={updating}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Update Now
                        </>
                      )}
                    </Button>
                  </div>

                  {updateInfo.latestCommit && (
                    <div className="bg-charcoal/50 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-amber-gold">Latest Changes</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <GitBranch className="w-4 h-4 text-sage-green/60" />
                          <code className="bg-charcoal px-2 py-1 rounded text-amber-gold">
                            {updateInfo.latestCommit.hash}
                          </code>
                        </div>
                        <p className="text-sage-green">{updateInfo.latestCommit.message}</p>
                        <div className="flex items-center gap-4 text-sm text-sage-green/60">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {updateInfo.latestCommit.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {updateInfo.latestCommit.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="text-amber-300 font-medium">Important Update Notes</p>
                        <ul className="text-sm text-sage-green/80 space-y-1">
                          <li>• The website will restart automatically after the update</li>
                          <li>• Users may experience a brief downtime (30-60 seconds)</li>
                          <li>• All data and settings will be preserved</li>
                          <li>• Make sure you have a backup before updating</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sage-green mb-2">
                    Your website is up to date!
                  </h3>
                  <p className="text-sage-green/60">
                    You're running the latest version of the community website.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {updateInfo?.changelog && updateInfo.changelog.length > 0 && (
            <Card className="bg-charcoal-light/80 border-amber-gold/20">
              <CardHeader>
                <CardTitle className="text-amber-gold flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Changes
                </CardTitle>
                <CardDescription className="text-sage-green/80">
                  Latest commits from the repository
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {updateInfo.changelog.slice(0, 10).map((change, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b border-amber-gold/10 last:border-b-0">
                      <div className="w-2 h-2 bg-amber-gold rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sage-green text-sm">{change}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold flex items-center gap-2">
                <Info className="w-5 h-5" />
                Update Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-sage-green/60">Current Version</p>
                  <p className="text-sage-green font-mono">{updateInfo?.currentVersion || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sage-green/60">Update Status</p>
                  <p className="text-sage-green">
                    {updateInfo?.hasUpdate ? "Updates Available" : "Up to Date"}
                  </p>
                </div>
              </div>

              <Separator className="bg-amber-gold/20" />

              <div className="space-y-2">
                <h4 className="font-semibold text-amber-gold">How Updates Work</h4>
                <ul className="text-sm text-sage-green/80 space-y-1">
                  <li>• Updates are pulled directly from the system.</li>
                  <li>• The system automatically installs dependencies and rebuilds</li>
                  <li>• Database migrations are applied automatically if needed</li>
                  <li>• The application restarts with zero configuration required</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}