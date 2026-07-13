import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from './auth'
import { JWTPayload } from '@/lib/auth'

/**
 * Convenience re-export for admin-only routes.
 * Usage in route handlers:
 *   const auth = requireAdmin(req)
 *   if (auth instanceof NextResponse) return auth
 *   // auth is JWTPayload
 */
export function requireAdmin(
  req: NextRequest
): JWTPayload | NextResponse {
  return authenticateAdmin(req)
}
