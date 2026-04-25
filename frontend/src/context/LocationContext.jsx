import React, { createContext, useContext, useState, useCallback } from 'react'

const LocationContext = createContext(null)

export function LocationProvider({ children }) {
  const [savedLocation, setSavedLocation] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rf_location')) || null } catch { return null }
  })

  const setLocation = useCallback((loc) => {
    setSavedLocation(loc)
    localStorage.setItem('rf_location', JSON.stringify(loc))
  }, [])

  return (
    <LocationContext.Provider value={{ savedLocation, setLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocationCtx() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocationCtx must be inside LocationProvider')
  return ctx
}
