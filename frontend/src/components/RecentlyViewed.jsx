import React, { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import { useProducts } from '../context/ProductsContext'

export default function RecentlyViewed() {
  const { products } = useProducts()
  const [recentIds, setRecentIds] = useState([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('rf_recently_viewed') || '[]')
      if (Array.isArray(stored)) {
        setRecentIds(stored)
      }
    } catch {
      // ignore
    }
  }, [])

  if (recentIds.length === 0) return null

  const recentProducts = recentIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean)

  if (recentProducts.length === 0) return null

  return (
    <section className="mt-14 pt-10 border-t border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-5">Recently Viewed</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {recentProducts.map(p => (
          <div key={p.id} className="flex-shrink-0 w-48 sm:w-56">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
