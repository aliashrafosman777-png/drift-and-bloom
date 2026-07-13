import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'
import { authenticate, authenticateAdmin } from '@/middleware/auth'
import { createOrderSchema } from '@/validation/order'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/utils/apiResponse'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { sendOrderConfirmationEmail } from '@/lib/emailService'

/**
 * Try to get the logged-in user ID from the token, or return null for guests.
 */
function getOptionalUserId(req: NextRequest): string | null {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return null
    const decoded = verifyToken(token)
    return decoded.userId
  } catch {
    return null
  }
}

/**
 * GET /api/orders
 * Auth-protected.
 *   Admin: all orders (paginated, filterable by status)
 *   Customer: only their orders
 */
export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req)
    if (auth instanceof NextResponse) return auth

    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {}

    // Customers can only see their own orders
    if (auth.role !== 'admin') {
      filter.customer = auth.userId
    }

    // Status filter
    const status = searchParams.get('status')
    if (status && status !== 'All') {
      filter.orderStatus = status
    }

    // Search by order ID
    const search = searchParams.get('search')
    if (search) {
      filter.$or = [
        { _id: { $regex: search, $options: 'i' } },
      ]
    }

    // Sort
    const sort = searchParams.get('sort') || 'newest'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortQuery: Record<string, any> = { createdAt: -1 }
    if (sort === 'oldest') sortQuery = { createdAt: 1 }
    if (sort === 'total-asc') sortQuery = { total: 1 }
    if (sort === 'total-desc') sortQuery = { total: -1 }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'firstName lastName email')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ])

    return successResponse({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get orders error:', error)
    return errorResponse('Failed to fetch orders.', 500)
  }
}

/**
 * POST /api/orders
 * Public — supports both guest checkout and logged-in checkout.
 * If the user has a valid JWT, the order is linked to their account.
 * Otherwise, it's a guest order with contact info stored directly.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const parsed = createOrderSchema.safeParse(body)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    // Resolve product references — handle both ObjectIds and slugs
    const resolvedItems = await Promise.all(
      parsed.data.items.map(async (item) => {
        // If it's already a valid 24-char hex ObjectId, use as-is
        if (/^[0-9a-fA-F]{24}$/.test(item.product)) {
          return item
        }

        // Otherwise it's a slug — look up the real product _id
        const product = await Product.findOne({ slug: item.product }).select('_id').lean()
        if (!product) {
          throw new Error(`Product not found: ${item.product}`)
        }

        return { ...item, product: product._id.toString() }
      })
    )

    // Try to link to logged-in user (optional)
    const userId = getOptionalUserId(req)

    const order = await Order.create({
      ...parsed.data,
      items: resolvedItems,
      customer: userId || null,
      paymentStatus: 'pending',
      orderStatus: 'Pending',
    })

    // Populate customer for response if linked
    if (userId) {
      await order.populate('customer', 'firstName lastName email')
    }

    // Fire-and-forget: send order confirmation email (never block order completion)
    sendOrderConfirmationEmail({
      orderId: order._id.toString(),
      fullName: order.fullName,
      email: order.email,
      items: order.items.map((item: any) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        plantOption: item.plantOption,
        image: item.image,
      })),
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      giftMessage: order.giftMessage,
      createdAt: order.createdAt,
    }).catch((err) =>
      console.error('Order confirmation email failed (non-blocking):', err)
    )

    return successResponse(order, 'Order placed successfully.', 201)
  } catch (error) {
    console.error('Create order error:', error)
    return errorResponse('Failed to place order.', 500)
  }
}

