import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export const GOOGLE_CLIENT_ID = '626173903642-l61p32jrfj8b22qlaeotf157ptt1vvp3.apps.googleusercontent.com'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const AuthContext = createContext(null)

function decodeJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rf_auth_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)

  // Persist user to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('rf_auth_user', JSON.stringify(user))
    else localStorage.removeItem('rf_auth_user')
  }, [user])

  // Wait for Google GSI script to load
  useEffect(() => {
    const check = setInterval(() => {
      if (window.google?.accounts?.id) {
        setGoogleReady(true)
        clearInterval(check)
      }
    }, 200)
    return () => clearInterval(check)
  }, [])

  // ─── Google Sign-In ────────────────────────────────────────────────
  const renderGoogleButton = useCallback((containerId) => {
    if (!googleReady) return
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        const payload = decodeJwt(response.credential)
        if (!payload) return
        const googleUser = {
          uid: payload.sub,
          name: payload.name,
          email: payload.email,
          avatar: payload.picture,
          provider: 'google',
        }
        setUser(googleUser)
      },
    })
    const el = document.getElementById(containerId)
    if (el) {
      window.google.accounts.id.renderButton(el, {
        theme: 'outline',
        size: 'large',
        width: el.offsetWidth || 320,
        text: 'signin_with',
        shape: 'rectangular',
      })
    }
  }, [googleReady])

  // ─── Email Sign Up → saves to backend database ─────────────────────
  async function signupWithEmail(name, email, password) {
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Signup failed')
      localStorage.setItem('auth_token', data.token)
      const newUser = { ...data.user, provider: 'email' }
      setUser(newUser)
      return newUser
    } finally {
      setLoading(false)
    }
  }

  // ─── Email Login → validates against backend database ──────────────
  async function loginWithEmail(email, password) {
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      // Customer login: role must be 'user' (admin login goes through separate admin panel)
      if (data.user.role === 'admin') throw new Error('Please use the admin panel to sign in.')
      localStorage.setItem('auth_token', data.token)
      const loggedUser = { ...data.user, provider: 'email' }
      setUser(loggedUser)
      return loggedUser
    } finally {
      setLoading(false)
    }
  }

  // ─── Logout ────────────────────────────────────────────────────────
  function logout() {
    setUser(null)
    localStorage.removeItem('auth_token')
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect()
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      googleReady,
      loginWithEmail,
      signupWithEmail,
      renderGoogleButton,
      logout,
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
