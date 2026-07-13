import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReply {
  content: string
  adminName: string
  adminEmail: string
  createdAt: Date
}

export interface IMessage extends Document {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  isRead: boolean
  status: 'unread' | 'read' | 'replied'
  replies: IReply[]
  createdAt: Date
  updatedAt: Date
}

const ReplySchema = new Schema<IReply>(
  {
    content: { type: String, required: true },
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
)

const MessageSchema = new Schema<IMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied'],
      default: 'unread',
    },
    replies: { type: [ReplySchema], default: [] },
  },
  { timestamps: true }
)

MessageSchema.index({ createdAt: -1 })
MessageSchema.index({ status: 1 })
MessageSchema.index({ isRead: 1 })

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema)

export default Message
