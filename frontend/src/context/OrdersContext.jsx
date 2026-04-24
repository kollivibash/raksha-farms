import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// Maps backend status → frontend status used in the UI
const STATUS_MAP = {
  placed:           'pending',
  accepted:         'accepted',
  preparing:        'accepted',
  out_for_delivery: 'out_for_delivery',
  delivered:        'delivered',
  cancelled:        'rejected',
  rejected:         'rejected',
}

const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('rf_orders')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('rf_orders', JSON.stringify(orders))
  }, [orders])

  function addOrder(order) {
    setOrders((prev) => [order, ...prev])
  }

  function updateOrderStatus(orderId, status, deliveryTime = null, backendId = null) {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              status,
              ...(deliveryTime ? { deliveryTime } : {}),
              ...(backendId   ? { backendId }   : {}),
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    )
  }

  function getOrder(orderId) {
    return orders.find((o) => o.orderId === orderId)
  }

  // Show ALL local orders for logged-in users (email match + no-email guest orders)
  function getOrdersByUser(email) {
    if (!email) return orders
    return orders.filter((o) => !o.userEmail || o.userEmail.toLowerCase() === email.toLowerCase())
  }

  // Merge backend orders into localStorage — works for ALL order types
  function applyBackendOrders(backendOrders) {
    if (!backendOrders?.length) return
    setOrders(prev => {
      let changed = false
      const next = prev.map(order => {
        const match = backendOrders.find(b =>
          (b.reference_id && b.reference_id === order.orderId) ||
          (Math.abs(Number(b.total) - Number(order.total)) < 1 &&
           Math.abs(new Date(b.created_at) - new Date(order.createdAt)) < 10 * 60 * 1000)
        )
        if (!match) return order
        const newStatus = STATUS_MAP[match.status] || match.status
        if (newStatus === order.status && order.backendId === match.id) return order
        changed = true
        return { ...order, status: newStatus, backendId: match.id, updatedAt: new Date().toISOString() }
      })
      return changed ? next : prev
    })
  }

  // Primary: sync by user_id (works for all logged-in users including Google)
  const syncOrdersByUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) return
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return
      applyBackendOrders(await res.json())
    } catch { /* silent */ }
  }, [])

  // Fallback: sync by phone (works for guest orders)
  const syncOrdersByPhone = useCallback(async (phone) => {
    if (!phone) return
    const digits = phone.replace(/\D/g, '').slice(-10)
    if (digits.length < 8) return
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/by-phone/${digits}`)
      if (!res.ok) return
      applyBackendOrders(await res.json())
    } catch { /* silent */ }
  }, [])

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus, getOrder, getOrdersByUser, syncOrdersByPhone, syncOrdersByUser }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders must be used inside OrdersProvider')
  return ctx
}
