import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromRequest, JWTPayload } from '@/lib/auth'
import { errorResponse } from '@/utils/apiResponse'

/**
 * Admin email whitelist — these emails always have admin access.
 * Auto-upgrades their role on authentication.
 */
const ADMIN_EMAILS = [
  'admin@driftandbloom.com',
  'aliashrafosman777@gmail.com',
  'bossyhossamy@gmail.com',
  'pro.m.soliman@gmail.com',
  'aoni15107@gmail.com',
  'ghfvgyvwqe@gmail.com',
  'fathy.abdelrahman@mail.ru',
  'joudyessam233@icloud.com',
  'driftandbloom28@gmail.com',
]

/**
 * Authenticate a request by verifying the JWT token.
 * Returns the decoded payload on success, or a 401 NextResponse on failure.
 */
export function authenticate(
  req: NextRequest
): JWTPayload | NextResponse {
  const token = getTokenFromRequest(req)

  if (!token) {
    return errorResponse('Authentication required. Please log in.', 401)
  }

  try {
    const decoded = verifyToken(token)
    return decoded
  } catch {
    return errorResponse('Invalid or expired token. Please log in again.', 401)
  }
}

/**
 * Authenticate and verify admin role.
 * Also checks the admin email whitelist.
 */
export function authenticateAdmin(
  req: NextRequest
): JWTPayload | NextResponse {
  const result = authenticate(req)

  if (result instanceof NextResponse) {
    return result
  }

  if (result.role !== 'admin') {
    return errorResponse('Admin access required.', 403)
  }

  return result
}

/**
 * Check if an email is in the admin whitelist.
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
