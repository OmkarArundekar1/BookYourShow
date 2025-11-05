"use client"

import { useState, useEffect, type ReactNode } from "react"
import { AuthContext, type AuthContextType } from "./auth-context"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType["user"]>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken")
    const storedUser = localStorage.getItem("authUser")
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Login failed")
      }

      const data = await response.json()
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem("authToken", data.token)
      localStorage.setItem("authUser", JSON.stringify(data.user))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name: string, email: string, phone: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Signup failed")
      }

      const data = await response.json()
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem("authToken", data.token)
      localStorage.setItem("authUser", JSON.stringify(data.user))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setError(null)
    localStorage.removeItem("authToken")
    localStorage.removeItem("authUser")
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
