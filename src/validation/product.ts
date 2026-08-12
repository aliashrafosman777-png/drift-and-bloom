import { z } from 'zod'
import { AQUATIC_LIFE_TYPES, FISH_SUB_CATEGORIES } from '@/lib/fishProducts'

const durableImageSchema = z.string().refine(
  (value) =>
    value === '' ||
    (/^https:\/\//i.test(value) && !/^data:/i.test(value)) ||
    (/^\/(?!\/)/.test(value) && !/^data:/i.test(value)),
  'Images must use durable HTTPS storage or a deployed public asset path',
)

const plantOptionSchema = z.object({
  name: z.string().min(1),
  petFriendly: z.boolean().optional().default(false),
  note: z.string().optional().default(''),
})

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200).trim(),
  tagline: z.string().max(500).optional().default(''),
  description: z.string().max(5000).optional().default(''),
  shortDescription: z.string().max(500).optional().default(''),
  price: z.number().min(0, 'Price must be positive'),
  discount: z.number().min(0).optional().default(0),
  discountPrice: z.number().min(0).nullable().optional().default(null),
  stock: z.number().int().min(0).optional().default(0),
  sku: z.string().max(50).optional().default(''),
  category: z.array(z.string()).optional().default([]),
  subCategory: z.string().optional().default(''),
  brand: z.string().optional().default('Drift & Bloom'),
  images: z.array(durableImageSchema).max(8).optional().default([]),
  image: durableImageSchema.optional().default(''),
  thumbnail: durableImageSchema.optional().default(''),
  gallery: z.array(durableImageSchema).max(8).optional().default([]),
  colors: z.array(z.string()).optional().default([]),
  sizes: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  scent: z.string().optional().default(''),
  mood: z.array(z.string()).optional().default([]),
  includes: z.array(z.string()).optional().default([]),
  plantOptions: z.array(plantOptionSchema).optional().default([]),
  featured: z.boolean().optional().default(false),
  bestSeller: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  status: z.enum(['active', 'draft', 'out_of_stock']).optional().default('active'),
  rating: z.number().min(0).max(5).optional().default(0),
  reviewsCount: z.number().int().min(0).optional().default(0),
  story: z.string().optional().default(''),
  packageCategory: z.string().optional().default(''),
  fishSubCategory: z.enum(FISH_SUB_CATEGORIES).or(z.literal('')).optional().default(''),
  aquaticLifeType: z.enum(AQUATIC_LIFE_TYPES).or(z.literal('')).optional().default(''),
  imagePublicIds: z.array(z.string().min(1)).max(8).optional().default([]),
})

export const updateProductSchema = createProductSchema.partial().extend({
  version: z.number().int().min(0).optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
