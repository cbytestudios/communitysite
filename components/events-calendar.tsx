"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Users, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react"

interface Event {
  id: number
  title: string
  description: string
  date: Date
  time: string
  duration: string
  host: {
    name: string
    avatar: string
  }
  server: string
  participants: number
  maxParticipants: number
  type: "tournament" | "roleplay" | "community" | "heist"
  featured: boolean
  rsvp: boolean
}

const mockEvents: Event[] = [
  {
    id: 1,
    title: "Wild West Tournament",
    description: "The biggest PvP tournament of the month! Compete against the best gunslingers for glory and prizes.",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    time: "8:00 PM EST",
    duration: "3 hours",
    host: {
      name: "Event Team",
      avatar: "/sheriff.png",
    },
    server: "Frontier Legends",
    participants: 45,
    maxParticipants: 64,
    type: "tournament",
    featured: true,
    rsvp: false,
  },
  {
    id: 2,
    title: "Bank Heist Roleplay",
    description:
      "Join us for an immersive bank heist roleplay event. Plan, execute, and escape in this thrilling scenario.",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    time: "7:30 PM EST",
    duration: "2 hours",
    host: {
      name: "Dutch van der Linde",
      avatar: "/outlaw.png",
    },
    server: "Wild West Roleplay",
    participants: 12,
    maxParticipants: 16,
    type: "roleplay",
    featured: false,
    rsvp: true,
  },
  {
    id: 3,
    title: "Community Meetup",
    description:
      "Monthly community gathering to discuss server updates, share feedback, and socialize with fellow players.",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    time: "6:00 PM EST",
    duration: "1.5 hours",
    host: {
      name: "Community Manager",
      avatar: "/diverse-team-manager.png",
    },
    server: "All Servers",
    participants: 78,
    maxParticipants: 100,
    type: "community",
    featured: false,
    rsvp: false,
  },
]

const eventTypes = {
  tournament: { color: "bg-red-500", label: "Tournament" },
  roleplay: { color: "bg-blue-500", label: "Roleplay" },
  community: { color: "bg-green-500", label: "Community" },
  heist: { color: "bg-purple-500", label: "Heist" },
}

export function EventsCalendar() {
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [currentDate, setCurrentDate] = useState(new Date())

  const handleRSVP = (eventId: number) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? {
              ...event,
              rsvp: !event.rsvp,
              participants: event.rsvp ? event.participants - 1 : event.participants + 1,
            }
          : event,
      ),
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getDaysUntil = (date: Date) => {
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    return `In ${diffDays} days`
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="p-6 western-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Calendar className="w-6 h-6 text-secondary" />
            Upcoming Events
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-foreground font-medium px-4">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <Button variant="outline" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-secondary">{events.length}</div>
            <div className="text-sm text-muted-foreground">Total Events</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{events.filter((e) => e.featured).length}</div>
            <div className="text-sm text-muted-foreground">Featured</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{events.filter((e) => e.rsvp).length}</div>
            <div className="text-sm text-muted-foreground">Your RSVPs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {events.reduce((sum, e) => sum + e.participants, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Participants</div>
          </div>
        </div>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className={`p-6 western-card hover:scale-[1.01] transition-all duration-300 ${event.featured ? "border-secondary/50" : ""}`}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Event Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-foreground">{event.title}</h3>
                        {event.featured && (
                          <Badge className="bg-secondary text-secondary-foreground">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <Badge className={`${eventTypes[event.type].color} text-white`}>
                          {eventTypes[event.type].label}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{formatDate(event.date)}</span>
                      <Badge variant="outline" className="ml-2">
                        {getDaysUntil(event.date)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>
                        {event.time} ({event.duration})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>
                        {event.participants}/{event.maxParticipants} participants
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{event.server}</span>
                    </div>
                  </div>

                  {/* Host Info */}
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={event.host.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{event.host.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-foreground">Hosted by {event.host.name}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 lg:w-48">
                  <Button
                    onClick={() => handleRSVP(event.id)}
                    className={
                      event.rsvp
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }
                  >
                    {event.rsvp ? "✓ RSVP'd" : "RSVP"}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
                  >
                    View Details
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">
                    {event.maxParticipants - event.participants} spots left
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
