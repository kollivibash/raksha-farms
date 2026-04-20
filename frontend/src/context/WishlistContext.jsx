import React, { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rf_wishlist') || '[]')
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('rf_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  function toggleWishlist(product) {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      return exists
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    })
  }

  function isWishlisted(productId) {
    return wishlist.some((p) => p.id === productId)
  }

  function clearWishlist() {
    setWishlist([])
  }

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider')
  return ctx
}
