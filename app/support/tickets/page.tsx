"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ticket, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/session-provider"
import Link from "next/link"

export default function TicketsPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal flex items-center justify-center">
        <div className="text-sage-green">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-charcoal-light/80 border-amber-gold/20">
              <CardContent className="py-12">
                <Ticket className="w-16 h-16 text-amber-gold mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-sage-green mb-4">Login Required</h2>
                <p className="text-sage-green/80 mb-6">
                  You need to be logged in to view your support tickets.
                </p>
                <Button asChild className="bg-amber-gold hover:bg-amber-gold/90 text-charcoal">
                  <Link href="/login">Login to Continue</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Mock tickets data - replace with actual API call
  const tickets = [
    {
      id: "TICK-001",
      subject: "Server Connection Issues",
      status: "open",
      priority: "high",
      created: "2024-01-15",
      lastUpdate: "2024-01-16"
    },
    {
      id: "TICK-002", 
      subject: "Account Verification Problem",
      status: "resolved",
      priority: "medium",
      created: "2024-01-10",
      lastUpdate: "2024-01-12"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />
      case 'in-progress': return <Clock className="w-4 h-4" />
      case 'resolved': return <CheckCircle className="w-4 h-4" />
      default: return <Ticket className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h1 className="text-4xl font-rye text-amber-gold mb-4">Support Tickets</h1>
            <p className="text-sage-green/80">
              Track and manage your support requests.
            </p>
          </div>
          <Button className="bg-amber-gold hover:bg-amber-gold/90 text-charcoal">
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </motion.div>

        <div className="space-y-4">
          {tickets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-charcoal-light/80 border-amber-gold/20">
                <CardContent className="py-12 text-center">
                  <Ticket className="w-16 h-16 text-sage-green/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-sage-green mb-2">No Tickets Found</h3>
                  <p className="text-sage-green/60 mb-6">
                    You haven't submitted any support tickets yet.
                  </p>
                  <Button className="bg-amber-gold hover:bg-amber-gold/90 text-charcoal">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-charcoal-light/80 border-amber-gold/20 hover:border-amber-gold/40 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-amber-gold text-lg">
                          {ticket.subject}
                        </CardTitle>
                        <CardDescription className="text-sage-green/80">
                          Ticket #{ticket.id}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className={getStatusColor(ticket.status)}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1 capitalize">{ticket.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-sage-green/60">
                      <span>Created: {new Date(ticket.created).toLocaleDateString()}</span>
                      <span>Last Update: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}