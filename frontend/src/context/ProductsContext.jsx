import React, { createContext, useContext, useState, useEffect } from 'react'
import { INITIAL_PRODUCTS } from '../data/products'

const ProductsContext = createContext(null)

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('rf_products')
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS
    } catch {
      return INITIAL_PRODUCTS
    }
  })

  useEffect(() => {
    localStorage.setItem('rf_products', JSON.stringify(products))
  }, [products])

  function addProduct(product) {
    const newProduct = {
      ...product,
      id: `p_${Date.now()}`,
    }
    setProducts((prev) => [...prev, newProduct])
    return newProduct
  }

  function updateProduct(id, updates) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  function deleteProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  function decreaseStock(id, quantity) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
      )
    )
  }

  function resetProducts() {
    setProducts(INITIAL_PRODUCTS)
    localStorage.setItem('rf_products', JSON.stringify(INITIAL_PRODUCTS))
  }

  return (
    <ProductsContext.Provider
      value={{ products, addProduct, updateProduct, deleteProduct, decreaseStock, resetProducts }}
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
