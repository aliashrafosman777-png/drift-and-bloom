import crypto from 'crypto'

/**
 * OTP Store — In-memory storage for OTP codes with rate limiting.
 * In production, replace with Redis for multi-instance support.
 * Matches the qaser/ALKASR pattern exactly.
 */

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 10 * 60 * 1000 // 10 minutes
const MAX_ATTEMPTS_PER_WINDOW = 3
const OTP_EXPIRY_TIME = 10 * 60 * 1000 // 10 minutes
const MAX_VERIFY_ATTEMPTS = 5

// In-memory stores
const otpAttempts = new Map<string, { count: number; firstAttempt: number }>()
const otpCodes = new Map<
  string,
  {
    hashedOTP: string
    expiresAt: number
    attempts: number
    isNewUser: boolean
  }
>()

/** Generate a 6-digit OTP code. */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/** Hash an OTP with SHA-256 (never store raw OTP). */
export function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

/** Check rate limit for an email. Returns allowed status + remaining attempts. */
export function checkRateLimit(email: string): {
  allowed: boolean
  remaining: number
  timeUntilReset?: number
} {
  const now = Date.now()
  const attempts = otpAttempts.get(email) || { count: 0, firstAttempt: now }

  // Reset if window has passed
  if (now - attempts.firstAttempt > RATE_LIMIT_WINDOW) {
    otpAttempts.set(email, { count: 1, firstAttempt: now })
    return { allowed: true, remaining: MAX_ATTEMPTS_PER_WINDOW - 1 }
  }

  // Check if limit exceeded
  if (attempts.count >= MAX_ATTEMPTS_PER_WINDOW) {
    const timeUntilReset = RATE_LIMIT_WINDOW - (now - attempts.firstAttempt)
    return {
      allowed: false,
      remaining: 0,
      timeUntilReset: Math.ceil(timeUntilReset / 1000),
    }
  }

  // Increment attempts
  otpAttempts.set(email, { ...attempts, count: attempts.count + 1 })
  return { allowed: true, remaining: MAX_ATTEMPTS_PER_WINDOW - attempts.count - 1 }
}

/** Store a hashed OTP for an email with expiry. */
export function storeOTP(email: string, otp: string, isNewUser: boolean): void {
  otpCodes.set(email, {
    hashedOTP: hashOTP(otp),
    expiresAt: Date.now() + OTP_EXPIRY_TIME,
    attempts: 0,
    isNewUser,
  })
}

/**
 * Verify an OTP code for an email.
 * If consume=false, the OTP is NOT deleted — useful for the "new user needs name" flow
 * where the frontend will call verify-code again with the name.
 */
export function verifyOTP(
  email: string,
  code: string,
  consume: boolean = true
): {
  valid: boolean
  error?: string
  errorCode?: string
  isNewUser?: boolean
  remainingAttempts?: number
} {
  const stored = otpCodes.get(email)

  if (!stored) {
    return {
      valid: false,
      error: 'No verification code found. Please request a new code.',
      errorCode: 'NO_CODE_FOUND',
    }
  }

  // Check expiry
  if (Date.now() > stored.expiresAt) {
    otpCodes.delete(email)
    return {
      valid: false,
      error: 'Verification code has expired. Please request a new code.',
      errorCode: 'CODE_EXPIRED',
    }
  }

  // Check max attempts
  if (stored.attempts >= MAX_VERIFY_ATTEMPTS) {
    otpCodes.delete(email)
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
    otpCodes.set(email, stored)
    const remaining = MAX_VERIFY_ATTEMPTS - stored.attempts

    return {
      valid: false,
      error: `Invalid verification code. ${remaining} attempts remaining.`,
      errorCode: 'INVALID_CODE',
      remainingAttempts: remaining,
    }
  }

  // Valid — optionally consume
  const { isNewUser } = stored
  if (consume) {
    otpCodes.delete(email)
  }
  return { valid: true, isNewUser }
}

