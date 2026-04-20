import React from 'react'

const badges = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Farm to Fork in 24h',
    desc: 'Harvested & delivered same day',
    color: 'text-forest-500',
    bg: 'bg-forest-50',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: 'Chemical Free',
    desc: '100% natural, no pesticides',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Secure Payments',
    desc: 'UPI, cards & COD accepted',
    color: 'text-earth-600',
    bg: 'bg-earth-50',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Free Delivery',
    desc: 'On orders above ₹500',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
]

export default function TrustBadges({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-4 flex-wrap">
        {badges.map((b) => (
          <div key={b.title} className="flex items-center gap-1.5">
            <span className={`${b.color} opacity-80`}>{b.icon}</span>
            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">{b.title}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <section className="py-8 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((b, i) => (
            <div
              key={b.title}
              className={`reveal delay-${(i + 1) * 100} flex items-center gap-3 p-4 rounded-2xl ${b.bg} transition-all duration-300 hover:shadow-soft`}
            >
              <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${b.bg} ${b.color} flex items-center justify-center border border-white shadow-sm`}>
                {b.icon}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm leading-tight">{b.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
