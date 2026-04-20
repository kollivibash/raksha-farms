import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrdersContext'
import { useWishlist } from '../context/WishlistContext'

export default function ProfilePage() {
  const { user, logout, isLoggedIn } = useAuth()
  const { orders } = useOrders()
  const { wishlist } = useWishlist()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  if (!isLoggedIn) {
    return (
      <div className="page-enter min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-full bg-sage-100 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Sign in to view your profile</h2>
        <p className="text-gray-400 mb-5">Access your orders, wishlist, and preferences</p>
        <Link to="/login" className="btn-primary">Sign In / Sign Up</Link>
      </div>
    )
  }

  const deliveredOrders = orders.filter((o) => o.status === 'delivered')
  const totalSpent      = deliveredOrders.reduce((s, o) => s + o.total, 0)

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders',   label: `Orders (${orders.length})` },
  ]

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      {/* Profile header */}
      <div className="card p-6 mb-6 flex items-center gap-5 flex-wrap">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center text-white font-black text-3xl shadow-forest flex-shrink-0">
          {user?.avatar
            ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
            : user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black text-gray-800">{user?.name}</h1>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="badge bg-forest-100 text-forest-600 text-[10px]">
              {user?.provider === 'google' ? 'Google Account' : 'Email Account'}
            </span>
            <span className="text-xs text-gray-400">Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</span>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/') }}
          className="text-sm text-red-400 hover:text-red-600 font-medium border border-red-200 hover:border-red-400 px-4 py-2 rounded-xl transition-all flex-shrink-0"
        >
          Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatBox value={orders.length} label="Total Orders" color="text-forest-500" />
        <StatBox value={deliveredOrders.length} label="Completed" color="text-green-600" />
        <StatBox value={`₹${totalSpent}`} label="Total Spent" color="text-earth-600" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.id ? 'bg-white text-forest-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4 animate-slide-up">
          {/* Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: '📦', label: 'My Orders', to: '/my-orders' },
              { icon: '❤️', label: `Wishlist (${wishlist.length})`, to: '/wishlist' },
              { icon: '📞', label: 'Contact Support', to: 'tel:+919346566945', external: true },
            ].map((item) => (
              item.external ? (
                <a key={item.label} href={item.to} className="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-soft transition-all">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                </a>
              ) : (
                <Link key={item.label} to={item.to} className="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-soft transition-all">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                </Link>
              )
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="animate-slide-up space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-16 card">
              <p className="text-5xl mb-3">📦</p>
              <p className="font-semibold text-gray-600 mb-1">No orders yet</p>
              <p className="text-gray-400 text-sm mb-4">Your past orders will appear here</p>
              <Link to="/" className="btn-primary inline-flex text-sm">Shop Now</Link>
            </div>
          ) : (
            [...orders].reverse().map((order) => (
              <Link key={order.orderId} to={`/track/${order.orderId}`} className="card p-4 flex items-center gap-4 hover:shadow-soft transition-all block">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-sm font-bold text-gray-700">#{order.orderId.slice(-8)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-forest-500 text-lg">₹{order.total}</p>
                  <svg className="w-4 h-4 text-gray-300 ml-auto mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function StatBox({ value, label, color }) {
  return (
    <div className="card p-4 text-center">
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    pending:          'bg-yellow-100 text-yellow-700',
    accepted:         'bg-blue-100 text-blue-700',
    out_for_delivery: 'bg-purple-100 text-purple-700',
    delivered:        'bg-forest-100 text-forest-700',
    rejected:         'bg-red-100 text-red-600',
  }
  return (
    <span className={`badge text-[10px] ${map[status] || map.pending}`}>
      {status?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  )
}
