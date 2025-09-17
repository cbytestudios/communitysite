"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Shield, AlertTriangle } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-rye text-amber-gold mb-4">Terms of Service</h1>
          <p className="text-sage-green/80 max-w-2xl mx-auto">
            Please read these terms carefully before using our gaming community services.
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-charcoal-light/80 border-amber-gold/20">
              <CardHeader>
                <CardTitle className="text-amber-gold flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sage-green/80 space-y-4">
                <p>
                  By accessing and using our gaming community website and services, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
                <p>
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-charcoal-light/80 border-amber-gold/20">
              <CardHeader>
                <CardTitle className="text-amber-gold flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Conduct
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sage-green/80 space-y-4">
                <p>Users are expected to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Treat all community members with respect</li>
                  <li>Follow server-specific rules and guidelines</li>
                  <li>Not engage in cheating, hacking, or exploiting</li>
                  <li>Not share inappropriate or offensive content</li>
                  <li>Not spam or harass other users</li>
                  <li>Respect intellectual property rights</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-charcoal-light/80 border-amber-gold/20">
              <CardHeader>
                <CardTitle className="text-amber-gold flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Account Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sage-green/80 space-y-4">
                <p>You are responsible for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintaining the confidentiality of your account</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Providing accurate and current information</li>
                  <li>Complying with all applicable laws and regulations</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-charcoal-light/80 border-amber-gold/20">
              <CardHeader>
                <CardTitle className="text-amber-gold flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Prohibited Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sage-green/80 space-y-4">
                <p>The following activities are strictly prohibited:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Using cheats, hacks, or unauthorized third-party software</li>
                  <li>Attempting to gain unauthorized access to our systems</li>
                  <li>Distributing malware or harmful content</li>
                  <li>Impersonating other users or staff members</li>
                  <li>Selling or transferring accounts</li>
                  <li>Commercial use without permission</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="bg-charcoal-light/80 border-amber-gold/20">
              <CardHeader>
                <CardTitle className="text-amber-gold">Enforcement and Penalties</CardTitle>
              </CardHeader>
              <CardContent className="text-sage-green/80 space-y-4">
                <p>
                  Violation of these terms may result in warnings, temporary suspensions, or permanent bans from our services.
                </p>
                <p>
                  We reserve the right to modify these terms at any time. Continued use of our services constitutes acceptance of any changes.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <Card className="bg-charcoal-light/80 border-amber-gold/20">
              <CardContent className="py-6">
                <p className="text-sage-green/60 text-sm">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
                <p className="text-sage-green/60 text-sm mt-2">
                  For questions about these terms, please contact our support team.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}