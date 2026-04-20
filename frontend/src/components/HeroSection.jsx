import React from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

const stats = [
  { value: '500+', label: 'Happy Families' },
  { value: '24h',  label: 'Farm to Fork' },
  { value: '100%', label: 'Pesticide Free' },
  { value: '4.9★', label: 'Customer Rating' },
]

const floatingItems = [
  { img: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=80&h=80&fit=crop&q=80', alt: 'tomatoes', style: { top: '8%',    right: '10%', animationDelay: '0s',   animationDuration: '5s'   } },
  { img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=80&h=80&fit=crop&q=80', alt: 'apples',   style: { top: '30%',   right: '2%',  animationDelay: '1s',   animationDuration: '6.5s' } },
  { img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=80&h=80&fit=crop&q=80', alt: 'mangoes',  style: { bottom: '20%', right: '12%', animationDelay: '0.5s', animationDuration: '7s'   } },
  { img: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=80&h=80&fit=crop&q=80', alt: 'banana', style: { top: '55%',  left: '3%',   animationDelay: '2s',   animationDuration: '5.5s' } },
  { img: 'https://images.unsplash.com/photo-1474979078-6b1ae0b38025?w=80&h=80&fit=crop&q=80', alt: 'oil',      style: { top: '12%',   left: '5%',   animationDelay: '1.5s', animationDuration: '8s'   } },
]

export default function HeroSection() {
  useScrollReveal()

  function scrollToProducts(e) {
    e.preventDefault()
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden bg-hero-gradient min-h-[480px] md:min-h-[580px] flex items-center">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-earth-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
      </div>

      {/* Floating product images (desktop only) */}
      {floatingItems.map((item) => (
        <div key={item.alt} className="absolute hidden lg:block animate-float" style={item.style}>
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-white/30">
            <img src={item.img} alt={item.alt} className="w-full h-full object-cover" loading="lazy" />
          </div>
        </div>
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24">
        <div className="max-w-2xl">
          {/* Live delivery badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 reveal">
            <span className="w-2 h-2 rounded-full bg-earth-400 pulse-dot flex-shrink-0" />
            Now delivering across Hyderabad
          </div>

          {/* Headline */}
          <h1 className="reveal delay-100 text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.1] mb-4">
            Farm-Fresh
            <span className="block text-earth-400">Goodness,</span>
            <span className="block">Delivered Daily</span>
          </h1>

          {/* Subheadline */}
          <p className="reveal delay-200 text-white/80 text-sm md:text-xl mb-6 max-w-xl leading-relaxed">
            Organic vegetables, fruits, millets & more — harvested at sunrise, at your door by noon. No chemicals, no cold storage.
          </p>

          {/* CTA buttons */}
          <div className="reveal delay-300 flex flex-col sm:flex-row gap-3 mb-8">
            <a
              href="#products"
              onClick={scrollToProducts}
              className="btn-ripple inline-flex items-center justify-center gap-2.5 bg-earth-500 hover:bg-earth-600 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-earth text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5M7 13l1.5 5m7-5l1.5 5M17 18a1 1 0 11-2 0 1 1 0 012 0zM9 18a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              Shop Now
            </a>
            <a
              href="tel:+919346566945"
              className="inline-flex items-center justify-center gap-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call to Order
            </a>
          </div>

          {/* Stats grid */}
          <div className="reveal delay-400 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15">
                <p className="text-2xl font-black text-white leading-none">{s.value}</p>
                <p className="text-white/70 text-xs mt-1 font-medium">{s.label}</p>
              </div>
            ))}
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
