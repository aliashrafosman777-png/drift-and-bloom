import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { authenticate, authenticateAdmin } from '@/middleware/auth'
import { updateOrderStatusSchema } from '@/validation/order'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/utils/apiResponse'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/orders/[id]
 * Auth-protected — own order or admin.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticate(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const { id } = await params

    const order = await Order.findById(id)
      .populate('customer', 'firstName lastName email')
      .lean()

    if (!order) {
      return errorResponse('Order not found.', 404)
    }

    // Customers can only view their own orders
    if (
      auth.role !== 'admin' &&
      order.customer?._id?.toString() !== auth.userId
    ) {
      return errorResponse('Access denied.', 403)
    }

    return successResponse(order)
  } catch (error) {
    console.error('Get order error:', error)
    return errorResponse('Failed to fetch order.', 500)
  }
}

/**
 * PUT /api/orders/[id]
 * Admin-protected — update order status, tracking, payment status.
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const { id } = await params
    const body = await req.json()
    const parsed = updateOrderStatusSchema.safeParse(body)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    const order = await Order.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    })
      .populate('customer', 'firstName lastName email')
      .lean()

    if (!order) {
      return errorResponse('Order not found.', 404)
    }

    return successResponse(order, 'Order updated successfully.')
  } catch (error) {
    console.error('Update order error:', error)
    return errorResponse('Failed to update order.', 500)
  }
}

/**
 * DELETE /api/orders/[id]
 * Admin-protected.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const { id } = await params
    const order = await Order.findByIdAndDelete(id).lean()

    if (!order) {
      return errorResponse('Order not found.', 404)
    }

    return successResponse(null, 'Order deleted successfully.')
  } catch (error) {
    console.error('Delete order error:', error)
    return errorResponse('Failed to delete order.', 500)
  }
}
