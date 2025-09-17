"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowRight } from "lucide-react"

const news = [
  {
    id: 1,
    title: "Major Server Update: New Heist System Released",
    excerpt: "Experience the thrill of coordinated bank robberies and train heists with our new dynamic system.",
    author: "RedM Team",
    date: "2024-01-15",
    category: "Update",
    image: "/western-bank-heist-scene.png",
  },
  {
    id: 2,
    title: "Community Event: Wild West Tournament",
    excerpt: "Join us for the biggest PvP tournament of the year with $1000 in prizes for the top gunslinger.",
    author: "Event Team",
    date: "2024-01-12",
    category: "Event",
    image: "/western-gunfight-tournament.png",
  },
  {
    id: 3,
    title: "New Roleplay Guidelines and Rules",
    excerpt: "Updated community guidelines to ensure the best roleplay experience for all players.",
    author: "Moderation Team",
    date: "2024-01-10",
    category: "Announcement",
    image: "/western-town-meeting.png",
  },
]

export function NewsFeed() {
  return (
    <section className="py-20 bg-card/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-western text-3xl md:text-5xl text-secondary mb-4">Latest News</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest developments in our community
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((article, index) => (
            <motion.article
              key={article.id}
              className="western-card overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-secondary/90 text-secondary-foreground">
                    {article.category}
                  </Badge>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">{article.excerpt}</p>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(article.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
