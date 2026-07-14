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
  console.log('[Checkout] ── Incoming order request ──')

  try {
    // ── Step 1: Connect to database ──────────────────────────────────
    await connectDB()
    console.log('[Checkout] ✓ MongoDB connected')

    // ── Step 2: Parse and validate request body ──────────────────────
    let body: unknown
    try {
      body = await req.json()
    } catch {
      console.error('[Checkout] ✗ Invalid JSON body')
      return errorResponse('Invalid request body. Please try again.', 400)
    }

    const parsed = createOrderSchema.safeParse(body)

    if (!parsed.success) {
      const messages = parsed.error.issues.map(
        (e) => `${e.path.join('.')}: ${e.message}`
      )
      console.error('[Checkout] ✗ Validation failed:', messages)
      return validationErrorResponse(parsed.error)
    }

    console.log('[Checkout] ✓ Payload validated —', parsed.data.items.length, 'item(s)')

    // ── Step 3: Sanitize inputs ──────────────────────────────────────
    const sanitizedEmail = parsed.data.email.trim().toLowerCase()
    const sanitizedPhone = parsed.data.phone.trim()
    const sanitizedName = parsed.data.fullName.trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return errorResponse('Invalid email address.', 400)
    }

    const phoneDigits = sanitizedPhone.replace(/\D/g, '')
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      return errorResponse('Invalid phone number.', 400)
    }

    // ── Step 4: Resolve product references ───────────────────────────
    console.log('[Checkout] Resolving product references...')

    const resolvedItems = []
    for (const item of parsed.data.items) {
      // Custom packages don't reference a real product
      if (item.isCustomPackage || !item.product || item.product.startsWith('custom-package-')) {
        console.log('[Checkout]   → Custom package:', item.name, '— skipping product lookup')
        resolvedItems.push({
          ...item,
          product: null,
          isCustomPackage: true,
        })
        continue
      }

      // If it's a valid 24-char hex ObjectId, try to verify the product exists
      if (/^[0-9a-fA-F]{24}$/.test(item.product)) {
        try {
          const product = await Product.findById(item.product).select('_id name price isActive').lean()
          if (product) {
            console.log('[Checkout]   → Resolved by ID:', (product as any).name || item.name)
            resolvedItems.push({ ...item, product: (product as any)._id.toString() })
          } else {
            // Product not found by ID — still allow order (cart has all needed data)
            console.warn('[Checkout]   ⚠ Product not found by ID:', item.product, '— proceeding with cart data')
            resolvedItems.push({ ...item, product: null })
          }
        } catch (lookupErr) {
          console.warn('[Checkout]   ⚠ Product lookup error:', (lookupErr as Error).message, '— proceeding with cart data')
          resolvedItems.push({ ...item, product: null })
        }
        continue
      }

      // Otherwise treat as a slug — try to look up the real product _id
      try {
        const product = await Product.findOne({ slug: item.product }).select('_id name price isActive').lean()
        if (product) {
          console.log('[Checkout]   → Resolved by slug:', (product as any).name || item.name)
          resolvedItems.push({ ...item, product: (product as any)._id.toString() })
        } else {
          // Product not found by slug — still allow order (cart has all needed data)
          console.warn('[Checkout]   ⚠ Product not found by slug:', item.product, '— proceeding with cart data')
          resolvedItems.push({ ...item, product: null })
        }
      } catch (lookupErr) {
        console.warn('[Checkout]   ⚠ Product slug lookup error:', (lookupErr as Error).message, '— proceeding with cart data')
        resolvedItems.push({ ...item, product: null })
      }
    }

    console.log('[Checkout] ✓ All', resolvedItems.length, 'item(s) resolved')

    // ── Step 5: Try to link to logged-in user (optional) ─────────────
    const userId = getOptionalUserId(req)
    if (userId) {
      console.log('[Checkout] ✓ Linked to user:', userId)
    } else {
      console.log('[Checkout] ○ Guest checkout')
    }

    // ── Step 6: Create the order ─────────────────────────────────────
    console.log('[Checkout] Creating order in database...')

    const order = await Order.create({
      ...parsed.data,
      fullName: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      items: resolvedItems,
      customer: userId || null,
      paymentStatus: 'pending',
      orderStatus: 'Pending',
    })

    console.log('[Checkout] ✓ Order saved:', order._id.toString())

    // Populate customer for response if linked
    if (userId) {
      await order.populate('customer', 'firstName lastName email')
    }

    // ── Step 7: Send confirmation email (awaited so Vercel doesn't kill the promise) ──
    console.log('[Checkout] Sending confirmation email...')
    try {
      await sendOrderConfirmationEmail({
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
      })
      console.log('[Checkout] ✓ Confirmation email sent to', order.email)
    } catch (emailErr) {
      // Email failure must NEVER block the order response
      console.error('[Checkout] ⚠ Confirmation email failed (non-blocking):', (emailErr as Error)?.message || emailErr)
    }

    console.log('[Checkout] ── Order complete ──', order._id.toString())

    return successResponse(order, 'Order placed successfully.', 201)
  } catch (error: unknown) {
    // ── Return the REAL error message, not a generic one ─────────────
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    const stack = error instanceof Error ? error.stack : undefined

    console.error('[Checkout] ✗ FATAL ERROR:', message)
    if (stack) console.error('[Checkout] Stack:', stack)

    // In production, don't leak internal details — but still give something useful
    const clientMessage = process.env.NODE_ENV === 'development'
      ? message
      : message.startsWith('Product ')
        ? message // Product-related errors are safe to show
        : 'Something went wrong while placing your order. Please try again or contact support.'

    return errorResponse(clientMessage, 500)
  }
}

