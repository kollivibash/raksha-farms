import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ─── Replace this with your real Google Client ID from console.cloud.google.com ───
export const GOOGLE_CLIENT_ID = '626173903642-l61p32jrfj8b22qlaeotf157ptt1vvp3.apps.googleusercontent.com'

const AuthContext = createContext(null)

// Decode a Google JWT credential without a library
function decodeJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

// Simple hash for storing passwords (not cryptographic — fine for localStorage demo)
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function loadAccounts() {
  try { return JSON.parse(localStorage.getItem('rf_accounts') || '{}') } catch { return {} }
}
function saveAccounts(accounts) {
  localStorage.setItem('rf_accounts', JSON.stringify(accounts))
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
  const loginWithGoogle = useCallback(() => {
    if (!googleReady) return Promise.reject(new Error('Google Sign-In not loaded yet'))
    return new Promise((resolve, reject) => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          const payload = decodeJwt(response.credential)
          if (!payload) { reject(new Error('Invalid Google token')); return }
          const googleUser = {
            uid: payload.sub,
            name: payload.name,
            email: payload.email,
            avatar: payload.picture,
            provider: 'google',
          }
          setUser(googleUser)
          resolve(googleUser)
        },
      })
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: render the button flow instead of One Tap
          reject(new Error('popup_closed'))
        }
      })
    })
  }, [googleReady])

  // Render Google button into a container div
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

  // ─── Email Sign Up ─────────────────────────────────────────────────
  async function signupWithEmail(name, email, password) {
    setLoading(true)
    try {
      const accounts = loadAccounts()
      const key = email.toLowerCase()
      if (accounts[key]) throw new Error('An account with this email already exists.')
      const hashed = await hashPassword(password)
      const newUser = {
        uid: `email_${Date.now()}`,
        name,
        email: key,
        avatar: null,
        provider: 'email',
        createdAt: new Date().toISOString(),
      }
      accounts[key] = { ...newUser, passwordHash: hashed }
      saveAccounts(accounts)
      setUser(newUser)
      return newUser
    } finally {
      setLoading(false)
    }
  }

  // ─── Email Login ───────────────────────────────────────────────────
  async function loginWithEmail(email, password) {
    setLoading(true)
    try {
      const accounts = loadAccounts()
      const key = email.toLowerCase()
      const account = accounts[key]
      if (!account) throw new Error('No account found with this email.')
      const hashed = await hashPassword(password)
      if (account.passwordHash !== hashed) throw new Error('Incorrect password.')
      const { passwordHash: _pw, ...safeUser } = account
      setUser(safeUser)
      return safeUser
    } finally {
      setLoading(false)
    }
  }

  // ─── Logout ────────────────────────────────────────────────────────
  function logout() {
    setUser(null)
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
      loginWithGoogle,
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
