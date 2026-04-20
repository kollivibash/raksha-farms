import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rf_cart') || '[]')
    } catch { return [] }
  })
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('rf_cart', JSON.stringify(cart))
  }, [cart])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

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

  function clearCart() { setCart([]) }

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
