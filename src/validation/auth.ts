import { z } from 'zod'

/**
 * Auth validation schemas for OTP-based authentication.
 * No password fields — all auth is via email OTP codes.
 */

export const sendCodeSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
})

export const verifyCodeSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must be numeric'),
  name: z
    .string()
    .max(100, 'Name must be 100 characters or less')
    .optional(),
})

export type SendCodeInput = z.infer<typeof sendCodeSchema>
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>
