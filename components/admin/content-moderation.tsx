"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flag, MessageSquare, ImageIcon, AlertTriangle, Check, X, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

const reportedPosts = [
  {
    id: 1,
    type: "post",
    content: "This is inappropriate content that violates community guidelines...",
    author: "OutlawMike",
    reportedBy: "CowboyJoe",
    reason: "Inappropriate Content",
    timestamp: "2 hours ago",
    status: "pending",
  },
  {
    id: 2,
    type: "comment",
    content: "Spam message with external links...",
    author: "SpamBot123",
    reportedBy: "DesertRose",
    reason: "Spam",
    timestamp: "4 hours ago",
    status: "pending",
  },
  {
    id: 3,
    type: "image",
    content: "Inappropriate image upload",
    author: "BadActor",
    reportedBy: "SheriffSarah",
    reason: "Inappropriate Content",
    timestamp: "1 day ago",
    status: "resolved",
  },
]

const bannedUsers = [
  {
    id: 1,
    username: "TrollUser",
    reason: "Harassment",
    bannedBy: "CowboyJoe",
    banDate: "2024-03-15",
    duration: "Permanent",
  },
  {
    id: 2,
    username: "SpamAccount",
    reason: "Spam",
    bannedBy: "DesertRose",
    banDate: "2024-03-14",
    duration: "7 days",
  },
]

export function ContentModeration() {
  const [selectedTab, setSelectedTab] = useState("reports")

  const [reports, setReports] = useState(reportedPosts)

  const handleApprove = (id: number) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" } : r))
  }

  const handleReject = (id: number) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r))
  }

  const handleDelete = (id: number) => {
    setReports(prev => prev.filter(r => r.id !== id))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "post":
        return <MessageSquare className="h-4 w-4" />
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      default:
        return <Flag className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-gold text-charcoal"
      case "resolved":
        return "bg-sage-green text-charcoal"
      case "rejected":
        return "bg-rust-red text-white"
      default:
        return "bg-sage-green/50 text-sage-green"
    }
  }

  return (
    <Card className="bg-charcoal-light/80 border-amber-gold/20">
      <CardHeader>
        <CardTitle className="text-amber-gold">Content Moderation</CardTitle>
        <CardDescription className="text-sage-green/80">
          Review reported content and manage community standards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 bg-charcoal/50 border border-amber-gold/20">
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal"
            >
              Reported Content
            </TabsTrigger>
            <TabsTrigger value="bans" className="data-[state=active]:bg-amber-gold data-[state=active]:text-charcoal">
              Banned Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4 mt-6">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-4 bg-charcoal/50 rounded-lg border border-amber-gold/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(report.type)}
                    <span className="text-sage-green font-semibold capitalize">{report.type}</span>
                    <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                  </div>
                  <span className="text-sage-green/60 text-sm">{report.timestamp}</span>
                </div>

                <div className="mb-3">
                  <p className="text-sage-green/80 text-sm mb-2">{report.content}</p>
                  <div className="flex items-center gap-4 text-xs text-sage-green/60">
                    <span>
                      Author: <span className="text-sage-green">{report.author}</span>
                    </span>
                    <span>
                      Reported by: <span className="text-sage-green">{report.reportedBy}</span>
                    </span>
                    <span>
                      Reason: <span className="text-rust-red">{report.reason}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {report.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(report.id)}
                        className="bg-sage-green hover:bg-sage-green/80 text-charcoal"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(report.id)}
                        className="border-rust-red/30 text-rust-red hover:bg-rust-red/10"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(report.id)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="bans" className="space-y-4 mt-6">
            {bannedUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-4 bg-charcoal/50 rounded-lg border border-amber-gold/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-rust-red" />
                      <span className="text-sage-green font-semibold">{user.username}</span>
                      <Badge className="bg-rust-red text-white">Banned</Badge>
                    </div>
                    <div className="text-xs text-sage-green/60 space-x-4">
                      <span>
                        Reason: <span className="text-rust-red">{user.reason}</span>
                      </span>
                      <span>
                        Banned by: <span className="text-sage-green">{user.bannedBy}</span>
                      </span>
                      <span>
                        Date: <span className="text-sage-green">{user.banDate}</span>
                      </span>
                      <span>
                        Duration: <span className="text-amber-gold">{user.duration}</span>
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-sage-green/30 text-sage-green hover:bg-sage-green/10 bg-transparent"
                  >
                    Unban
                  </Button>
                </div>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
