// @ts-nocheck
"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  apiFetch,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from '../lib/api'

type AuthUser = {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  isAdmin: boolean
  role: 'admin' | 'customer'
}

type SendCodeResult =
  | { success: true; isNewUser: boolean }
  | { success: false; error: string }

type VerifyCodeResult =
  | { success: true; isNewUser?: false }
  | { success: true; isNewUser: true }
  | { success: false; error: string }

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  sendCode: (email: string) => Promise<SendCodeResult>
  verifyCode: (email: string, code: string, name?: string) => Promise<VerifyCodeResult>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function buildAuthUser(apiUser: any): AuthUser {
  return {
    id: apiUser.id || apiUser._id,
    name: `${apiUser.firstName} ${apiUser.lastName}`.trim() || apiUser.firstName,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName || '',
    email: apiUser.email,
    isAdmin: apiUser.role === 'admin',
    role: apiUser.role,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = getStoredToken()
    if (storedToken) {
      setToken(storedToken)
      apiFetch('/api/auth/profile')
        .then((res) => {
          setUser(buildAuthUser(res.data))
        })
        .catch(() => {
          removeStoredToken()
          setToken(null)
        })
    }
  }, [])

  /** Step 1: Send OTP code to email */
  const sendCode = async (email: string): Promise<SendCodeResult> => {
    try {
      const res = await apiFetch('/api/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      return { success: true, isNewUser: res.data?.isNewUser || false }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send code.' }
    }
  }

  /** Step 2: Verify OTP code (and optionally create account with name) */
  const verifyCode = async (
    email: string,
    code: string,
    name?: string
  ): Promise<VerifyCodeResult> => {
    try {
      const res = await apiFetch('/api/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify({ email, code, ...(name ? { name } : {}) }),
      })

      const data = res.data as any

      // If API says new user needs a name
      if (data.isNewUser && !data.token) {
        return { success: true, isNewUser: true }
      }

      // Login/register successful
      if (data.token && data.user) {
        setStoredToken(data.token)
        setToken(data.token)
        setUser(buildAuthUser(data.user))

        // Sync game progress
        try {
          const localProgressStr = window.localStorage.getItem('db_game_progress')
          if (localProgressStr) {
            const localProgress = JSON.parse(localProgressStr)
            const hasAnswers = localProgress.answers && Object.keys(localProgress.answers).length > 0
            if (hasAnswers) {
              // Push local to DB
              await apiFetch('/api/game/progress', {
                method: 'POST',
                body: JSON.stringify(localProgress)
              })
            } else {
              // Pull DB to local
              const dbRes = await apiFetch('/api/game/progress')
              if (dbRes.success && dbRes.data) {
                window.localStorage.setItem('db_game_progress', JSON.stringify(dbRes.data))
              }
            }
          } else {
            // Pull DB to local
            const dbRes = await apiFetch('/api/game/progress')
            if (dbRes.success && dbRes.data) {
              window.localStorage.setItem('db_game_progress', JSON.stringify(dbRes.data))
            }
          }
        } catch (syncErr) {
          console.error('Error syncing game progress on login:', syncErr)
        }

        return { success: true }
      }

      return { success: false, error: 'Unexpected response.' }
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification failed.' }
    }
  }

  const logout = () => {
    removeStoredToken()
    setToken(null)
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!user,
      isAdmin: !!user?.isAdmin,
      sendCode,
      verifyCode,
      logout,
    }),
    [user, token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
