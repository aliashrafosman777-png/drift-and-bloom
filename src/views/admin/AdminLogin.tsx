// @ts-nocheck
"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiMail, FiHash, FiShield, FiUser } from 'react-icons/fi'
import Button from '../../components/common/Button'
import Logo from '../../components/common/Logo'
import { useAuth } from '../../context/AuthContext'

type Step = 'email' | 'code' | 'name'

export default function AdminLogin() {
  const { sendCode, verifyCode, isAuthenticated, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Already admin → redirect
  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) router.push('/admin')
  }, [isAuthenticated, isAdmin, authLoading])

  // Authenticated but NOT admin → show error
  useEffect(() => {
    if (!authLoading && isAuthenticated && !isAdmin) {
      setError('This email does not have admin access.')
    }
  }, [isAuthenticated, isAdmin, authLoading])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await sendCode(email)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setStep('code')
    setCountdown(60)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await verifyCode(email, code)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    // New user needs a name first
    if (result.isNewUser) {
      setStep('name')
      return
    }

    // Check if user is admin after login
    // The auth context will update, and useEffect will redirect
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // OTP is still valid (not consumed for new users), re-submit with name
    const result = await verifyCode(email, code, name)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    // The auth context will update, and useEffect will redirect if admin
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-olive-dark px-4">
      <div className="w-full max-w-md bg-cream rounded-2xl p-8 sm:p-10 shadow-soft">
        <div className="flex justify-center mb-8">
          <Logo withTagline={false} />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2 text-olive">
          <FiShield size={18} />
          <h1 className="font-serif text-2xl text-charcoal">Admin Login</h1>
        </div>
        <p className="text-charcoal/50 text-sm text-center mb-7">
          {step === 'email'
            ? 'Enter your admin email to receive a verification code.'
            : step === 'code'
            ? `We sent a 6-digit code to ${email}`
            : 'Tell us your name to finish creating your admin account.'}
        </p>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</p>
        )}

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                className="w-full bg-white border border-charcoal/10 rounded-lg pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
            <Button type="submit" fullWidth size="lg" className="mt-2" disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </form>
        )}

        {/* Step 2: OTP Code */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="relative">
              <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" size={16} />
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
                className="w-full bg-white border border-charcoal/10 rounded-lg pl-11 pr-4 py-3.5 text-sm tracking-[0.3em] text-center font-medium focus:outline-none focus:ring-1 focus:ring-sage"
                autoFocus
              />
            </div>
            <Button type="submit" fullWidth size="lg" className="mt-2" disabled={loading || code.length < 6}>
              {loading ? 'Verifying...' : 'Log In to Dashboard'}
            </Button>
            <div className="flex items-center justify-between text-xs text-charcoal/50 mt-3">
              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError('') }}
                className="underline hover:text-charcoal/70"
              >
                ← Change email
              </button>
              {countdown > 0 ? (
                <span>Resend in {formatTime(countdown)}</span>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    const r = await sendCode(email)
                    if (r.success) { setCountdown(60); setCode('') }
                    else setError(r.error)
                  }}
                  className="text-olive underline hover:text-olive/80"
                >
                  Resend code
                </button>
              )}
            </div>
          </form>
        )}

        {/* Step 3: Name (new admin users) */}
        {step === 'name' && (
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" size={16} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-white border border-charcoal/10 rounded-lg pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-sage"
                autoFocus
              />
            </div>
            <Button type="submit" fullWidth size="lg" className="mt-2" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create Admin Account'}
            </Button>
          </form>
        )}

        <Link href="/" className="block text-center text-xs text-charcoal/40 underline mt-6">
          ← Back to store
        </Link>
      </div>
    </div>
  )
}

