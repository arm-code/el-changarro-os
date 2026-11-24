'use client'

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'
import { axiosInstance } from '@/lib/api/axios'

export interface AuthUser {
  id: string
  email?: string
  name?: string
  role?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  /** Vuelve a consultar la sesión (llamar tras iniciar sesión). */
  refresh: () => Promise<void>
  signOut: (redirectTo?: unknown) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
})

interface MeResponse {
  id: string
  email: string
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // La sesión vive en una cookie httpOnly: la única forma de saber si hay
  // sesión es preguntarle al API.
  const refresh = useCallback(async () => {
    try {
      const res = await axiosInstance.get<MeResponse>('/v1/auth/me')
      setUser({
        id: res.data.id,
        email: res.data.email,
        name: res.data.email.split('@')[0] || 'Usuario',
        role: 'admin',
      })
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Algunos botones pasan `signOut` directo como onClick: el argumento puede ser un evento
  const signOut = useCallback(async (redirectArg?: unknown) => {
    const redirectTo = typeof redirectArg === 'string' ? redirectArg : '/'
    try {
      await axiosInstance.post('/v1/auth/logout')
    } finally {
      setUser(null)
      window.location.href = redirectTo
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
