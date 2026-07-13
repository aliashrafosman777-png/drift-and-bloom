/**
 * Client-side API Fetch Wrapper
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralizes:
 *   • Auto-attaching JWT from localStorage
 *   • JSON parsing with error handling
 *   • Standardized error throwing for consumers
 */

const TOKEN_KEY = 'db_auth_token_v1'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore */
  }
}

export function removeStoredToken(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Fetch wrapper that auto-attaches JWT and parses the standardized response.
 * Throws ApiError on failure responses.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getStoredToken()

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  const json = await res.json() as ApiResponse<T>

  if (!res.ok || !json.success) {
    throw new ApiError(json.message || 'Something went wrong', res.status)
  }

  return json
}
