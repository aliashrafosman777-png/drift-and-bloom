import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100).trim(),
  description: z.string().max(1000).optional().default(''),
  image: z.string().optional().default(''),
  parentCategory: z.string().nullable().optional().default(null),
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
