import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IOTP extends Document {
  email: string
  hashedOTP: string
  attempts: number
  isNewUser: boolean
  expiresAt: Date
  createdAt: Date
}

const OTPSchema = new Schema<IOTP>(
  {
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    hashedOTP: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    isNewUser: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
)

// Auto-expire documents after 10 minutes (TTL index)
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const OTP: Model<IOTP> =
  mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema)

export default OTP
