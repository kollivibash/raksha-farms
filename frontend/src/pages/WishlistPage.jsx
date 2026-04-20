import React from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

export default function WishlistPage() {
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist()
  const { addToCart, openDrawer } = useCart()
  const { addToast } = useToast()

  function handleAddAll() {
    wishlist.forEach((p) => {
      if (p.stock > 0) addToCart(p, 1)
    })
    addToast('All available items added to cart!', 'success')
    openDrawer()
  }

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Wishlist</h1>
          <p className="text-gray-400 text-sm mt-0.5">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved</p>
        </div>
        {wishlist.length > 0 && (
          <div className="flex gap-2">
            <button onClick={handleAddAll} className="btn-primary text-sm px-4 py-2.5 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5M7 13l1.5 5m7-5l1.5 5M17 18a1 1 0 11-2 0 1 1 0 012 0zM9 18a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              Add All to Cart
            </button>
            <button
              onClick={clearWishlist}
              className="btn-secondary text-sm px-4 py-2.5"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-24 h-24 mx-auto rounded-full bg-rose-50 flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 mb-6">Save your favourite products for later</p>
          <Link to="/" className="btn-primary inline-flex">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wishlist.map((product) => (
            <WishlistCard
              key={product.id}
              product={product}
              onRemove={() => { toggleWishlist(product); addToast('Removed from wishlist', 'info') }}
              onAddToCart={() => {
                if (product.stock === 0) { addToast('Out of stock', 'warning'); return }
                addToCart(product, 1)
                addToast(`${product.name} added to cart!`, 'success')
                openDrawer()
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function WishlistCard({ product, onRemove, onAddToCart }) {
  const isOutOfStock = product.stock === 0
  return (
    <div className="card overflow-hidden flex flex-col group">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden" style={{ height: '180px' }}>
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-sage-50 flex items-center justify-center text-5xl">{product.emoji || '🌿'}</div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
          </div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); onRemove() }}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product.id}`} className="font-bold text-gray-800 hover:text-forest-500 transition-colors text-sm mb-1 line-clamp-1">{product.name}</Link>
        <p className="text-gray-400 text-xs mb-3 flex-1">{product.category}</p>
        <div className="flex items-center justify-between">
          <span className="text-forest-500 font-black text-xl">₹{product.price}<span className="text-xs font-normal text-gray-400">/{product.unit}</span></span>
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-forest-500 hover:bg-forest-600 text-white shadow-sm'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
