import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAddress {
  street: string
  city: string
  state: string
  zip: string
  country: string
  isDefault: boolean
}

export interface IUser extends Document {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'admin' | 'customer'
  isVerified: boolean
  lastLogin: Date | null
  wishlist: mongoose.Types.ObjectId[]
  cart: Array<{
    product: mongoose.Types.ObjectId
    quantity: number
    plantOption?: string
  }>
  addresses: IAddress[]
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
    country: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
)

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, default: '', trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, default: '' },
    role: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer',
    },
    isVerified: {
      type: Boolean,
      default: true, // Always true — verified via email OTP
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    cart: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        plantOption: { type: String, default: '' },
      },
    ],
    addresses: { type: [AddressSchema], default: [] },
  },
  {
    timestamps: true,
  }
)

// Indexes
UserSchema.index({ role: 1 })
UserSchema.index({ createdAt: -1 })

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
