"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Lock, Database } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-rye text-amber-gold mb-4">Privacy Policy</h1>
          <p className="text-sage-green/80 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
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
                  <Database className="w-5 h-5 mr-2" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sage-green/80 space-y-4">
                <p>We collect information you provide directly to us, such as:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Account information (username, email address)</li>
                  <li>Profile information (profile picture, Discord connection)</li>
                  <li>Communication data (support tickets, forum posts)</li>
                  <li>Usage data (server connections, activity logs)</li>
                </ul>
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
                  <Eye className="w-5 h-5 mr-2" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sage-green/80 space-y-4">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain our gaming services</li>
                  <li>Process your account registration and authentication</li>
                  <li>Communicate with you about our services</li>
                  <li>Improve our website and gaming experience</li>
                  <li>Ensure security and prevent fraud</li>
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
                  <Lock className="w-5 h-5 mr-2" />
                  Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sage-green/80 space-y-4">
                <p>We implement appropriate security measures to protect your personal information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encrypted data transmission (HTTPS)</li>
                  <li>Secure password hashing</li>
                  <li>Regular security audits</li>
                  <li>Limited access to personal data</li>
                  <li>Data backup and recovery procedures</li>
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
                  <Shield className="w-5 h-5 mr-2" />
                  Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sage-green/80 space-y-4">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data</li>
                  <li>Opt out of marketing communications</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us through our support system.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
            <Card className="bg-charcoal-light/80 border-amber-gold/20">
              <CardContent className="py-6">
                <p className="text-sage-green/60 text-sm">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
                <p className="text-sage-green/60 text-sm mt-2">
                  If you have any questions about this Privacy Policy, please contact our support team.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}