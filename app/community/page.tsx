"use client"
import { Footer } from "@/components/footer"
import { CommunityFeed } from "@/components/community-feed"
import { Leaderboards } from "@/components/leaderboards"
import { EventsCalendar } from "@/components/events-calendar"
import { AchievementShowcase } from "@/components/achievement-showcase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-western text-3xl md:text-5xl text-secondary mb-4">Community Hub</h1>
            <p className="text-xl text-muted-foreground">
              Connect with fellow outlaws, share your adventures, and climb the leaderboards
            </p>
          </div>

          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="feed">Community Feed</TabsTrigger>
              <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6">
              <CommunityFeed />
            </TabsContent>

            <TabsContent value="leaderboards" className="space-y-6">
              <Leaderboards />
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <EventsCalendar />
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <AchievementShowcase />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
