import { z } from 'zod'

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be 1–5').max(5),
  comment: z.string().max(2000).optional().default(''),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
