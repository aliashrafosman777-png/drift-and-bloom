import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import { authenticateAdmin } from '@/middleware/auth'
import { successResponse, errorResponse } from '@/utils/apiResponse'

/**
 * GET /api/admin/messages
 * Admin-protected — list messages with pagination, search, and filter.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '15', 10)))
    const skip = (page - 1) * limit
    const search = searchParams.get('search') || ''
    const statusFilter = searchParams.get('status') || ''

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {}

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ]
    }

    if (statusFilter === 'unread') filter.isRead = false
    else if (statusFilter === 'read') {
      filter.isRead = true
      filter.status = { $ne: 'replied' }
    } else if (statusFilter === 'replied') filter.status = 'replied'

    const [messages, total, unreadCount] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments(filter),
      Message.countDocuments({ isRead: false }),
    ])

    return successResponse({
      messages,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin messages error:', error)
    return errorResponse('Failed to fetch messages.', 500)
  }
}
