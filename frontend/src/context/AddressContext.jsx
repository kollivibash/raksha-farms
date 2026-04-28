import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AddressContext = createContext(null)

const LABEL_ICONS = { Home: '🏠', Work: '🏢', Hostel: '🏫', Other: '📍' }
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function getToken() { return localStorage.getItem('auth_token') }

export function AddressProvider({ children }) {
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('rf_addresses')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Persist to localStorage on every change (offline fallback)
  useEffect(() => {
    localStorage.setItem('rf_addresses', JSON.stringify(addresses))
  }, [addresses])

  // Load from backend on mount (if logged in) and on login
  const syncFromBackend = useCallback(async () => {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch(`${BACKEND_URL}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setAddresses(data)
      }
    } catch { /* silent — use localStorage fallback */ }
  }, [])

  useEffect(() => {
    syncFromBackend()
    // Listen for login events (dispatched by AuthContext after successful login)
    window.addEventListener('rf:login', syncFromBackend)
    return () => window.removeEventListener('rf:login', syncFromBackend)
  }, [syncFromBackend])

  async function addAddress(addr) {
    const token = getToken()
    if (token) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(addr),
        })
        if (res.ok) {
          const saved = await res.json()
          setAddresses(prev => [saved, ...prev])
          return saved
        }
      } catch { /* fall through to local */ }
    }
    // Offline / not logged in: save locally only
    const newAddr = { ...addr, id: generateId(), createdAt: new Date().toISOString() }
    setAddresses(prev => [newAddr, ...prev])
    return newAddr
  }

  async function updateAddress(id, updates) {
    const token = getToken()
    if (token) {
      try {
        await fetch(`${BACKEND_URL}/api/addresses/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(updates),
        })
      } catch { /* silent */ }
    }
    setAddresses(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  async function deleteAddress(id) {
    const token = getToken()
    if (token) {
      try {
        await fetch(`${BACKEND_URL}/api/addresses/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch { /* silent */ }
    }
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  return (
    <AddressContext.Provider value={{ addresses, addAddress, updateAddress, deleteAddress, LABEL_ICONS }}>
      {children}
    </AddressContext.Provider>
  )
}

export function useAddresses() {
  const ctx = useContext(AddressContext)
  if (!ctx) throw new Error('useAddresses must be used inside AddressProvider')
  return ctx
}
