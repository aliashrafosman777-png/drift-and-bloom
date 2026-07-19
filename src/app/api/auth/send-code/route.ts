import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { generateOTP, storeOTP, checkRateLimit } from '@/lib/otpStore'
import { sendOTPEmail } from '@/lib/emailService'
import { successResponse, errorResponse } from '@/utils/apiResponse'
import { z } from 'zod'

const sendCodeSchema = z.object({
  email: z.string().email('Please provide a valid email address').toLowerCase().trim(),
})

/**
 * POST /api/auth/send-code
 * Public — sends a 6-digit OTP to the given email.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = sendCodeSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid email.', 400)
    }

    const { email } = parsed.data

    // Rate limit
    const rateLimit = checkRateLimit(email)
    if (!rateLimit.allowed) {
      return errorResponse(
        `Too many attempts. Please try again in ${Math.ceil((rateLimit.timeUntilReset || 600) / 60)} minutes.`,
        429
      )
    }

    await connectDB()

    // Check if user exists
    const existingUser = await User.findOne({ email })
    const isNewUser = !existingUser

    // Generate and store OTP
    const otp = generateOTP()
    storeOTP(email, otp, isNewUser)

    // Send via Resend
    const emailResult = await sendOTPEmail(email, otp, isNewUser)

    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error)
      return errorResponse('Failed to send verification code. Please try again.', 500)
    }

    return successResponse(
      {
        email,
        expiresIn: 600, // 10 minutes
        remainingAttempts: rateLimit.remaining,
        isNewUser,
      },
      'Verification code sent to your email.'
    )
  } catch (error: any) {
    console.error('Send code error:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack?.slice(0, 500),
    })
    return errorResponse('Failed to send verification code.', 500)
  }
}
