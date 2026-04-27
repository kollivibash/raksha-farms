import React, { createContext, useContext, useState, useEffect } from 'react'

const AddressContext = createContext(null)

const LABEL_ICONS = { Home: '🏠', Work: '🏢', Hostel: '🏫', Other: '📍' }

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function AddressProvider({ children }) {
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('rf_addresses')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('rf_addresses', JSON.stringify(addresses))
  }, [addresses])

  function addAddress(addr) {
    const newAddr = { ...addr, id: generateId(), createdAt: new Date().toISOString() }
    setAddresses(prev => [newAddr, ...prev])
    return newAddr
  }

  function updateAddress(id, updates) {
    setAddresses(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  function deleteAddress(id) {
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
