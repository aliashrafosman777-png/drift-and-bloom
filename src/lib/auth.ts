import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local')
}

export interface JWTPayload {
  userId: string
  role: 'admin' | 'customer'
  iat?: number
  exp?: number
}

/**
 * Sign a JWT token with user id and role.
 * Token expires in 7 days by default.
 */
export function signToken(userId: string, role: 'admin' | 'customer'): string {
  return jwt.sign({ userId, role }, JWT_SECRET as string, { expiresIn: '7d' })
}

/**
 * Verify and decode a JWT token.
 * Throws if the token is invalid or expired.
 */
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET as string) as JWTPayload
}

/**
 * Extract the Bearer token from a NextRequest's Authorization header.
 * Returns null if no valid Bearer token is found.
 */
export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}
