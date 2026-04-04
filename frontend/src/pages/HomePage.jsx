import React, { useState, useMemo } from 'react'
import HeroSection from '../components/HeroSection'
import WhyChooseUs from '../components/WhyChooseUs'
import HowItWorks from '../components/HowItWorks'
import ReviewsSection from '../components/ReviewsSection'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductsContext'
import { CATEGORIES } from '../data/products'
import { useScrollReveal } from '../hooks/useScrollReveal'

const categoryVisuals = {
  all:        { bg: 'from-green-500 to-emerald-600', emoji: '🛒', desc: 'Everything fresh' },
  vegetables: { bg: 'from-green-400 to-green-600',   emoji: '🥦', desc: 'Farm-fresh picks' },
  fruits:     { bg: 'from-orange-400 to-red-500',    emoji: '🍎', desc: 'Seasonal goodness' },
  groceries:  { bg: 'from-amber-500 to-yellow-600',  emoji: '🌾', desc: 'Daily staples' },
}

export default function HomePage() {
  useScrollReveal()

  const { products } = useProducts()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('default')

  const filteredProducts = useMemo(() => {
    let list = [...products]

    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }

    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        list.sort((a, b) => {
          if (a.stock === 0 && b.stock > 0) return 1
          if (b.stock === 0 && a.stock > 0) return -1
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return 0
        })
    }

    return list
  }, [products, activeCategory, searchQuery, sortBy])

  const categoryCounts = useMemo(() => {
    const counts = { all: products.length }
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1
    })
    return counts
  }, [products])

  return (
    <div className="page-enter">
      {/* Hero */}
      <HeroSection />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Category visual cards */}
      <section id="categories" className="py-12 bg-farm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 reveal">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">
              Browse
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {CATEGORIES.map((cat, i) => {
              const visual = categoryVisuals[cat.id]
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id)
                    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className={`reveal category-card delay-${(i + 1) * 100} relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 ${
                    isActive
                      ? 'ring-4 ring-green-400 ring-offset-2 shadow-xl'
                      : 'shadow-card hover:shadow-soft'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${visual.bg} opacity-${isActive ? '100' : '90'}`} />
                  <div className="relative">
                    <span className="category-emoji text-4xl mb-3 block">{visual.emoji}</span>
                    <p className="font-bold text-white text-lg leading-tight">{cat.label}</p>
                    <p className="text-white/75 text-xs mt-1">{visual.desc}</p>
                    <span className="inline-block mt-2 bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {categoryCounts[cat.id] || 0} items
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Products section */}
      <section id="products" className="py-10 bg-farm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 reveal">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search vegetables, fruits, groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field sm:w-52"
            >
              <option value="default">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

          {/* Active filter pill */}
          {(activeCategory !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {activeCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                  {categoryVisuals[activeCategory]?.emoji} {CATEGORIES.find(c => c.id === activeCategory)?.label}
                  <button onClick={() => setActiveCategory('all')} className="ml-1 hover:text-red-500 transition-colors">✕</button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                  🔍 "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-500 transition-colors">✕</button>
                </span>
              )}
            </div>
          )}

          {/* Products grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl">🔍</span>
              <p className="text-gray-600 mt-4 text-lg font-semibold">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or category filter</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all') }}
                className="mt-5 btn-outline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-5 font-medium">
                Showing <span className="text-green-700 font-bold">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredProducts.map((product, i) => (
                  <div
                    key={product.id}
                    className="product-card-anim"
                    style={{ animationDelay: `${(i % 8) * 50}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Customer Reviews */}
      <ReviewsSection />

      {/* Contact CTA banner */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-10 shadow-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="relative">
              <span className="text-5xl block mb-4">📞</span>
              <h2 className="text-3xl font-black text-white mb-3">Have Questions? Reach Out!</h2>
              <p className="text-green-100 mb-7 max-w-md mx-auto">
                Our team is available 7am–8pm daily to help with orders, delivery, or any queries about our products.
              </p>
              <a
                href="tel:+919346566945"
                className="btn-ripple inline-flex items-center gap-3 bg-white text-green-700 font-bold px-8 py-4 rounded-2xl hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span className="text-xl">📞</span>
                Call +91 9346566945
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
