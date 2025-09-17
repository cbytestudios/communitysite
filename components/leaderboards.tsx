"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, Target, DollarSign, Users, Crown } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  user: {
    name: string
    username: string
    avatar: string
  }
  score: number
  change: number
}

const leaderboardData = {
  kills: [
    {
      rank: 1,
      user: { name: "Arthur Morgan", username: "arthur_m", avatar: "/western-man.png" },
      score: 2847,
      change: 2,
    },
    {
      rank: 2,
      user: { name: "John Marston", username: "outlaw_john", avatar: "/lone-cowboy.png" },
      score: 2634,
      change: -1,
    },
    {
      rank: 3,
      user: { name: "Sadie Adler", username: "sadie_bounty", avatar: "/western-woman.png" },
      score: 2456,
      change: 1,
    },
    {
      rank: 4,
      user: { name: "Dutch van der Linde", username: "dutch_plan", avatar: "/outlaw.png" },
      score: 2234,
      change: 0,
    },
    {
      rank: 5,
      user: { name: "Micah Bell", username: "micah_rat", avatar: "/villain.png" },
      score: 2156,
      change: -2,
    },
  ],
  money: [
    {
      rank: 1,
      user: { name: "Dutch van der Linde", username: "dutch_plan", avatar: "/outlaw.png" },
      score: 45670,
      change: 1,
    },
    {
      rank: 2,
      user: { name: "Arthur Morgan", username: "arthur_m", avatar: "/western-man.png" },
      score: 42340,
      change: -1,
    },
    {
      rank: 3,
      user: { name: "John Marston", username: "outlaw_john", avatar: "/lone-cowboy.png" },
      score: 38920,
      change: 0,
    },
    {
      rank: 4,
      user: { name: "Sadie Adler", username: "sadie_bounty", avatar: "/western-woman.png" },
      score: 35670,
      change: 2,
    },
    {
      rank: 5,
      user: { name: "Charles Smith", username: "charles_tracker", avatar: "/digital-tracker.png" },
      score: 32450,
      change: -1,
    },
  ],
  playtime: [
    {
      rank: 1,
      user: { name: "John Marston", username: "outlaw_john", avatar: "/lone-cowboy.png" },
      score: 847,
      change: 0,
    },
    {
      rank: 2,
      user: { name: "Arthur Morgan", username: "arthur_m", avatar: "/western-man.png" },
      score: 823,
      change: 1,
    },
    {
      rank: 3,
      user: { name: "Sadie Adler", username: "sadie_bounty", avatar: "/western-woman.png" },
      score: 756,
      change: -1,
    },
    {
      rank: 4,
      user: { name: "Charles Smith", username: "charles_tracker", avatar: "/digital-tracker.png" },
      score: 689,
      change: 1,
    },
    {
      rank: 5,
      user: { name: "Dutch van der Linde", username: "dutch_plan", avatar: "/outlaw.png" },
      score: 634,
      change: -1,
    },
  ],
}

const categories = [
  { id: "kills", name: "Total Kills", icon: Target, suffix: "" },
  { id: "money", name: "Money Earned", icon: DollarSign, suffix: "$" },
  { id: "playtime", name: "Hours Played", icon: Users, suffix: "h" },
]

export function Leaderboards() {
  const [activeCategory, setActiveCategory] = useState("kills")

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-muted-foreground font-bold">{rank}</span>
    }
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-400"
    if (change < 0) return "text-red-400"
    return "text-muted-foreground"
  }

  const getChangeSymbol = (change: number) => {
    if (change > 0) return `↑${change}`
    if (change < 0) return `↓${Math.abs(change)}`
    return "—"
  }

  const formatScore = (score: number, category: string) => {
    if (category === "money") {
      return `$${score.toLocaleString()}`
    }
    if (category === "playtime") {
      return `${score}h`
    }
    return score.toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className={
                activeCategory === category.id
                  ? "bg-secondary text-secondary-foreground"
                  : "border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
              }
            >
              <Icon className="w-4 h-4 mr-2" />
              {category.name}
            </Button>
          )
        })}
      </div>

      {/* Leaderboard */}
      <Card className="western-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-secondary" />
            <h2 className="text-2xl font-bold text-foreground">
              {categories.find((c) => c.id === activeCategory)?.name} Leaderboard
            </h2>
          </div>
        </div>

        <div className="divide-y divide-border">
          {leaderboardData[activeCategory as keyof typeof leaderboardData].map((entry, index) => (
            <motion.div
              key={entry.user.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-6 hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-12">{getRankIcon(entry.rank)}</div>

                {/* User Info */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar>
                    <AvatarImage src={entry.user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{entry.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">{entry.user.name}</div>
                    <div className="text-sm text-muted-foreground">@{entry.user.username}</div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-xl font-bold text-foreground">{formatScore(entry.score, activeCategory)}</div>
                  <div className={`text-sm ${getChangeColor(entry.change)}`}>{getChangeSymbol(entry.change)}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Your Rank */}
      <Card className="p-6 western-card border-primary/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full">
              <span className="text-primary font-bold">#47</span>
            </div>
            <div>
              <div className="font-semibold text-foreground">Your Rank</div>
              <div className="text-sm text-muted-foreground">Keep climbing, outlaw!</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-foreground">{formatScore(1234, activeCategory)}</div>
            <div className="text-sm text-green-400">↑3</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
