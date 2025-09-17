"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, MessageCircle, Mail, FileText } from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-rye text-amber-gold mb-4">Support Center</h1>
          <p className="text-sage-green/80 max-w-2xl mx-auto">
            Get help with our services, find answers to common questions, or contact our support team.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-charcoal-light/80 border-amber-gold/20 h-full">
              <CardHeader>
                <CardTitle className="text-amber-gold flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  FAQ
                </CardTitle>
                <CardDescription className="text-sage-green/80">
                  Frequently asked questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sage-green/60 mb-4">
                  Find answers to the most common questions about our services.
                </p>
                <Button asChild className="w-full bg-amber-gold hover:bg-amber-gold/90 text-charcoal">
                  <Link href="/support/faq">View FAQ</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-charcoal-light/80 border-amber-gold/20 h-full">
              <CardHeader>
                <CardTitle className="text-amber-gold flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact Us
                </CardTitle>
                <CardDescription className="text-sage-green/80">
                  Get in touch with our team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sage-green/60 mb-4">
                  Need personalized help? Contact our support team directly.
                </p>
                <Button asChild className="w-full bg-amber-gold hover:bg-amber-gold/90 text-charcoal">
                  <Link href="/support/contact">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-charcoal-light/80 border-amber-gold/20 h-full">
              <CardHeader>
                <CardTitle className="text-amber-gold flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Support Tickets
                </CardTitle>
                <CardDescription className="text-sage-green/80">
                  Track your support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sage-green/60 mb-4">
                  View and manage your support tickets.
                </p>
                <Button asChild className="w-full bg-amber-gold hover:bg-amber-gold/90 text-charcoal">
                  <Link href="/support/tickets">View Tickets</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}