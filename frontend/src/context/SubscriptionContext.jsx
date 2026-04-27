import React, { createContext, useContext, useState, useEffect } from 'react'

const SubscriptionContext = createContext(null)

export function SubscriptionProvider({ children }) {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  async function fetchPlans() {
    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const res = await fetch(`${BACKEND_URL}/api/subscription-plans`)
      const data = await res.json()
      setPlans(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch subscription plans:', err)
      setPlans([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <SubscriptionContext.Provider value={{ plans, loading }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscriptions() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscriptions must be used inside SubscriptionProvider')
  return ctx
}
