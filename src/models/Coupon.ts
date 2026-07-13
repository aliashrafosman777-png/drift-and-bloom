import mongoose, { Schema, Document, Model } from 'mongoose'

export type DiscountType = 'percentage' | 'fixed'

export interface ICoupon extends Document {
  code: string
  discountType: DiscountType
  discountValue: number
  expirationDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    expirationDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema)

export default Coupon
