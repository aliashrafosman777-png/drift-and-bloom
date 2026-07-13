import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Order from '@/models/Order'
import { authenticateAdmin } from '@/middleware/auth'
import { successResponse, errorResponse } from '@/utils/apiResponse'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/customers/[id]
 * Admin-protected — get single customer with order history.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const { id } = await params
    const user = await User.findById(id)
      .select('firstName lastName email phone createdAt')
      .lean()

    if (!user) {
      return errorResponse('Customer not found.', 404)
    }

    const orders = await Order.find({ customer: id })
      .select('_id total orderStatus createdAt items fullName')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0)

    return successResponse({
      ...user,
      name: `${user.firstName} ${user.lastName || ''}`.trim(),
      totalOrders: orders.length,
      totalSpent,
      orders,
    })
  } catch (error) {
    console.error('Get customer error:', error)
    return errorResponse('Failed to fetch customer.', 500)
  }
}

/**
 * DELETE /api/admin/customers/[id]
 * Admin-protected — delete customer account.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const { id } = await params
    const user = await User.findByIdAndDelete(id).lean()

    if (!user) {
      return errorResponse('Customer not found.', 404)
    }

    return successResponse(null, 'Customer deleted successfully.')
  } catch (error) {
    console.error('Delete customer error:', error)
    return errorResponse('Failed to delete customer.', 500)
  }
}
