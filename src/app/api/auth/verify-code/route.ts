import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { signToken } from '@/lib/auth'
import { isAdminEmail } from '@/middleware/auth'
import { verifyOTP } from '@/lib/otpStore'
import { successResponse, errorResponse } from '@/utils/apiResponse'
import { z } from 'zod'

const verifyCodeSchema = z.object({
  email: z.string().email('Please provide a valid email address').toLowerCase().trim(),
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must be numeric'),
  name: z.string().max(100).optional(),
})

/**
 * POST /api/auth/verify-code
 * Public — verifies OTP and either logs in or creates a new account.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = verifyCodeSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid input.', 400)
    }

    const { email, code, name } = parsed.data

    await connectDB()

    // Check if user exists BEFORE consuming the OTP
    const existingUser = await User.findOne({ email })
    const isNewUserInDb = !existingUser
    const needsName = isNewUserInDb && (!name || name.trim().length === 0)

    // Verify OTP — don't consume if we need to ask for name
    const result = verifyOTP(email, code, !needsName)

    if (!result.valid) {
      const status =
        result.errorCode === 'MAX_ATTEMPTS_EXCEEDED' ? 429 :
          result.errorCode === 'CODE_EXPIRED' ? 400 :
            400
      return errorResponse(result.error || 'Verification failed.', status)
    }

    if (existingUser) {
      // Existing user → log them in
      existingUser.lastLogin = new Date()

      // Auto-upgrade admin role for whitelisted emails (like qaser)
      if (isAdminEmail(existingUser.email) && existingUser.role !== 'admin') {
        existingUser.role = 'admin'
      }

      await existingUser.save()

      const token = signToken(existingUser._id.toString(), existingUser.role)

      return successResponse(
        {
          token,
          user: {
            id: existingUser._id,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            email: existingUser.email,
            role: existingUser.role,
          },
        },
        'Login successful! Welcome back.'
      )
    } else {
      // New user
      if (needsName) {
        // OTP is still valid — frontend will re-submit with name
        return successResponse(
          { isNewUser: true, email },
          'Name is required for new accounts.'
        )
      }

      // Split name into first/last
      const parts = name.trim().split(/\s+/)
      const firstName = parts[0]
      const lastName = parts.slice(1).join(' ')

      // Create new user
      const role = isAdminEmail(email) ? 'admin' : 'customer'
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        role,
        isVerified: true,
        lastLogin: new Date(),
      })

      const token = signToken(newUser._id.toString(), newUser.role)

      return successResponse(
        {
          token,
          user: {
            id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            role: newUser.role,
          },
        },
        'Account created successfully! Welcome to Drift & Bloom.',
        201
      )
    }
  } catch (error: any) {
    console.error('Verify code error:', error)

    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return errorResponse('An account with this email already exists.', 409)
    }

    return errorResponse('Verification failed. Please try again.', 500)
  }
}
