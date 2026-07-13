import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IOrderItem {
  product: mongoose.Types.ObjectId
  name: string
  price: number
  quantity: number
  plantOption: string
  image: string
}

export interface IShippingAddress {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export type PaymentStatus = 'pending' | 'paid' | 'failed'
export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'

export interface IOrder extends Document {
  customer: mongoose.Types.ObjectId | null
  fullName: string
  phone: string
  email: string
  items: IOrderItem[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  paymentMethod: string
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  shippingAddress: IShippingAddress
  trackingNumber: string
  notes: string
  giftMessage: string
  instructionLanguage: string
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    plantOption: { type: String, default: '' },
    image: { type: String, default: '' },
  },
  { _id: false }
)

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
    country: { type: String, default: '' },
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrder>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: 'Card' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    shippingAddress: { type: ShippingAddressSchema, default: () => ({}) },
    trackingNumber: { type: String, default: '' },
    notes: { type: String, default: '' },
    giftMessage: { type: String, default: '' },
    instructionLanguage: { type: String, default: 'English' },
  },
  {
    timestamps: true,
  }
)

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)

export default Order
