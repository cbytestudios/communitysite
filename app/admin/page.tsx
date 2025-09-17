"use client"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserManagement } from "@/components/admin/user-management"
import { ServerManagementEnhanced } from "@/components/admin/server-management-enhanced"
import { ContentModeration } from "@/components/admin/content-moderation"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"
import { WebsiteCustomization } from "@/components/admin/website-customization"
import { UpdateManagement } from "@/components/admin/update-management"
import { Users, Server, Shield, BarChart3, Settings, Download, Loader2 } from "lucide-react"
import { useAuth } from "@/components/session-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || (!user.isAdmin && !user.isOwner))) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-gold" />
      </div>
    )
  }

  if (!user || (!user.isAdmin && !user.isOwner)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal flex items-center justify-center">
        <Card className="w-full max-w-md bg-charcoal-light/80 border-amber-gold/20">
          <CardContent className="flex flex-col items-center py-8">
            <Shield className="w-16 h-16 text-red-400 mb-4" />
            <h2 className="text-xl font-bold text-sage-green mb-2">Access Denied</h2>
            <p className="text-sage-green/80 text-center mb-4">
              You need admin privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-rye text-amber-gold mb-2">Admin Dashboard</h1>
          <p className="text-sage-green/80">Manage your multi-game community</p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-charcoal-light/50 border border-amber-gold/20">
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center gap-2 data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal"
            >
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="servers"
              className="flex items-center gap-2 data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal"
            >
              <Server className="h-4 w-4" />
              Servers
            </TabsTrigger>
            <TabsTrigger
              value="moderation"
              className="flex items-center gap-2 data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal"
            >
              <Shield className="h-4 w-4" />
              Moderation
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal"
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>


            <TabsTrigger
              value="updates"
              className="flex items-center gap-2 data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal"
            >
              <Download className="h-4 w-4" />
              Updates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="servers">
            <ServerManagementEnhanced />
          </TabsContent>

          <TabsContent value="moderation">
            <ContentModeration />
          </TabsContent>

          <TabsContent value="settings">
            <WebsiteCustomization />
          </TabsContent>

          <TabsContent value="updates">
            <UpdateManagement />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
