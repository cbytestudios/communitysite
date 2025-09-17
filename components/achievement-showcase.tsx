"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, DollarSign, Users, Clock, Shield } from "lucide-react"

interface Achievement {
  id: number
  title: string
  description: string
  icon: any
  category: string
  rarity: "common" | "rare" | "epic" | "legendary"
  progress: number
  maxProgress: number
  unlocked: boolean
  unlockedDate?: Date
  reward: string
}

const mockAchievements: Achievement[] = [
  {
    id: 1,
    title: "First Blood",
    description: "Get your first kill in PvP combat",
    icon: Target,
    category: "Combat",
    rarity: "common",
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    reward: "$100",
  },
  {
    id: 2,
    title: "Master Gunslinger",
    description: "Achieve 1000 headshots in PvP",
    icon: Trophy,
    category: "Combat",
    rarity: "legendary",
    progress: 1000,
    maxProgress: 1000,
    unlocked: true,
    unlockedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    reward: "Golden Revolver Skin",
  },
  {
    id: 3,
    title: "Bank Robber",
    description: "Successfully complete 10 bank heists",
    icon: DollarSign,
    category: "Heists",
    rarity: "epic",
    progress: 7,
    maxProgress: 10,
    unlocked: false,
    reward: "Outlaw Badge",
  },
  {
    id: 4,
    title: "Social Butterfly",
    description: "Make 50 friends in the community",
    icon: Users,
    category: "Social",
    rarity: "rare",
    progress: 32,
    maxProgress: 50,
    unlocked: false,
    reward: "Community Title",
  },
  {
    id: 5,
    title: "Veteran",
    description: "Play for 500 hours total",
    icon: Clock,
    category: "General",
    rarity: "epic",
    progress: 347,
    maxProgress: 500,
    unlocked: false,
    reward: "Veteran Badge",
  },
  {
    id: 6,
    title: "Sheriff",
    description: "Maintain law and order for 30 days",
    icon: Shield,
    category: "Roleplay",
    rarity: "legendary",
    progress: 0,
    maxProgress: 30,
    unlocked: false,
    reward: "Sheriff Star",
  },
]

const rarityColors = {
  common: "border-gray-400 bg-gray-400/10",
  rare: "border-blue-400 bg-blue-400/10",
  epic: "border-purple-400 bg-purple-400/10",
  legendary: "border-yellow-400 bg-yellow-400/10",
}

const rarityTextColors = {
  common: "text-gray-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-yellow-400",
}

export function AchievementShowcase() {
  const [filter, setFilter] = useState<string>("all")
  const [achievements] = useState<Achievement[]>(mockAchievements)

  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === "all") return true
    if (filter === "unlocked") return achievement.unlocked
    if (filter === "locked") return !achievement.unlocked
    return achievement.category.toLowerCase() === filter.toLowerCase()
  })

  const categories = ["all", "unlocked", "locked", "combat", "heists", "social", "general", "roleplay"]
  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalPoints = achievements.filter((a) => a.unlocked).length * 100

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="p-6 western-card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-secondary">{unlockedCount}</div>
            <div className="text-sm text-muted-foreground">Unlocked</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{achievements.length - unlockedCount}</div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{totalPoints}</div>
            <div className="text-sm text-muted-foreground">Achievement Points</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {Math.round((unlockedCount / achievements.length) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Completion</div>
          </div>
        </div>
      </Card>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={filter === category ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(category)}
            className={
              filter === category
                ? "bg-secondary text-secondary-foreground"
                : "border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            }
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement, index) => {
          const Icon = achievement.icon
          const isUnlocked = achievement.unlocked
          const progressPercentage = (achievement.progress / achievement.maxProgress) * 100

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={`p-6 western-card hover:scale-[1.02] transition-all duration-300 ${
                  isUnlocked ? rarityColors[achievement.rarity] : "opacity-75"
                }`}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${isUnlocked ? "bg-secondary/20" : "bg-muted/20"}`}>
                      <Icon className={`w-6 h-6 ${isUnlocked ? "text-secondary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`${rarityTextColors[achievement.rarity]} border-current`} variant="outline">
                        {achievement.rarity}
                      </Badge>
                      {isUnlocked && (
                        <Badge className="bg-green-600 text-white">
                          <Trophy className="w-3 h-3 mr-1" />
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3
                      className={`text-lg font-bold mb-2 ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{achievement.description}</p>
                  </div>

                  {/* Progress */}
                  {!isUnlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  )}

                  {/* Reward */}
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Reward:</span>
                      <span className={`font-medium ${isUnlocked ? "text-secondary" : "text-foreground"}`}>
                        {achievement.reward}
                      </span>
                    </div>
                    {isUnlocked && achievement.unlockedDate && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Unlocked {achievement.unlockedDate.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
