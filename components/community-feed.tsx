"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, ImageIcon, Send, Trophy, Star, Clock } from "lucide-react"

interface Post {
  id: number
  author: {
    name: string
    username: string
    avatar: string
    badge?: string
  }
  content: string
  image?: string
  timestamp: Date
  likes: number
  comments: number
  liked: boolean
  type: "post" | "achievement" | "event"
}

const mockPosts: Post[] = [
  {
    id: 1,
    author: {
      name: "John Marston",
      username: "outlaw_john",
      avatar: "/lone-cowboy.png",
      badge: "Sheriff",
    },
    content:
      "Just completed my first bank heist on Wild West RP! The adrenaline rush was incredible. Shoutout to my gang members for the perfect execution. 🤠",
    image: "/western-bank-heist-scene.png",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 24,
    comments: 8,
    liked: false,
    type: "post",
  },
  {
    id: 2,
    author: {
      name: "Arthur Morgan",
      username: "arthur_m",
      avatar: "/western-man.png",
      badge: "Veteran",
    },
    content:
      "Achievement Unlocked: Master Gunslinger! Finally reached 1000 headshots in PvP. Time to celebrate at the saloon!",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likes: 45,
    comments: 12,
    liked: true,
    type: "achievement",
  },
  {
    id: 3,
    author: {
      name: "Sadie Adler",
      username: "sadie_bounty",
      avatar: "/western-woman.png",
      badge: "Bounty Hunter",
    },
    content:
      "Hosting a bounty hunting event this Saturday at 8PM EST on Frontier Legends! Prizes for the top 3 hunters. Who's ready to ride?",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    likes: 67,
    comments: 23,
    liked: false,
    type: "event",
  },
]

export function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [newPost, setNewPost] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  const handleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post,
      ),
    )
  }

  const handlePost = async () => {
    if (!newPost.trim()) return

    setIsPosting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const post: Post = {
      id: Date.now(),
      author: {
        name: "You",
        username: "your_username",
        avatar: "/abstract-geometric-shapes.png",
      },
      content: newPost,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      liked: false,
      type: "post",
    }

    setPosts((prev) => [post, ...prev])
    setNewPost("")
    setIsPosting(false)
  }

  const getPostIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return <Trophy className="w-4 h-4 text-secondary" />
      case "event":
        return <Star className="w-4 h-4 text-primary" />
      default:
        return null
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card className="p-6 western-card">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src="/abstract-geometric-shapes.png" />
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="Share your latest adventure..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Add Image
              </Button>
              <Button
                onClick={handlePost}
                disabled={!newPost.trim() || isPosting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="w-4 h-4 mr-2" />
                {isPosting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="p-6 western-card hover:scale-[1.01] transition-all duration-300">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    {/* Author Info */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{post.author.name}</span>
                        <span className="text-muted-foreground text-sm">@{post.author.username}</span>
                        {post.author.badge && (
                          <Badge variant="secondary" className="text-xs bg-secondary/20 text-secondary">
                            {post.author.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm ml-auto">
                        {getPostIcon(post.type)}
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(post.timestamp)}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-foreground leading-relaxed">{post.content}</p>

                    {/* Image */}
                    {post.image && (
                      <div className="rounded-lg overflow-hidden">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt="Post image"
                          className="w-full max-h-96 object-cover"
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-6 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={`gap-2 ${post.liked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"}`}
                      >
                        <Heart className={`w-4 h-4 ${post.liked ? "fill-current" : ""}`} />
                        <span>{post.likes}</span>
                      </Button>

                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </Button>

                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
