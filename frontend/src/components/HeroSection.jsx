import React from 'react'

const stats = [
  { value: '500+', label: 'Happy Families', icon: '👨‍👩‍👧' },
  { value: '24h',  label: 'Farm to Fork',   icon: '⚡' },
  { value: '100%', label: 'Pesticide Free', icon: '🌿' },
  { value: '4.9★', label: 'Customer Rating', icon: '⭐' },
]

const values = [
  { emoji: '🌿', name: '100% Organic',    desc: 'No pesticides, ever',      color: 'from-green-500/25 to-green-600/10'  },
  { emoji: '⚡', name: 'Same-day Fresh',  desc: 'Harvested & delivered daily', color: 'from-yellow-500/25 to-yellow-600/10' },
  { emoji: '🚫', name: 'No Chemicals',    desc: 'Pure & safe for your family', color: 'from-red-500/25 to-red-600/10'      },
  { emoji: '🚚', name: 'Fast Delivery',   desc: 'At your door by noon',      color: 'from-blue-500/25 to-blue-600/10'    },
  { emoji: '✅', name: 'Trusted Quality', desc: 'Quality checked every batch', color: 'from-emerald-500/25 to-emerald-600/10' },
  { emoji: '🤝', name: 'Farm Direct',     desc: 'Zero middlemen, honest price', color: 'from-amber-500/25 to-amber-600/10'  },
]

export default function HeroSection() {
  function scrollToProducts(e) {
    e.preventDefault()
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden bg-hero-gradient min-h-[520px] md:min-h-[620px] flex items-center">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-earth-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Left: Text ── */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              Now delivering across Hyderabad
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.08] mb-5">
              Farm-Fresh<br />
              <span className="text-earth-400">Goodness,</span><br />
              Delivered Daily
            </h1>

            <p className="text-white/75 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
              Organic vegetables, fruits, millets & more — harvested at sunrise, at your door by noon. No chemicals, no cold storage.
            </p>

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

          {/* ── Right: Value Cards Grid (desktop only) ── */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {values.map((v, i) => (
                <div key={v.name}
                  className={`bg-gradient-to-br ${v.color} backdrop-blur-sm border border-white/20 rounded-2xl p-5 hover:border-white/40 hover:scale-[1.03] transition-all duration-300 cursor-default`}
                  style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className="text-3xl block mb-2">{v.emoji}</span>
                  <p className="text-white font-bold text-sm mb-0.5">{v.name}</p>
                  <p className="text-white/55 text-[11px] leading-snug">{v.desc}</p>
                </div>
              ))}
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
