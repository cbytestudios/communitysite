"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

function ResetPasswordPageInner() {
	const searchParams = useSearchParams()
	const token = searchParams.get('token')

	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState("")
	const [success, setSuccess] = useState(false)
	const [tokenValid, setTokenValid] = useState<boolean | null>(null)

	useEffect(() => {
		if (!token) {
			setTokenValid(false)
			setError('No reset token provided')
			return
		}

		// Validate token on page load
		const validateToken = async () => {
			try {
				const response = await fetch(`/api/auth/validate-reset-token?token=${token}`)
				const data = await response.json()

				if (response.ok) {
					setTokenValid(true)
				} else {
					setTokenValid(false)
					setError(data.error || 'Invalid or expired reset token')
				}
			} catch (error) {
				setTokenValid(false)
				setError('Network error occurred')
			}
		}
		validateToken()
	}, [token])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")

		if (password.length < 6) {
			setError('Password must be at least 6 characters long')
			return
		}
		if (password !== confirmPassword) {
			setError('Passwords do not match')
			return
		}
		setIsLoading(true)
		try {
			const response = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ token, password }),
			})
			const data = await response.json()
			if (response.ok) {
				setSuccess(true)
			} else {
				setError(data.error || 'Failed to reset password')
			}
		} catch (error) {
			setError('Network error occurred')
		} finally {
			setIsLoading(false)
		}
	}

	if (tokenValid === null) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal flex items-center justify-center p-4">
				<div className="text-sage-green">Validating reset token...</div>
			</div>
		)
	}
	if (tokenValid === false) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal flex items-center justify-center p-4">
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
					<Card className="bg-charcoal-light/80 backdrop-blur-sm border-amber-gold/20">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<XCircle className="h-16 w-16 text-red-400" />
							</div>
							<CardTitle className="text-2xl font-rye text-amber-gold">Invalid Reset Link</CardTitle>
							<CardDescription className="text-sage-green">This password reset link is invalid or has expired</CardDescription>
						</CardHeader>
						<CardContent className="text-center space-y-4">
							<p className="text-sage-green">{error}</p>
							<div className="space-y-3">
								<Link href="/forgot-password">
									<Button className="w-full bg-gradient-to-r from-amber-gold to-amber-gold/80 hover:from-amber-gold/90 hover:to-amber-gold/70 text-charcoal font-semibold">Request New Reset Link</Button>
								</Link>
								<Link href="/login">
									<Button variant="outline" className="w-full border-amber-gold/30 text-sage-green hover:bg-amber-gold/10">Back to Login</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		)
	}
	if (success) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal flex items-center justify-center p-4">
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
					<Card className="bg-charcoal-light/80 backdrop-blur-sm border-amber-gold/20">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<CheckCircle className="h-16 w-16 text-green-400" />
							</div>
							<CardTitle className="text-2xl font-rye text-amber-gold">Password Reset Successful</CardTitle>
							<CardDescription className="text-sage-green">Your password has been successfully updated</CardDescription>
						</CardHeader>
						<CardContent className="text-center space-y-4">
							<p className="text-sage-green">You can now sign in with your new password.</p>
							<Link href="/login">
								<Button className="w-full bg-gradient-to-r from-amber-gold to-amber-gold/80 hover:from-amber-gold/90 hover:to-amber-gold/70 text-charcoal font-semibold">Sign In Now</Button>
							</Link>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		)
	}
	return (
		<div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal flex items-center justify-center p-4">
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
				<Card className="bg-charcoal-light/80 backdrop-blur-sm border-amber-gold/20">
					<CardHeader>
						<CardTitle className="text-2xl font-rye text-amber-gold">Reset Password</CardTitle>
						<CardDescription className="text-sage-green">Enter your new password below</CardDescription>
					</CardHeader>
					<CardContent>
						{error && (<div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md"><p className="text-red-400 text-sm">{error}</p></div>)}
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="password" className="text-sage-green">New Password</Label>
								<div className="relative">
									<Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-charcoal/50 border-amber-gold/30 text-sage-green placeholder:text-sage-green/50 focus:border-amber-gold focus:ring-amber-gold/20 pr-10" />
									<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sage-green/60 hover:text-sage-green">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="confirmPassword" className="text-sage-green">Confirm New Password</Label>
								<div className="relative">
									<Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="bg-charcoal/50 border-amber-gold/30 text-sage-green placeholder:text-sage-green/50 focus:border-amber-gold focus:ring-amber-gold/20 pr-10" />
									<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sage-green/60 hover:text-sage-green">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
								</div>
							</div>
							<Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-amber-gold to-amber-gold/80 hover:from-amber-gold/90 hover:to-amber-gold/70 text-charcoal font-semibold disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? "Resetting..." : "Reset Password"}</Button>
						</form>
						<div className="mt-6 text-center">
							<Link href="/login" className="text-sage-green hover:text-amber-gold font-semibold">Back to Login</Link>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	)
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ResetPasswordPageInner />
		</Suspense>
	)
}