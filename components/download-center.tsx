"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Download,
  Search,
  Star,
  FileText,
  Package,
  Zap,
  Shield,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface DownloadItem {
  id: number
  name: string
  description: string
  version: string
  size: string
  downloads: number
  rating: number
  category: "client" | "modpack" | "resource" | "tool"
  tags: string[]
  author: string
  lastUpdated: Date
  featured: boolean
  verified: boolean
  downloadUrl: string
  changelog?: string
}

const mockDownloads: DownloadItem[] = [
  {
    id: 1,
    name: "Universal Game Launcher",
    description: "Cross‑platform launcher to connect to supported community game servers",
    version: "1.3.0",
    size: "180 MB",
    downloads: 182450,
    rating: 4.9,
    category: "client",
    tags: ["Official", "Required", "Multi‑platform"],
    author: "Community Team",
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    featured: true,
    verified: true,
    downloadUrl: "#",
    changelog: "Improved server discovery, faster updates, stability fixes",
  },
  {
    id: 2,
    name: "Multigame Roleplay Pack",
    description: "Roleplay systems pack with jobs, economy, progression and utilities compatible with multiple games",
    version: "2.3.1",
    size: "1.1 GB",
    downloads: 64210,
    rating: 4.7,
    category: "modpack",
    tags: ["Roleplay", "Jobs", "Economy", "Scripts"],
    author: "RP Suite",
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    featured: true,
    verified: true,
    downloadUrl: "#",
  },
  {
    id: 3,
    name: "FPS Audio Overhaul",
    description: "High‑fidelity sound effects and mix improvements for shooters and action titles",
    version: "1.6.0",
    size: "92 MB",
    downloads: 30215,
    rating: 4.5,
    category: "resource",
    tags: ["Audio", "Effects", "Realistic", "HQ"],
    author: "SoundForge",
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    featured: false,
    verified: true,
    downloadUrl: "#",
  },
  {
    id: 4,
    name: "Server Management Toolkit",
    description: "Administration, monitoring, and maintenance toolkit for game servers",
    version: "3.1.0",
    size: "18 MB",
    downloads: 12540,
    rating: 4.8,
    category: "tool",
    tags: ["Admin", "Management", "Monitoring", "Server"],
    author: "ServerTools",
    lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    featured: false,
    verified: true,
    downloadUrl: "#",
  },
]

interface DownloadProgress {
  id: number
  progress: number
  status: "downloading" | "completed" | "error"
}

export function DownloadCenter() {
  const [downloads] = useState<DownloadItem[]>(mockDownloads)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress[]>([])
  const [dragActive, setDragActive] = useState(false)

  const filteredDownloads = downloads.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleDownload = (item: DownloadItem) => {
    const newProgress: DownloadProgress = {
      id: item.id,
      progress: 0,
      status: "downloading",
    }

    setDownloadProgress((prev) => [...prev.filter((p) => p.id !== item.id), newProgress])

    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress((prev) =>
        prev.map((p) => {
          if (p.id === item.id && p.status === "downloading") {
            const newProgress = Math.min(p.progress + Math.random() * 15, 100)
            if (newProgress >= 100) {
              clearInterval(interval)
              return { ...p, progress: 100, status: "completed" }
            }
            return { ...p, progress: newProgress }
          }
          return p
        }),
      )
    }, 200)
  }

  const removeDownload = (id: number) => {
    setDownloadProgress((prev) => prev.filter((p) => p.id !== id))
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload
      console.log("Files dropped:", e.dataTransfer.files)
    }
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "client":
        return <Zap className="w-4 h-4" />
      case "modpack":
        return <Package className="w-4 h-4" />
      case "resource":
        return <FileText className="w-4 h-4" />
      case "tool":
        return <Shield className="w-4 h-4" />
      default:
        return <Download className="w-4 h-4" />
    }
  }

  const formatFileSize = (size: string) => size
  const formatDownloads = (count: number) => count.toLocaleString()

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-6 western-card">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search downloads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "client", "modpack", "resource", "tool"].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-secondary text-secondary-foreground"
                    : "border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                }
              >
                {getCategoryIcon(category)}
                <span className="ml-1 capitalize">{category === "all" ? "All" : category}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Upload Your Mods</h3>
          <p className="text-muted-foreground mb-4">Drag and drop your mod files here, or click to browse</p>
          <Button
            variant="outline"
            className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
          >
            Choose Files
          </Button>
        </div>
      </Card>

      {/* Downloads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Available Downloads</h2>
          <AnimatePresence>
            {filteredDownloads.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className={`p-6 western-card hover:scale-[1.01] transition-all duration-300 ${
                    item.featured ? "border-secondary/50" : ""
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-foreground">{item.name}</h3>
                          {item.featured && (
                            <Badge className="bg-secondary text-secondary-foreground">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {item.verified && (
                            <Badge variant="outline" className="border-green-400 text-green-400">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-accent/20 text-accent-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Version</div>
                        <div className="font-semibold text-foreground">{item.version}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Size</div>
                        <div className="font-semibold text-foreground">{item.size}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Downloads</div>
                        <div className="font-semibold text-foreground">{formatDownloads(item.downloads)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Rating</div>
                        <div className="font-semibold text-foreground flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          {item.rating}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="text-sm text-muted-foreground">
                        By {item.author} • Updated {item.lastUpdated.toLocaleDateString()}
                      </div>
                      <Button
                        onClick={() => handleDownload(item)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Download Progress */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Download Progress</h2>
          {downloadProgress.length === 0 ? (
            <Card className="p-8 western-card text-center">
              <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Active Downloads</h3>
              <p className="text-muted-foreground">Start downloading files to see progress here</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {downloadProgress.map((progress) => {
                const item = downloads.find((d) => d.id === progress.id)
                if (!item) return null

                return (
                  <Card key={progress.id} className="p-4 western-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            progress.status === "completed"
                              ? "bg-green-500/20"
                              : progress.status === "error"
                                ? "bg-red-500/20"
                                : "bg-primary/20"
                          }`}
                        >
                          {progress.status === "completed" ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : progress.status === "error" ? (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          ) : (
                            <Download className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.size}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeDownload(progress.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {progress.status === "downloading" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Downloading...</span>
                          <span className="text-foreground">{Math.round(progress.progress)}%</span>
                        </div>
                        <Progress value={progress.progress} className="h-2" />
                      </div>
                    )}

                    {progress.status === "completed" && (
                      <div className="text-sm text-green-400">Download completed!</div>
                    )}

                    {progress.status === "error" && (
                      <div className="text-sm text-red-400">Download failed. Please try again.</div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
