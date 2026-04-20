import React, { createContext, useContext, useState, useEffect } from 'react'
import { INITIAL_PRODUCTS } from '../data/products2'

const API_URL = 'http://localhost:4000/api/products'

const ProductsContext = createContext(null)

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [loading, setLoading] = useState(true)

  // Fetch from backend on mount, fall back to static data if API is down
  useEffect(() => {
    fetch(`${API_URL}?limit=200`)
      .then(r => r.json())
      .then(data => {
        const apiProducts = data.products || []
        if (apiProducts.length > 0) {
          // Normalize API products to match frontend shape
          const normalized = apiProducts.map(p => ({
            id:          p.id,
            name:        p.name,
            category:    p.category,
            description: p.description || '',
            price:       Number(p.price),
            unit:        p.unit || 'kg',
            stock:       Number(p.stock),
            image:       p.image_url
              ? (p.image_url.startsWith('http') ? p.image_url : `http://localhost:4000${p.image_url}`)
              : `https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=500`,
            featured:    p.is_featured || false,
            organic:     true,
            rating:      4.7,
            reviews:     42,
            variants:    Array.isArray(p.variants) ? p.variants : [],
          }))
          // Merge: API products first, then any static products not in DB
          const apiIds = new Set(normalized.map(p => p.id))
          const staticOnly = INITIAL_PRODUCTS.filter(p => !apiIds.has(p.id))
          setProducts([...normalized, ...staticOnly])
        }
      })
      .catch(() => {
        // Backend offline — use static data silently
      })
      .finally(() => setLoading(false))
  }, [])

  function addProduct(product) {
    const newProduct = { ...product, id: `p_${Date.now()}` }
    setProducts(prev => [...prev, newProduct])
    return newProduct
  }

  function updateProduct(id, updates) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  function deleteProduct(id) {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  function decreaseStock(id, quantity) {
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock - quantity) } : p)
    )
  }

  function resetProducts() {
    setProducts(INITIAL_PRODUCTS)
  }

  return (
    <ProductsContext.Provider
      value={{ products, loading, addProduct, updateProduct, deleteProduct, decreaseStock, resetProducts }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used inside ProductsProvider')
  return ctx
}
