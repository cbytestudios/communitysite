"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [loginField, setLoginField] = useState("osbornjr")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginField,
          password: password
        })
      })
      
      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const checkSetup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/setup/initial')
      const data = await response.json()
      setResult({ status: response.status, data, type: 'setup-check' })
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-charcoal-light/80 border-amber-gold/20">
          <CardHeader>
            <CardTitle className="text-amber-gold">Debug Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sage-green">Username/Email:</label>
              <Input
                value={loginField}
                onChange={(e) => setLoginField(e.target.value)}
                className="bg-charcoal border-amber-gold/30 text-sage-green"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sage-green">Password:</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-charcoal border-amber-gold/30 text-sage-green"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={testLogin} 
                disabled={loading}
                className="bg-amber-gold hover:bg-amber-gold/90 text-charcoal"
              >
                Test Login
              </Button>
              
              <Button 
                onClick={checkSetup} 
                disabled={loading}
                className="bg-sage-green hover:bg-sage-green/90 text-charcoal"
              >
                Check Setup Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card className="bg-charcoal-light/80 border-amber-gold/20">
            <CardHeader>
              <CardTitle className="text-amber-gold">Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sage-green text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}