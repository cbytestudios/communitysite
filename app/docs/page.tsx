"use client"
import { Footer } from "@/components/footer"
import { DocumentationHub } from "@/components/documentation-hub"

export default function DocumentationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-western text-3xl md:text-5xl text-secondary mb-4">Documentation</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about RedM installation, server setup, and modding
            </p>
          </div>
          <DocumentationHub />
        </div>
      </main>
      <Footer />
    </div>
  )
}
