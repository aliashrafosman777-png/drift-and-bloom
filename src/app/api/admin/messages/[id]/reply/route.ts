import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import { authenticateAdmin } from '@/middleware/auth'
import { sendReplyEmail } from '@/lib/emailService'
import { successResponse, errorResponse } from '@/utils/apiResponse'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/admin/messages/[id]/reply
 * Admin-protected — send a reply to a contact message via email.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()
    const { id } = await params
    const body = await req.json()

    if (!body.content?.trim()) {
      return errorResponse('Reply content is required.', 400)
    }

    const message = await Message.findById(id)
    if (!message) return errorResponse('Message not found.', 404)

    const adminName = body.adminName || 'Admin'
    const adminEmail = body.adminEmail || ''

    // Send email reply
    const emailResult = await sendReplyEmail(
      message.email,
      message.subject,
      body.content.trim(),
      message.name,
      adminName
    )

    if (!emailResult.success) {
      console.error('Email send failed:', emailResult.error)
      return errorResponse(
        `Reply saved but email failed to send: ${emailResult.error}`,
        500
      )
    }

    // Save reply to conversation history
    message.replies.push({
      content: body.content.trim(),
      adminName,
      adminEmail,
      createdAt: new Date(),
    })
    message.status = 'replied'
    message.isRead = true
    await message.save()

    return successResponse(
      message.toObject(),
      'Reply sent successfully.'
    )
  } catch (error) {
    console.error('Reply message error:', error)
    return errorResponse('Failed to send reply.', 500)
  }
}
