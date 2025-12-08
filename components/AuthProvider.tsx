'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authAPI, User } from '@/lib/auth'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to load user from localStorage and verify with backend
    const loadUser = async () => {
      try {
        const storedUser = authAPI.getUser()
        const token = typeof window !== 'undefined' ? localStorage.getItem('plateplan.token') : null
        
        if (storedUser && token) {
          // Set user from localStorage immediately
          setUser(storedUser)
          // Try to verify token in background, but don't block or clear on failure
          // This allows the app to work even if verification fails temporarily
          authAPI.getCurrentUser().then((currentUser) => {
            // Update user if verification succeeds
            setUser(currentUser)
          }).catch(() => {
            // Silently fail - token might be invalid but don't clear it immediately
            // User can still use the app and will be prompted to login when needed
          })
        }
      } catch (error) {
        console.error('Failed to load user:', error)
        // Don't clear everything on error - might be temporary
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login({ username, password })
      // Set user from login response - don't verify immediately as it might cause issues
      setUser(response.user)
    } catch (error: any) {
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      // Register the user
      await authAPI.register({ username, email, password })
      // Auto-login after registration
      const response = await authAPI.login({ username, password })
      setUser(response.user)
    } catch (error: any) {
      throw error
    }
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      if (authAPI.isAuthenticated()) {
        const currentUser = await authAPI.getCurrentUser()
        setUser(currentUser)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      logout()
    }
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}



