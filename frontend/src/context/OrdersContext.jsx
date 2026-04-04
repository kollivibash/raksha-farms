import React, { createContext, useContext, useState, useEffect } from 'react'

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

  function updateOrderStatus(orderId, status, deliveryTime = null) {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              status,
              ...(deliveryTime ? { deliveryTime } : {}),
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    )
  }

  function getOrder(orderId) {
    return orders.find((o) => o.orderId === orderId)
  }

  function getOrdersByUser(email) {
    if (!email) return []
    return orders.filter((o) => o.userEmail?.toLowerCase() === email.toLowerCase())
  }

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus, getOrder, getOrdersByUser }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders must be used inside OrdersProvider')
  return ctx
}
