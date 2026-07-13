import { z } from 'zod'

const orderItemSchema = z.object({
  product: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
  plantOption: z.string().optional().default(''),
  image: z.string().optional().default(''),
})

const shippingAddressSchema = z.object({
  street: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  zip: z.string().optional().default(''),
  country: z.string().optional().default(''),
})

export const createOrderSchema = z.object({
  // Customer contact info (for both guest and logged-in checkout)
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Valid email is required'),

  // Order items
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),

  // Pricing
  subtotal: z.number().min(0),
  discount: z.number().min(0).optional().default(0),
  shipping: z.number().min(0).optional().default(0),
  tax: z.number().min(0).optional().default(0),
  total: z.number().min(0),

  // Payment & delivery
  paymentMethod: z.string().optional().default('Card'),
  shippingAddress: shippingAddressSchema.optional(),

  // Extra info
  notes: z.string().optional().default(''),
  giftMessage: z.string().optional().default(''),
  instructionLanguage: z.enum(['English', 'Arabic']).optional().default('English'),
})

export const updateOrderStatusSchema = z.object({
  orderStatus: z
    .enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])
    .optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
  trackingNumber: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
