import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { authenticate } from '@/middleware/auth'
import { successResponse, errorResponse } from '@/utils/apiResponse'

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const user = await User.findById(auth.userId)
    if (!user) {
      return errorResponse('User not found.', 404)
    }

    return successResponse({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('Profile error:', error)
    return errorResponse('Failed to fetch profile.', 500)
  }
}
