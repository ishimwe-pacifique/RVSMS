"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"credentials" | "otp">("credentials")
  const [otp, setOtp] = useState("")
  const [cooldown, setCooldown] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        setLoading(false)
        return
      }

      // Move to OTP verification step
      setStep("otp")
      setLoading(false)
    } catch (err) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000) // 15s

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        signal: controller.signal,
      })

      // parse JSON safely
      let data: any = {}
      try {
        data = await response.json()
      } catch (e) {
        // ignore JSON parse error
      }

      if (!response.ok) {
        setError((data && data.error) || "OTP verification failed")
        return
      }

      // success: navigate to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  const startCooldown = (seconds: number) => {
    setCooldown(seconds)
    const iv = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(iv)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const handleResend = async () => {
    setError("")
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Failed to resend OTP')
        return
      }
      startCooldown(30)
    } catch (e) {
      setError('Failed to resend OTP')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mb-2">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">RVSMS Login</CardTitle>
          <CardDescription className="text-slate-600">Rwanda Veterinary Service Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={step === "credentials" ? handleSubmit : handleVerify} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="veterinarian@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-slate-300"
              />
            </div>

            {step === "credentials" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-slate-300"
                  />
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <p className="text-center text-sm text-slate-600">
                  {"Don't have an account? "}
                  <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Register here
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-slate-700">Enter the 6-digit code sent to your email</Label>
                  <InputOTPGroup>
                    <InputOTP value={otp} onChange={(val: string) => setOtp(val)} maxLength={6}>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTP>
                  </InputOTPGroup>
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>

                <div className="flex gap-2 mt-2">
                  <Button type="button" className="flex-1" disabled={cooldown > 0} onClick={handleResend}>
                    {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Code'}
                  </Button>
                  <Button type="button" className="w-24" onClick={() => setStep("credentials")}>
                    Back
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
