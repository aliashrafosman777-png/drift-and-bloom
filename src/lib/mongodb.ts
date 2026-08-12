import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI
const DEFAULT_DATABASE_NAME = 'driftandbloom'

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

const expectedMongoHost = process.env.EXPECTED_MONGODB_HOST
if (expectedMongoHost && new URL(MONGODB_URI).hostname !== expectedMongoHost) {
  throw new Error('Configured MongoDB host does not match EXPECTED_MONGODB_HOST.')
}

/**
 * Global cache for the Mongoose connection promise.
 * In development, Next.js HMR clears the Node module cache on every edit,
 * which would create new connections on each reload. We store the promise on
 * `globalThis` so it survives across hot reloads.
 */
interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var _mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = globalThis._mongooseCache ?? { conn: null, promise: null }

if (!globalThis._mongooseCache) {
  globalThis._mongooseCache = cached
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((m) => {
      const databaseName = m.connection.name
      const expectedDatabase = process.env.EXPECTED_MONGODB_DATABASE || DEFAULT_DATABASE_NAME
      if (databaseName !== expectedDatabase) {
        void m.disconnect()
        throw new Error('Connected MongoDB database does not match EXPECTED_MONGODB_DATABASE.')
      }
      console.info('[database.connected]', {
        dataSource: process.env.DATA_SOURCE_ID || process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
        database: databaseName,
      })
      return m
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
