import React, { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

// Seeded pseudo-random so each product gets a consistent rating
function seededRating(id) {
  const seed = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const ratings = [4.7, 4.8, 4.9, 5.0, 4.6, 4.8, 4.9, 4.7, 5.0, 4.8]
  return ratings[seed % ratings.length]
}

function Stars({ rating = 5 }) {
  const full = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full
        const half = !filled && hasHalf && i === full
        return (
          <svg key={i} className={`w-3 h-3 ${filled || half ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )
      })}
    </div>
  )
}

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity } = useCart()
  const { addToast } = useToast()
  const [adding, setAdding] = useState(false)

  const cartItem = cart.find((item) => item.id === product.id)
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  function handleAdd() {
    if (isOutOfStock) return
    setAdding(true)
    addToCart(product, 1)
    addToast(`${product.emoji} ${product.name} added to cart!`, 'success')
    setTimeout(() => setAdding(false), 500)
  }

  function increment() {
    if (cartItem.quantity >= product.stock) {
      addToast('Maximum available stock reached', 'warning')
      return
    }
    updateQuantity(product.id, cartItem.quantity + 1)
  }

  function decrement() {
    updateQuantity(product.id, cartItem.quantity - 1)
  }

  return (
    <div
      className={`card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft ${
        isOutOfStock ? 'opacity-70' : ''
      }`}
    >
      {/* Image / Emoji area */}
      <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden" style={{ height: '160px' }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              !isOutOfStock ? 'group-hover:scale-110' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className={`text-6xl transition-transform duration-300 ${
                !isOutOfStock ? 'group-hover:scale-110 group-hover:rotate-6' : ''
              }`}
            >
              {product.emoji}
            </span>
          </div>
        )}

        {/* Organic badge — top right */}
        {!isOutOfStock && (
          <div className="absolute top-2 right-2">
            <span className="organic-badge inline-flex items-center gap-1 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              🌱 Organic
            </span>
          </div>
        )}

        {/* Status badges — top left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOutOfStock && (
            <span className="badge bg-red-100 text-red-600">Out of Stock</span>
          )}
          {isLowStock && (
            <span className="badge bg-orange-100 text-orange-600 animate-pulse">
              Only {product.stock} left!
            </span>
          )}
          {product.featured && !isOutOfStock && !isLowStock && (
            <span className="badge bg-amber-100 text-amber-700">⭐ Featured</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Star rating */}
        {(() => {
          const rating = seededRating(product.id)
          return (
            <div className="flex items-center gap-1.5 mb-1.5">
              <Stars rating={rating} />
              <span className="text-[10px] text-gray-400 font-medium">({rating.toFixed(1)})</span>
            </div>
          )
        })()}

        <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">
          {product.name}
        </h3>
        <p className="text-gray-400 text-xs mb-3 leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Price row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-green-700 font-black text-xl">
              ₹{product.price}
            </span>
            <span className="text-gray-400 text-xs ml-1">/ {product.unit}</span>
          </div>
          {!isOutOfStock && (
            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{product.stock} in stock</span>
          )}
        </div>

        {/* Cart control */}
        {cartItem ? (
          <div className="flex items-center justify-between bg-green-50 rounded-xl p-1">
            <button
              onClick={decrement}
              className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-green-700 font-bold hover:bg-red-50 hover:text-red-500 transition-all duration-200"
            >
              −
            </button>
            <span className="font-bold text-green-800 text-base">
              {cartItem.quantity} <span className="text-xs font-normal text-gray-400">{product.unit}</span>
            </span>
            <button
              onClick={increment}
              className="w-9 h-9 rounded-lg bg-green-600 shadow-sm flex items-center justify-center text-white font-bold hover:bg-green-700 transition-all duration-200"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`btn-ripple w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : adding
                ? 'bg-green-500 text-white scale-95'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
            }`}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : (
              <>
                <span>{adding ? '✓' : '+'}</span>
                <span>{adding ? 'Added!' : 'Add to Cart'}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
