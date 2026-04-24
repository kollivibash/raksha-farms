import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

const CartContext = createContext(null)
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function getToken() { return localStorage.getItem('auth_token') }

async function saveCartToBackend(items) {
  const token = getToken()
  if (!token) return
  try {
    await fetch(`${BACKEND_URL}/api/cart`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items }),
    })
  } catch { /* silent */ }
}

async function loadCartFromBackend() {
  const token = getToken()
  if (!token) return null
  try {
    const res = await fetch(`${BACKEND_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rf_cart') || '[]') }
    catch { return [] }
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const saveTimer = useRef(null)

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem('rf_cart', JSON.stringify(cart))
    // Debounce backend save — 2s after last change
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveCartToBackend(cart), 2000)
  }, [cart])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  // On login (token appears): load backend cart and MERGE with local
  useEffect(() => {
    async function syncOnLogin() {
      const backendItems = await loadCartFromBackend()
      if (!backendItems?.length) return
      setCart(prev => {
        // Merge: backend items take priority, add any local-only items
        const merged = [...backendItems]
        prev.forEach(local => {
          if (!merged.find(b => b.cartKey === local.cartKey)) merged.push(local)
        })
        return merged
      })
    }
    syncOnLogin()
  }, []) // runs once on mount — token is already set if user was logged in

  function addToCart(product, quantity = 1, selectedVariant = null) {
    const key = selectedVariant ? `${product.id}_${selectedVariant.label}` : product.id
    setCart((prev) => {
      const existing = prev.find((item) => item.cartKey === key)
      if (existing) {
        return prev.map((item) =>
          item.cartKey === key
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        )
      }
      const price = selectedVariant ? selectedVariant.price : product.price
      const unit  = selectedVariant ? selectedVariant.label : product.unit
      return [...prev, { ...product, cartKey: key, quantity, price, unit, selectedVariant }]
    })
  }

  function removeFromCart(cartKey) {
    setCart((prev) => prev.filter((item) => item.cartKey !== cartKey))
  }

  function updateQuantity(cartKey, quantity) {
    if (quantity <= 0) { removeFromCart(cartKey); return }
    setCart((prev) =>
      prev.map((item) => item.cartKey === cartKey ? { ...item, quantity } : item)
    )
  }

  function clearCart() {
    setCart([])
    // Also clear on backend immediately
    const token = getToken()
    if (token) {
      fetch(`${BACKEND_URL}/api/cart`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
  }

  function openDrawer()  { setDrawerOpen(true) }
  function closeDrawer() { setDrawerOpen(false) }
  function toggleDrawer() { setDrawerOpen((v) => !v) }

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, totalPrice,
      drawerOpen, openDrawer, closeDrawer, toggleDrawer,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
