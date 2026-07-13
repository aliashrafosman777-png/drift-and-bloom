import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import User from '@/models/User'
import Product from '@/models/Product'
import { authenticateAdmin } from '@/middleware/auth'
import { successResponse, errorResponse } from '@/utils/apiResponse'

/**
 * GET /api/admin/stats
 * Admin-protected — aggregate dashboard statistics from the database.
 * Returns overview stats, monthly revenue, top products, status distribution, and recent orders.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = authenticateAdmin(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const [
      totalRevenueAgg,
      totalOrders,
      totalCustomers,
      totalPackages,
      recentOrders,
      monthlyRevenue,
      topProducts,
      orderStatusAgg,
    ] = await Promise.all([
      // Sum all non-cancelled order totals
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      // Recent 5 orders
      Order.find()
        .populate('customer', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      // Monthly revenue (last 12 months)
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
      // Top 5 selling products
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            productName: { $first: '$items.name' },
            totalSold: { $sum: '$items.quantity' },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
      // Order status distribution
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      ]),
    ])

    // Build status stats object
    const orderStatusStats: Record<string, number> = {}
    for (const s of orderStatusAgg) {
      if (s._id) orderStatusStats[s._id] = s.count
    }

    return successResponse({
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      totalOrders,
      totalCustomers,
      totalPackages,
      recentOrders,
      monthlyRevenue,
      topProducts,
      orderStatusStats,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return errorResponse('Failed to fetch dashboard stats.', 500)
  }
}
