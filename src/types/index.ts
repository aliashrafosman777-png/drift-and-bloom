/**
 * Shared TypeScript types used across frontend and API.
 */

export interface ProductType {
  _id: string
  id: string  // alias for frontend compatibility
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
  // Frontend compatibility: categories alias
  categories: string[]
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
  plantOptions: PlantOptionType[]
  featured: boolean
  bestSeller: boolean
  isActive: boolean
  rating: number
  reviewsCount: number
  reviews: number // alias for frontend compatibility
  story: string
  packageCategory: string
  createdAt: string
  updatedAt: string
}

export interface PlantOptionType {
  name: string
  petFriendly: boolean
  note: string
}

export interface CategoryType {
  _id: string
  name: string
  slug: string
  description: string
  image: string
  parentCategory: string | null
  createdAt: string
  updatedAt: string
}

export interface UserType {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'customer'
  phone: string
  createdAt: string
}

export interface OrderType {
  _id: string
  customer: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  items: OrderItemType[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed'
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  shippingAddress: ShippingAddressType
  trackingNumber: string
  createdAt: string
  updatedAt: string
}

export interface OrderItemType {
  product: string
  name: string
  price: number
  quantity: number
  plantOption: string
  image: string
}

export interface ShippingAddressType {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface ReviewType {
  _id: string
  user: {
    _id: string
    firstName: string
    lastName: string
  }
  product: string
  rating: number
  comment: string
  createdAt: string
}

export interface CouponType {
  _id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  expirationDate: string
  isActive: boolean
  createdAt: string
}

export interface PaginationType {
  page: number
  limit: number
  total: number
  pages: number
}

export interface DashboardStatsType {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalPackages: number
  recentOrders: OrderType[]
}
