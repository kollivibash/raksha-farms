import React from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

const reviews = [
  {
    name: 'Phanindra Yadav',
    initials: 'PY',
    color: 'from-green-400 to-emerald-500',
    rating: 5,
    time: '2 days ago',
    badge: '2 reviews',
    title: 'Fresh, healthy, and truly organic vegetables',
    text: 'You can really taste the difference — pure, chemical-free, and straight from the farm! Highly impressed with the quality.',
  },
  {
    name: 'Duddupudi Himagiri',
    initials: 'DH',
    color: 'from-blue-400 to-cyan-500',
    rating: 5,
    time: '1 week ago',
    badge: '1 review',
    title: 'Chemical-free vegetables & authentic wood-pressed oils',
    text: 'Raksha Farms provides fresh, chemical-free organic vegetables and authentic wood-pressed oils. The quality is very good, and you can really feel the difference in taste and purity. Great initiative towards healthy living. Highly recommended to everyone.',
  },
  {
    name: 'Bhargava Mandapati',
    initials: 'BM',
    color: 'from-purple-400 to-violet-500',
    rating: 5,
    time: '1 week ago',
    badge: 'Local Guide · 6 reviews · 6 photos',
    title: 'Genuinely impressed — quality and service both outstanding',
    text: "I recently tried products from Raksha Farms here in Hyderabad, and honestly, I didn't expect to be this impressed. I bought their cold-pressed oil and some organic vegetables. The oil felt really pure — like the kind we used to have at home years ago. And the vegetables were super fresh and full of actual taste. But what I liked the most was how they treat customers. Very polite, patient, and genuinely helpful. It didn't feel like a typical business transaction at all. 👍",
  },
]

function StarRating({ count }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < count ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function ReviewsSection() {
  useScrollReveal()

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 reveal">
          <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
            Customer Reviews
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>

          {/* Overall rating */}
          <div className="inline-flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm mt-2">
            <div className="text-center">
              <div className="text-5xl font-black text-gray-900">5.0</div>
              <StarRating count={5} />
              <p className="text-gray-400 text-xs mt-1">Based on Google Reviews</p>
            </div>
            <div className="h-16 w-px bg-gray-100" />
            <div className="text-left space-y-1">
              {[5, 4, 3, 2, 1].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-2">{s}</span>
                  <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: s === 5 ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div
              key={review.name}
              className={`review-card reveal delay-${(i + 1) * 150} bg-white rounded-2xl p-6 shadow-card border border-gray-50 flex flex-col`}
            >
              {/* Top: avatar + name */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${review.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                >
                  {review.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{review.name}</p>
                  <p className="text-gray-400 text-xs">{review.badge}</p>
                  <p className="text-gray-400 text-xs">{review.time}</p>
                </div>
                {/* Google G logo */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>

              {/* Stars */}
              <StarRating count={review.rating} />

              {/* Review title */}
              <p className="font-semibold text-gray-800 text-sm mt-3 mb-2">{review.title}</p>

              {/* Review text */}
              <p className="text-gray-500 text-sm leading-relaxed flex-1">{review.text}</p>

              {/* Verified badge */}
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-green-600 font-medium">Verified Purchase</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10 reveal delay-300">
          <p className="text-gray-500 text-sm mb-4">Join 500+ happy families ordering from Raksha Farms</p>
          <a
            href="#products"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            <span>🌿</span> Order Fresh Today
          </a>
        </div>
      </div>
    </section>
  )
}
