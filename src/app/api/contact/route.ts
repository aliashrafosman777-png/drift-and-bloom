import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import { successResponse, errorResponse } from '@/utils/apiResponse'

/**
 * POST /api/contact
 * Public — submit a contact form message.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { name, email, phone, subject, message } = body

    // Validate
    if (!name?.trim()) return errorResponse('Name is required.', 400)
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return errorResponse('Valid email is required.', 400)
    if (!subject?.trim()) return errorResponse('Subject is required.', 400)
    if (!message?.trim() || message.trim().length < 10)
      return errorResponse('Message must be at least 10 characters.', 400)

    const msg = await Message.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      subject: subject.trim(),
      message: message.trim(),
    })

    return successResponse(
      { id: msg._id },
      'Message sent successfully. We will get back to you soon!',
      201
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return errorResponse('Failed to send message. Please try again.', 500)
  }
}
