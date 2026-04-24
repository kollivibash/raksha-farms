import React from 'react'
import { Link } from 'react-router-dom'

const stats = [
  { value: '500+', label: 'Happy Families', icon: '👨‍👩‍👧' },
  { value: '24h',  label: 'Farm to Fork',   icon: '⚡' },
  { value: '100%', label: 'Pesticide Free', icon: '🌿' },
  { value: '4.9★', label: 'Customer Rating', icon: '⭐' },
]

const products = [
  { emoji: '🥦', name: 'Vegetables',    color: 'bg-green-500/20',  border: 'border-green-400/30' },
  { emoji: '🍎', name: 'Fresh Fruits',  color: 'bg-red-500/20',    border: 'border-red-400/30' },
  { emoji: '🌾', name: 'Millets',       color: 'bg-yellow-500/20', border: 'border-yellow-400/30' },
  { emoji: '🫙', name: 'Wood-pressed Oils', color: 'bg-amber-500/20',  border: 'border-amber-400/30' },
  { emoji: '🥚', name: 'Eggs & Meat',   color: 'bg-orange-500/20', border: 'border-orange-400/30' },
  { emoji: '🍄', name: 'Mushrooms',     color: 'bg-purple-500/20', border: 'border-purple-400/30' },
]

export default function HeroSection() {
  function scrollToProducts(e) {
    e.preventDefault()
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden bg-hero-gradient min-h-[520px] md:min-h-[600px] flex items-center">

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-earth-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* ── Left: Text ── */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              Now delivering across Hyderabad
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.08] mb-5">
              Farm-Fresh<br />
              <span className="text-earth-400">Goodness,</span><br />
              Delivered Daily
            </h1>

            {/* Sub */}
            <p className="text-white/75 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
              Organic vegetables, fruits, millets & more — harvested at sunrise, at your door by noon. No chemicals, no cold storage.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <a href="#products" onClick={scrollToProducts}
                className="btn-ripple inline-flex items-center justify-center gap-2 bg-earth-500 hover:bg-earth-600 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5M7 13l1.5 5m7-5l1.5 5M17 18a1 1 0 11-2 0 1 1 0 012 0zM9 18a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                Shop Now
              </a>
              <a href="tel:+919346566945"
                className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call to Order
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/15 hover:bg-white/15 transition-colors">
                  <p className="text-lg mb-0.5">{s.icon}</p>
                  <p className="text-xl font-black text-white leading-none">{s.value}</p>
                  <p className="text-white/60 text-[11px] mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Product Showcase (desktop only) ── */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-[380px] h-[380px]">
              {/* Center glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-56 h-56 rounded-full bg-white/10 blur-2xl" />
              </div>

              {/* Center emblem */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-white/15 backdrop-blur-md border-2 border-white/30 flex flex-col items-center justify-center shadow-2xl">
                  <span className="text-4xl">🌱</span>
                  <span className="text-white text-[10px] font-bold mt-1 tracking-wide">ORGANIC</span>
                </div>
              </div>

              {/* Orbit cards — uniform animation keeps circle alignment */}
              {products.map((p, i) => {
                const angle = (i / products.length) * 2 * Math.PI - Math.PI / 2
                const r = 155
                const x = Math.cos(angle) * r
                const y = Math.sin(angle) * r
                return (
                  <div key={p.name}
                    className="absolute animate-float"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)',
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: '6s',
                    }}>
                    <div className={`w-[72px] h-[72px] rounded-2xl ${p.color} border ${p.border} backdrop-blur-sm flex flex-col items-center justify-center gap-1 shadow-lg hover:scale-110 transition-transform cursor-default`}>
                      <span className="text-2xl">{p.emoji}</span>
                      <span className="text-white/80 text-[9px] font-semibold text-center leading-tight px-1">{p.name}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 inset-x-0 pointer-events-none">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10 md:h-14">
          <path d="M0 60L48 50C96 40 192 20 288 15C384 10 480 20 576 25C672 30 768 30 864 25C960 20 1056 10 1152 12.5C1248 15 1344 30 1392 37.5L1440 45V60H0Z" fill="#F0F4F1" />
        </svg>
      </div>
    </section>
  )
}
