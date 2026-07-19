import crypto from 'crypto'
import OTP from '@/models/OTP'
import connectDB from '@/lib/mongodb'

const RATE_LIMIT_WINDOW = 10 * 60 * 1000 // 10 minutes
const MAX_ATTEMPTS_PER_WINDOW = 5
const OTP_EXPIRY_TIME = 10 * 60 * 1000 // 10 minutes
const MAX_VERIFY_ATTEMPTS = 5

/** Generate a 6-digit OTP code. */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/** Hash an OTP with SHA-256 (never store raw OTP). */
export function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

/** Check rate limit for an email using MongoDB. */
export async function checkRateLimit(email: string): Promise<{
  allowed: boolean
  remaining: number
  timeUntilReset?: number
}> {
  await connectDB()
  const normalizedEmail = email.toLowerCase().trim()
  const now = new Date()

  // Find recent OTP attempts within the window
  const tenMinutesAgo = new Date(Date.now() - RATE_LIMIT_WINDOW)
  const recentCount = await OTP.countDocuments({
    email: normalizedEmail,
    createdAt: { $gte: tenMinutesAgo },
  })

  if (recentCount >= MAX_ATTEMPTS_PER_WINDOW) {
    const oldestDoc = await OTP.findOne({
      email: normalizedEmail,
      createdAt: { $gte: tenMinutesAgo },
    }).sort({ createdAt: 1 })

    const resetMs = oldestDoc
      ? RATE_LIMIT_WINDOW - (now.getTime() - oldestDoc.createdAt.getTime())
      : RATE_LIMIT_WINDOW

    return {
      allowed: false,
      remaining: 0,
      timeUntilReset: Math.max(1, Math.ceil(resetMs / 1000)),
    }
  }

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS_PER_WINDOW - recentCount - 1,
  }
}

/** Store a hashed OTP in MongoDB for multi-instance Vercel support. */
export async function storeOTP(
  email: string,
  otp: string,
  isNewUser: boolean
): Promise<void> {
  await connectDB()
  const normalizedEmail = email.toLowerCase().trim()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_TIME)

  // Remove existing active OTP for this email
  await OTP.deleteMany({ email: normalizedEmail })

  // Insert new OTP
  await OTP.create({
    email: normalizedEmail,
    hashedOTP: hashOTP(otp),
    attempts: 0,
    isNewUser,
    expiresAt,
  })
}

/**
 * Verify an OTP code for an email using MongoDB.
 */
export async function verifyOTP(
  email: string,
  code: string,
  consume: boolean = true
): Promise<{
  valid: boolean
  error?: string
  errorCode?: string
  isNewUser?: boolean
  remainingAttempts?: number
}> {
  await connectDB()
  const normalizedEmail = email.toLowerCase().trim()
  const stored = await OTP.findOne({ email: normalizedEmail }).sort({ createdAt: -1 })

  if (!stored) {
    return {
      valid: false,
      error: 'No verification code found. Please request a new code.',
      errorCode: 'NO_CODE_FOUND',
    }
  }

  // Check expiry
  if (new Date() > stored.expiresAt) {
    await OTP.deleteOne({ _id: stored._id })
    return {
      valid: false,
      error: 'Verification code has expired. Please request a new code.',
      errorCode: 'CODE_EXPIRED',
    }
  }

  // Check max attempts
  if (stored.attempts >= MAX_VERIFY_ATTEMPTS) {
    await OTP.deleteOne({ _id: stored._id })
    return {
      valid: false,
      error: 'Maximum verification attempts exceeded. Please request a new code.',
      errorCode: 'MAX_ATTEMPTS_EXCEEDED',
    }
  }

  // Verify hash
  const hashedInput = hashOTP(code)
  if (hashedInput !== stored.hashedOTP) {
    stored.attempts += 1
    await stored.save()
    const remaining = MAX_VERIFY_ATTEMPTS - stored.attempts

    return {
      valid: false,
      error: `Invalid verification code. ${remaining} attempts remaining.`,
      errorCode: 'INVALID_CODE',
      remainingAttempts: remaining,
    }
  }

  // Valid — optionally consume
  const isNewUser = stored.isNewUser
  if (consume) {
    await OTP.deleteOne({ _id: stored._id })
  }

  return { valid: true, isNewUser }
}
