import React from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

const features = [
  {
    icon: '🌱',
    title: '100% Certified Organic',
    desc: 'Every product is grown without pesticides or chemicals. Directly from our farm to your table — pure, safe, and natural.',
    color: 'from-green-50 to-emerald-50',
    border: 'border-green-100',
    iconBg: 'bg-green-100',
  },
  {
    icon: '⚡',
    title: 'Same Day Delivery',
    desc: 'Order by noon and receive fresh produce at your doorstep the same evening. Faster than any supermarket.',
    color: 'from-yellow-50 to-amber-50',
    border: 'border-yellow-100',
    iconBg: 'bg-yellow-100',
  },
  {
    icon: '💸',
    title: 'Farm Direct Prices',
    desc: 'No middlemen, no markup. You pay honest farm prices and get maximum freshness straight from the source.',
    color: 'from-blue-50 to-cyan-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-100',
  },
  {
    icon: '🛡️',
    title: 'Quality Guaranteed',
    desc: 'Not satisfied? We replace or fully refund your order. Your trust is our most important harvest.',
    color: 'from-purple-50 to-violet-50',
    border: 'border-purple-100',
    iconBg: 'bg-purple-100',
  },
]

export default function WhyChooseUs() {
  useScrollReveal()

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 reveal">
          <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
            Why Raksha Farms
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            The Freshest Choice,{' '}
            <span className="gradient-text">Every Time</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            We're not just a store — we're your neighbourhood farm, committed to
            delivering health and trust with every order.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`reveal feature-card bg-gradient-to-br ${f.color} border ${f.border} rounded-2xl p-6 cursor-default delay-${(i + 1) * 100}`}
            >
              <div className={`feature-icon w-14 h-14 ${f.iconBg} rounded-2xl flex items-center justify-center text-3xl mb-5`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
