import React, { useState, useEffect, useRef } from 'react'

function AnimatedCounter({ end, suffix = '', duration = 1800 }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(end)
    }
    requestAnimationFrame(step)
  }, [started, end, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  )
}

const floatingItems = [
  { emoji: '🌿', top: '10%',  left: '6%',  size: 'text-4xl', delay: '0s',   duration: '6s' },
  { emoji: '🍅', top: '18%',  right: '8%', size: 'text-3xl', delay: '1s',   duration: '8s' },
  { emoji: '🥕', bottom: '22%', left: '12%', size: 'text-3xl', delay: '2s', duration: '7s' },
  { emoji: '🥦', bottom: '14%', right: '18%', size: 'text-4xl', delay: '0.5s', duration: '5s' },
  { emoji: '🍎', top: '42%',  left: '42%', size: 'text-2xl', delay: '3s',   duration: '9s' },
  { emoji: '🌾', top: '55%',  right: '5%', size: 'text-3xl', delay: '1.5s', duration: '6.5s' },
]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 min-h-[80vh] flex items-center">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl" style={{ animation: 'floatSlow 12s ease-in-out infinite' }} />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-green-300/10 rounded-full blur-3xl" style={{ animation: 'floatSlow 10s ease-in-out 2s infinite' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" />
      </div>

      {/* Floating emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {floatingItems.map((item, i) => (
          <span
            key={i}
            className={`absolute ${item.size} opacity-20`}
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
              animation: `float ${item.duration} ease-in-out ${item.delay} infinite`,
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-2xl">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-5 py-2 rounded-full mb-7 border border-white/25 shadow-sm">
            <span className="pulse-dot w-2 h-2 bg-green-400 rounded-full" />
            100% Organic & Natural — Hyderabad
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.08] mb-5 tracking-tight">
            Fresh from Farm
            <br />
            <span className="shimmer-text">to Your Doorstep</span>{' '}
            <span className="inline-block" style={{ animation: 'float 4s ease-in-out infinite' }}>🌿</span>
          </h1>

          {/* Sub-text */}
          <p className="text-green-100 text-lg md:text-xl mb-9 leading-relaxed max-w-xl">
            Order fresh vegetables, seasonal fruits, and daily groceries directly from
            Raksha Farms. Hand-picked, pesticide-free, delivered the same day.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-12">
            <a
              href="#products"
              className="btn-ripple inline-flex items-center gap-2.5 bg-white text-green-700 font-bold px-8 py-4 rounded-2xl hover:bg-green-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-base"
            >
              <span className="text-xl">🛒</span> Shop Now
            </a>
            <a
              href="#categories"
              className="btn-ripple inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-2xl border border-white/30 hover:bg-white/25 transition-all duration-200 text-base"
            >
              <span className="text-xl">📦</span> View Categories
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6">
            {[
              { icon: '🌱', label: 'Zero Pesticides' },
              { icon: '🚚', label: 'Same Day Delivery' },
              { icon: '💯', label: 'Quality Guaranteed' },
              { icon: '🤝', label: 'COD Available' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-green-100 text-sm font-medium">
                <span className="text-base">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Animated stat counters — bottom right on large screens */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
          {[
            { end: 500, suffix: '+', label: 'Happy Families' },
            { end: 22, suffix: '+', label: 'Products' },
            { end: 5, suffix: '★', label: 'Google Rating' },
            { end: 100, suffix: '%', label: 'Organic' },
          ].map(({ end, suffix, label }) => (
            <div
              key={label}
              className="glass-card rounded-2xl px-4 py-4 text-center"
            >
              <div className="text-2xl md:text-3xl font-black text-green-700 mb-0.5">
                <AnimatedCounter end={end} suffix={suffix} />
              </div>
              <div className="text-gray-500 text-xs font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 70 L0 35 Q360 0 720 35 Q1080 70 1440 35 L1440 70 Z" fill="#f0fdf4" />
        </svg>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-14px) rotate(4deg); }
          66%       { transform: translateY(-7px) rotate(-3deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
    </section>
  )
}
