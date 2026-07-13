import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPlantOption {
  name: string
  petFriendly: boolean
  note: string
}

export interface IProduct extends Document {
  name: string
  slug: string
  tagline: string
  description: string
  shortDescription: string
  price: number
  discount: number
  discountPrice: number | null
  stock: number
  sku: string
  category: string[]
  subCategory: string
  brand: string
  images: string[]
  image: string
  thumbnail: string
  gallery: string[]
  colors: string[]
  sizes: string[]
  tags: string[]
  scent: string
  mood: string[]
  includes: string[]
  plantOptions: IPlantOption[]
  featured: boolean
  bestSeller: boolean
  isActive: boolean
  rating: number
  reviewsCount: number
  // Package builder fields
  shortDescription2: string
  story: string
  packageCategory: string
  createdAt: Date
  updatedAt: Date
}

const PlantOptionSchema = new Schema<IPlantOption>(
  {
    name: { type: String, required: true },
    petFriendly: { type: Boolean, default: false },
    note: { type: String, default: '' },
  },
  { _id: false }
)

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    tagline: { type: String, default: '' },
    description: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    discountPrice: { type: Number, default: null },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, default: '' },
    category: { type: [String], default: [], index: true },
    subCategory: { type: String, default: '' },
    brand: { type: String, default: 'Drift & Bloom' },
    images: { type: [String], default: [] },
    image: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    scent: { type: String, default: '' },
    mood: { type: [String], default: [] },
    includes: { type: [String], default: [] },
    plantOptions: { type: [PlantOptionSchema], default: [] },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    // Package builder fields
    story: { type: String, default: '' },
    packageCategory: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
)

// Text index for search
ProductSchema.index({ name: 'text', description: 'text', tagline: 'text' })

// Compound index for filtered product listings
ProductSchema.index({ category: 1, price: 1 })
ProductSchema.index({ isActive: 1, bestSeller: 1 })

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)

export default Product
