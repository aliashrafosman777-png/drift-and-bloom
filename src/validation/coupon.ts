import { z } from 'zod'

export const createCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').max(50).toUpperCase().trim(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(0, 'Discount value must be positive'),
  expirationDate: z.string().or(z.date()).transform((val) => new Date(val)),
  isActive: z.boolean().optional().default(true),
})

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').toUpperCase().trim(),
})

export type CreateCouponInput = z.infer<typeof createCouponSchema>
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>
