"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Package, Gamepad2 } from "lucide-react"

export default function DownloadsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-rye text-amber-gold mb-4">Downloads</h1>
          <p className="text-sage-green/80 max-w-2xl mx-auto">
            Download game clients, mods, and resources for our community servers.
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
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Game Clients
                </CardTitle>
                <CardDescription className="text-sage-green/80">
                  Download game clients and launchers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sage-green/60 mb-4">
                  No game clients available for download at this time.
                </p>
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
                  <Package className="w-5 h-5 mr-2" />
                  Mods & Resources
                </CardTitle>
                <CardDescription className="text-sage-green/80">
                  Community mods and resource packs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sage-green/60 mb-4">
                  No mods or resources available for download at this time.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}