import React, { useState, useMemo } from 'react'
import HeroSection from '../components/HeroSection'
import WhyChooseUs from '../components/WhyChooseUs'
import HowItWorks from '../components/HowItWorks'
import ReviewsSection from '../components/ReviewsSection'
import ProductCard from '../components/ProductCard'
import TrustBadges from '../components/TrustBadges'
import FreeDeliveryBar from '../components/FreeDeliveryBar'
import { useProducts } from '../context/ProductsContext'
import { CATEGORIES } from '../data/products2'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function HomePage() {
  useScrollReveal()
  const { products } = useProducts()

  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery]       = useState('')
  const [sortBy, setSortBy]                 = useState('default')

  const filteredProducts = useMemo(() => {
    let list = [...products]
    if (activeCategory !== 'all') list = list.filter((p) => p.category === activeCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category.includes(q)
      )
    }
    switch (sortBy) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break
      case 'price-desc': list.sort((a, b) => b.price - a.price); break
      case 'name':       list.sort((a, b) => a.name.localeCompare(b.name)); break
      default:
        list.sort((a, b) => {
          if (a.stock === 0 && b.stock > 0) return 1
          if (b.stock === 0 && a.stock > 0) return -1
          if (a.featured && !b.featured)    return -1
          if (!a.featured && b.featured)    return 1
          return 0
        })
    }
    return list
  }, [products, activeCategory, searchQuery, sortBy])

  const categoryCounts = useMemo(() => {
    const counts = { all: products.length }
    products.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1 })
    return counts
  }, [products])

  function selectCategory(id) {
    setActiveCategory(id)
    setSearchQuery('')
    setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function clearFilters() {
    setActiveCategory('all')
    setSearchQuery('')
  }

  return (
    <div className="page-enter">
      <HeroSection />
      <TrustBadges />
      <FreeDeliveryBar />

      {/* ── Category grid — hidden when a category is active so products are immediately visible ── */}
      <section id="categories" className={`py-10 bg-sage-50 transition-all duration-300 ${activeCategory !== 'all' ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-7 reveal">
            <span className="section-subtitle">Browse</span>
            <h2 className="section-title">Shop by Category</h2>
          </div>

          {/* Category pills — mobile horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:hidden mb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  activeCategory === cat.id
                    ? 'bg-forest-500 text-white border-forest-500 shadow-forest'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-forest-300'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeCategory === cat.id ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{categoryCounts[cat.id] || 0}</span>
              </button>
            ))}
          </div>

          {/* Category cards — desktop grid */}
          <div className="hidden md:grid grid-cols-5 gap-3 mb-6">
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat, i) => {
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  className={`reveal category-card delay-${(i + 1) * 100} relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ${
                    isActive ? 'ring-4 ring-forest-400 ring-offset-2 shadow-forest' : 'shadow-card hover:shadow-soft'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-${isActive ? '100' : '90'}`} />
                  <div className="relative">
                    <span className="category-emoji text-3xl mb-2 block">{cat.icon}</span>
                    <p className="font-bold text-white text-sm leading-tight">{cat.label}</p>
                    <p className="text-white/70 text-[10px] mt-0.5">{cat.desc}</p>
                    <span className="inline-block mt-1.5 bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {categoryCounts[cat.id] || 0} items
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Products section ── */}
      <section id="products" className="py-8 bg-sage-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search + sort bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5 reveal">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search vegetables, fruits, oils, millets..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value) }}
                className="input-field pl-10"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field sm:w-52"
            >
              <option value="default">Featured First</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name">Name: A → Z</option>
            </select>
          </div>

          {/* Active filters */}
          {(activeCategory !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {activeCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 bg-forest-100 text-forest-700 text-sm font-medium px-3 py-1 rounded-full">
                  {CATEGORIES.find((c) => c.id === activeCategory)?.icon}
                  {CATEGORIES.find((c) => c.id === activeCategory)?.label}
                  <button onClick={() => selectCategory('all')} className="ml-1 hover:text-red-500 transition-colors">✕</button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                  "{searchQuery}"
                  <button onClick={clearFilters} className="ml-1 hover:text-red-500 transition-colors">✕</button>
                </span>
              )}
            </div>
          )}

          {/* Product grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto rounded-full bg-white flex items-center justify-center mb-4 shadow-card">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-bold">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or category</p>
              <button onClick={clearFilters} className="btn-outline mt-4">Clear Filters</button>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-4 font-medium">
                Showing <span className="text-forest-600 font-bold">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
                {activeCategory !== 'all' && <span className="text-gray-400"> in {CATEGORIES.find((c) => c.id === activeCategory)?.label}</span>}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {filteredProducts.map((product, i) => (
                  <div key={product.id} className="product-card-anim" style={{ animationDelay: `${(i % 10) * 40}ms` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Subscription CTA */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 reveal">
          <div className="bg-gradient-to-br from-earth-500 to-earth-600 rounded-3xl p-8 md:p-10 shadow-earth relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">🌱 Subscribe & Save</span>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Never Run Out of Fresh Microgreens</h2>
                <p className="text-white/80 text-sm md:text-base">Get daily or weekly deliveries of our freshest microgreens. Cancel anytime, save 10% on every order.</p>
              </div>
              <div className="flex-shrink-0">
                <a
                  href="#products"
                  onClick={(e) => { e.preventDefault(); setActiveCategory('microgreens'); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) }}
                  className="inline-flex items-center gap-2 bg-white text-earth-600 font-bold px-7 py-3.5 rounded-2xl hover:bg-earth-50 transition-all shadow-lg text-sm"
                >
                  Shop Microgreens
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <HowItWorks />
      <ReviewsSection />

      {/* Contact CTA */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <div className="bg-hero-gradient rounded-3xl p-10 shadow-forest relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="relative">
              <h2 className="text-3xl font-black text-white mb-3">Questions? We're Here!</h2>
              <p className="text-white/80 mb-7 max-w-md mx-auto">
                Our team is available 7AM–8PM daily to help with orders, delivery or anything about our products.
              </p>
              <a
                href="tel:+919346566945"
                className="btn-ripple inline-flex items-center gap-3 bg-white text-forest-600 font-bold px-8 py-4 rounded-2xl hover:bg-sage-50 transition-all shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call +91 9346566945
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
