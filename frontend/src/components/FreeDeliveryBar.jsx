import React from 'react'
import { useCart } from '../context/CartContext'
import { FREE_DELIVERY_THRESHOLD } from '../utils/constants'

export default function FreeDeliveryBar() {
  const { totalPrice } = useCart()
  const progress  = Math.min((totalPrice / FREE_DELIVERY_THRESHOLD) * 100, 100)
  const remaining = Math.max(FREE_DELIVERY_THRESHOLD - totalPrice, 0)
  const unlocked  = totalPrice >= FREE_DELIVERY_THRESHOLD

  if (totalPrice === 0) return null

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-2.5">
      <div className="max-w-7xl mx-auto">
        {unlocked ? (
          <div className="flex items-center justify-center gap-2 text-forest-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-semibold">
              You've unlocked <strong>FREE delivery</strong>!
            </span>
            <span className="text-lg">🎉</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-earth-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">
                  Add <strong className="text-forest-600">₹{remaining}</strong> more for free delivery
                </span>
                <span className="text-xs text-gray-400 font-medium ml-2 flex-shrink-0">
                  ₹{totalPrice}/₹{FREE_DELIVERY_THRESHOLD}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-forest-400 to-forest-500 rounded-full delivery-bar transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="text-lg flex-shrink-0">🚚</span>
          </div>
        )}
      </div>
    </div>
  )
}
