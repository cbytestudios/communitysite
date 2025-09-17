"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

function VerifyEmailPageInner() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()
        if (response.ok) {
          setStatus('success')
          setMessage(data.message)
          setUsername(data.username || '')
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Network error occurred')
      }
    }
    verifyEmail()
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
        <Card className="bg-charcoal-light/80 backdrop-blur-sm border-amber-gold/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {status === 'loading' && (<Loader2 className="h-16 w-16 text-amber-gold animate-spin" />)}
              {status === 'success' && (<CheckCircle className="h-16 w-16 text-green-400" />)}
              {status === 'error' && (<XCircle className="h-16 w-16 text-red-400" />)}
            </div>
            <CardTitle className="text-2xl font-rye text-amber-gold">
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            <CardDescription className="text-sage-green">
              {status === 'loading' && 'Please wait while we verify your email address'}
              {status === 'success' && username && `Welcome to the community, ${username}!`}
              {status === 'error' && 'There was an issue verifying your email'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sage-green">{message}</p>
            {status === 'success' && (
              <div className="space-y-3">
                <p className="text-sage-green/80 text-sm">
                  Your account has been successfully verified. You can now sign in and start exploring the RedM community.
                </p>
                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-amber-gold to-amber-gold/80 hover:from-amber-gold/90 hover:to-amber-gold/70 text-charcoal font-semibold">
                    Sign In Now
                  </Button>
                </Link>
              </div>
            )}
            {status === 'error' && (
              <div className="space-y-3">
                <p className="text-sage-green/80 text-sm">
                  The verification link may have expired or is invalid. You can request a new verification email from the login page.
                </p>
                <div className="flex space-x-2">
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full border-amber-gold/30 text-sage-green hover:bg-amber-gold/10">
                      Back to Login
                    </Button>
                  </Link>
                  <Link href="/resend-verification" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-amber-gold to-amber-gold/80 hover:from-amber-gold/90 hover:to-amber-gold/70 text-charcoal font-semibold">
                      Resend Email
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            {status === 'loading' && (
              <p className="text-sage-green/80 text-sm">
                This may take a few moments...
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailPageInner />
    </Suspense>
  )
}