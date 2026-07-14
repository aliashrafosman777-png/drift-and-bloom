import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

interface ApiSuccessResponse<T = unknown> {
  success: true
  message: string
  data: T
}

interface ApiErrorResponse {
  success: false
  message: string
}

/**
 * Return a standardized success JSON response.
 */
export function successResponse<T = unknown>(
  data: T,
  message = 'Success',
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    { success: true, message, data },
    { status }
  )
}

/**
 * Return a standardized error JSON response.
 * In development, an optional `details` string is included for debugging.
 */
export function errorResponse(
  message = 'Something went wrong',
  status = 500,
  details?: string
): NextResponse<ApiErrorResponse & { details?: string }> {
  const body: ApiErrorResponse & { details?: string } = { success: false, message }
  if (details && process.env.NODE_ENV === 'development') {
    body.details = details
  }
  return NextResponse.json(body, { status })
}

/**
 * Format a ZodError into a human-readable error response.
 */
export function validationErrorResponse(
  error: ZodError
): NextResponse<ApiErrorResponse> {
  const messages = error.issues.map(
    (e) => `${e.path.join('.')}: ${e.message}`
  )
  return errorResponse(messages.join('; '), 400)
}
