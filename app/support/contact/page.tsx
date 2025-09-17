"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageCircle, Send } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement contact form submission
    console.log('Contact form submitted:', formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-rye text-amber-gold mb-4">Contact Support</h1>
          <p className="text-sage-green/80 max-w-2xl mx-auto">
            Need help? Send us a message and we'll get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-charcoal-light/80 border-amber-gold/20">
              <CardHeader>
                <CardTitle className="text-amber-gold flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Send us a Message
                </CardTitle>
                <CardDescription className="text-sage-green/80">
                  Fill out the form below and we'll respond within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sage-green">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sage-green">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sage-green">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="bg-charcoal border-amber-gold/30 text-sage-green"
                      placeholder="What's this about?"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sage-green">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="bg-charcoal border-amber-gold/30 text-sage-green min-h-[120px]"
                      placeholder="Tell us how we can help..."
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-amber-gold hover:bg-amber-gold/90 text-charcoal">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-charcoal-light/80 border-amber-gold/20">
              <CardHeader>
                <CardTitle className="text-amber-gold flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Other Ways to Reach Us
                </CardTitle>
                <CardDescription className="text-sage-green/80">
                  Alternative contact methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sage-green font-semibold mb-2">Discord Community</h3>
                  <p className="text-sage-green/80 text-sm">
                    Join our Discord server for real-time support and community discussions.
                  </p>
                </div>
                <div>
                  <h3 className="text-sage-green font-semibold mb-2">Response Time</h3>
                  <p className="text-sage-green/80 text-sm">
                    We typically respond to support requests within 24 hours during business days.
                  </p>
                </div>
                <div>
                  <h3 className="text-sage-green font-semibold mb-2">Emergency Issues</h3>
                  <p className="text-sage-green/80 text-sm">
                    For urgent server issues or security concerns, please mark your message as high priority.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}