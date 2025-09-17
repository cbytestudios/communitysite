"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, Code, Server, ChevronRight, Clock, User, Star, Copy, Check } from "lucide-react"

interface DocSection {
  id: string
  title: string
  description: string
  icon: any
  articles: DocArticle[]
  color: string
}

interface DocArticle {
  id: string
  title: string
  description: string
  author: string
  lastUpdated: Date
  readTime: string
  difficulty: "beginner" | "intermediate" | "advanced"
  rating: number
  content: string
}

const mockDocumentation: DocSection[] = [
  {
    id: "installation",
    title: "Installation Guide",
    description: "Get started with game client installation and setup",
    icon: BookOpen,
    color: "text-blue-400",
    articles: [
      {
        id: "game-install",
        title: "Installing Game Client",
        description: "Step-by-step guide to install the game client",
        author: "Community Team",
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        readTime: "5 min",
        difficulty: "beginner",
        rating: 4.9,
        content: `# Installing Game Client

## Prerequisites
- Base game installed (Steam, Epic Games, etc.)
- Windows 10/11 (64-bit)
- Visual C++ Redistributable

## Installation Steps

1. **Download Client**
   Download the game client from the official website or community resources.

2. **Extract Files**
   Extract the downloaded archive to a folder of your choice.

3. **Run Client**
   Double-click the executable to start the client.

## Troubleshooting
- Ensure base game is properly installed
- Run as administrator if needed
- Check firewall settings`,
      },
      {
        id: "first-server",
        title: "Joining Your First Server",
        description: "Learn how to connect to RedM servers",
        author: "Community Guide",
        lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        readTime: "3 min",
        difficulty: "beginner",
        rating: 4.7,
        content: `# Joining Your First Server

## Finding Servers
Use the built-in server browser or visit community websites.

## Connection Process
1. Select a server from the list
2. Click "Connect"
3. Wait for download completion
4. Create your character

## Tips for New Players
- Read server rules carefully
- Start with roleplay-friendly servers
- Ask questions in chat`,
      },
    ],
  },
  {
    id: "server-setup",
    title: "Server Setup",
    description: "Learn how to create and manage RedM servers",
    icon: Server,
    color: "text-green-400",
    articles: [
      {
        id: "server-basics",
        title: "Setting Up Your First Server",
        description: "Complete guide to RedM server setup",
        author: "Server Admin",
        lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        readTime: "15 min",
        difficulty: "intermediate",
        rating: 4.5,
        content: `# Setting Up Your First RedM Server

## Requirements
- Windows Server or Linux VPS
- Minimum 4GB RAM
- RedM Server Files

## Basic Configuration

### server.cfg
\`\`\`cfg
# Basic server configuration
endpoint_add_tcp "0.0.0.0:30120"
endpoint_add_udp "0.0.0.0:30120"

sv_hostname "My RedM Server"
sv_maxclients 32

# Resources
start chat
start spawnmanager
start sessionmanager
\`\`\`

### Starting the Server
\`\`\`bash
./RedMServer.exe +exec server.cfg
\`\`\``,
      },
    ],
  },
  {
    id: "modding",
    title: "Modding & Scripting",
    description: "Create custom resources and modifications",
    icon: Code,
    color: "text-purple-400",
    articles: [
      {
        id: "lua-basics",
        title: "Lua Scripting Basics",
        description: "Introduction to Lua scripting for RedM",
        author: "Script Developer",
        lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        readTime: "20 min",
        difficulty: "intermediate",
        rating: 4.8,
        content: `# Lua Scripting Basics for RedM

## Getting Started
RedM uses Lua for server-side and client-side scripting.

## Basic Script Structure
\`\`\`lua
-- Client-side script
RegisterCommand('hello', function(source, args, rawCommand)
    print('Hello, RedM!')
end, false)

-- Server-side event
RegisterServerEvent('myevent')
AddEventHandler('myevent', function()
    print('Server received event')
end)
\`\`\`

## Common Functions
- \`print()\` - Output to console
- \`RegisterCommand()\` - Create chat commands
- \`TriggerEvent()\` - Trigger events`,
      },
    ],
  },
]

export function DocumentationHub() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<DocArticle | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const allArticles = mockDocumentation.flatMap((section) =>
    section.articles.map((article) => ({ ...article, sectionId: section.id, sectionTitle: section.title })),
  )

  const filteredArticles = allArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const renderCodeBlock = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <div key={lastIndex} className="prose prose-invert max-w-none">
            {content
              .slice(lastIndex, match.index)
              .split("\n")
              .map((line, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed">
                  {line.startsWith("#") ? (
                    <span className="text-foreground font-semibold text-lg">{line}</span>
                  ) : line.startsWith("##") ? (
                    <span className="text-foreground font-semibold">{line}</span>
                  ) : (
                    line
                  )}
                </p>
              ))}
          </div>,
        )
      }

      // Add code block
      const language = match[1] || "text"
      const code = match[2].trim()
      const codeId = `code-${match.index}`

      parts.push(
        <div key={match.index} className="relative">
          <div className="flex items-center justify-between bg-muted/20 px-4 py-2 rounded-t-lg border border-border">
            <Badge variant="secondary" className="text-xs">
              {language}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(code, codeId)} className="h-6 px-2">
              {copiedCode === codeId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          <pre className="bg-card border border-t-0 border-border rounded-b-lg p-4 overflow-x-auto">
            <code className="text-sm text-foreground font-mono">{code}</code>
          </pre>
        </div>,
      )

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <div key={lastIndex} className="prose prose-invert max-w-none">
          {content
            .slice(lastIndex)
            .split("\n")
            .map((line, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {line.startsWith("#") ? (
                  <span className="text-foreground font-semibold text-lg">{line}</span>
                ) : line.startsWith("##") ? (
                  <span className="text-foreground font-semibold">{line}</span>
                ) : (
                  line
                )}
              </p>
            ))}
        </div>,
      )
    }

    return parts
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-400"
      case "intermediate":
        return "text-yellow-400"
      case "advanced":
        return "text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  if (selectedArticle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setSelectedArticle(null)}
            className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
          >
            ← Back to Documentation
          </Button>
        </div>

        <Card className="western-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{selectedArticle.title}</h1>
                <p className="text-muted-foreground text-lg">{selectedArticle.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-foreground font-medium">{selectedArticle.rating}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{selectedArticle.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{selectedArticle.readTime} read</span>
              </div>
              <Badge className={getDifficultyColor(selectedArticle.difficulty)} variant="outline">
                {selectedArticle.difficulty}
              </Badge>
              <span>Updated {selectedArticle.lastUpdated.toLocaleDateString()}</span>
            </div>
          </div>

          <div className="p-6 space-y-6">{renderCodeBlock(selectedArticle.content)}</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="p-6 western-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {searchTerm ? (
        /* Search Results */
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Search Results ({filteredArticles.length})</h2>
          <div className="grid gap-4">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="p-6 western-card hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-foreground">{article.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {article.sectionTitle}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{article.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{article.readTime} read</span>
                      <Badge className={getDifficultyColor(article.difficulty)} variant="outline">
                        {article.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>{article.rating}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Documentation Sections */
        <div className="grid gap-6">
          {mockDocumentation.map((section, index) => {
            const Icon = section.icon
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="western-card overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`w-6 h-6 ${section.color}`} />
                      <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                    </div>
                    <p className="text-muted-foreground">{section.description}</p>
                  </div>

                  <div className="divide-y divide-border">
                    {section.articles.map((article) => (
                      <div
                        key={article.id}
                        className="p-6 hover:bg-accent/5 transition-colors cursor-pointer"
                        onClick={() => setSelectedArticle(article)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground">{article.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{article.readTime}</span>
                              </div>
                              <Badge className={getDifficultyColor(article.difficulty)} variant="outline">
                                {article.difficulty}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span>{article.rating}</span>
                              </div>
                              <span>by {article.author}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
