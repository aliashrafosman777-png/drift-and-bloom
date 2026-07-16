import { NextRequest, NextResponse } from 'next/server'
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

    return successResponse(user.gameProgress || null)
  } catch (error) {
    console.error('Fetch game progress error:', error)
    return errorResponse('Failed to fetch game progress.', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req)
    if (auth instanceof NextResponse) return auth

    const body = await req.json()
    const { currentIdx, answers, done, result } = body

    await connectDB()

    const user = await User.findById(auth.userId)
    if (!user) {
      return errorResponse('User not found.', 404)
    }

    user.gameProgress = {
      currentIdx: typeof currentIdx === 'number' ? currentIdx : 0,
      answers: answers || {},
      done: !!done,
      result: result || null,
    }

    await user.save()

    return successResponse(user.gameProgress, 'Game progress updated successfully.')
  } catch (error) {
    console.error('Save game progress error:', error)
    return errorResponse('Failed to save game progress.', 500)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = authenticate(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const user = await User.findById(auth.userId)
    if (!user) {
      return errorResponse('User not found.', 404)
    }

    user.gameProgress = null
    await user.save()

    return successResponse(null, 'Game progress reset successfully.')
  } catch (error) {
    console.error('Reset game progress error:', error)
    return errorResponse('Failed to reset game progress.', 500)
  }
}
