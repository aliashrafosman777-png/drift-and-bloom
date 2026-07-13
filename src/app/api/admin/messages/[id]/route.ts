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
 * GET /api/admin/messages/[id]
 * Admin-protected — get single message with full conversation.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()
    const { id } = await params

    const message = await Message.findById(id).lean()
    if (!message) return errorResponse('Message not found.', 404)

    return successResponse(message)
  } catch (error) {
    console.error('Get message error:', error)
    return errorResponse('Failed to fetch message.', 500)
  }
}

/**
 * POST /api/admin/messages/[id]
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

/**
 * PATCH /api/admin/messages/[id]
 * Admin-protected — update message (mark read/unread).
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()
    const { id } = await params
    const body = await req.json()

    const updateData: Record<string, unknown> = {}

    if (typeof body.isRead === 'boolean') {
      updateData.isRead = body.isRead
      if (body.isRead) {
        // Only set status to 'read' if not already 'replied'
        const existing = await Message.findById(id).select('status').lean()
        if (existing && existing.status !== 'replied') {
          updateData.status = 'read'
        }
      } else {
        updateData.status = 'unread'
      }
    }

    const message = await Message.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean()

    if (!message) return errorResponse('Message not found.', 404)

    return successResponse(message, 'Message updated.')
  } catch (error) {
    console.error('Update message error:', error)
    return errorResponse('Failed to update message.', 500)
  }
}

/**
 * DELETE /api/admin/messages/[id]
 * Admin-protected — delete a message.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()
    const { id } = await params

    const message = await Message.findByIdAndDelete(id).lean()
    if (!message) return errorResponse('Message not found.', 404)

    return successResponse(null, 'Message deleted successfully.')
  } catch (error) {
    console.error('Delete message error:', error)
    return errorResponse('Failed to delete message.', 500)
  }
}
