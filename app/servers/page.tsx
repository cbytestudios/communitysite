"use client"
import { Footer } from "@/components/footer"
import { ServerBrowser } from "@/components/server-browser"

export default function ServersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-western text-3xl md:text-5xl text-secondary mb-4">Server Browser</h1>
            <p className="text-xl text-muted-foreground">Discover and join the best game servers in our community</p>
          </div>
          <ServerBrowser />
        </div>
      </main>
      <Footer />
    </div>
  )
}
