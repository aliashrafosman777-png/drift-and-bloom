import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Order from '@/models/Order'
import { authenticateAdmin } from '@/middleware/auth'
import { successResponse, errorResponse } from '@/utils/apiResponse'

/**
 * GET /api/admin/customers
 * Admin-protected — list customers with pagination & search.
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { role: 'customer' }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('firstName lastName email phone createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ])

    // Enrich with order stats
    const customerIds = users.map((u) => u._id)
    const orderStats = await Order.aggregate([
      { $match: { customer: { $in: customerIds } } },
      {
        $group: {
          _id: '$customer',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
        },
      },
    ])

    const statsMap = new Map(orderStats.map((s) => [s._id.toString(), s]))

    const customers = users.map((u) => {
      const stats = statsMap.get(u._id.toString())
      return {
        ...u,
        name: `${u.firstName} ${u.lastName || ''}`.trim(),
        totalOrders: stats?.totalOrders || 0,
        totalSpent: stats?.totalSpent || 0,
      }
    })

    return successResponse({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin customers error:', error)
    return errorResponse('Failed to fetch customers.', 500)
  }
}
