import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrdersContext'

const STATUS_STYLES = {
  pending:          { label: 'Pending',          icon: '⏳', bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200',  dot: 'bg-yellow-400' },
  accepted:         { label: 'Accepted',          icon: '✅', bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',   dot: 'bg-green-500'  },
  out_for_delivery: { label: 'Out for Delivery',  icon: '🚚', bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500'   },
  delivered:        { label: 'Delivered',         icon: '🎉', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500'},
  rejected:         { label: 'Rejected',          icon: '❌', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-400'    },
}

export default function MyOrdersPage() {
  const { user, logout } = useAuth()
  const { getOrdersByUser, syncOrdersByUser, syncOrdersByPhone } = useOrders()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [syncing, setSyncing] = useState(false)

  const allOrders = getOrdersByUser(user?.email)
  const hasToken = !!localStorage.getItem('auth_token')

  // Sync on every visit — by user_id first (all logged-in), phone fallback (guests)
  useEffect(() => {
    syncOrdersByUser()
    const phone = user?.phone || allOrders[0]?.customer?.phone
    if (phone) syncOrdersByPhone(phone)
  }, []) // eslint-disable-line

  async function handleForceSync() {
    setSyncing(true)
    await syncOrdersByUser()
    const phone = user?.phone || allOrders[0]?.customer?.phone
    if (phone) await syncOrdersByPhone(phone)
    setSyncing(false)
  }
  const filtered = filter === 'all' ? allOrders : allOrders.filter((o) => o.status === filter)

  const counts = allOrders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="page-enter max-w-3xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-sm overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              : user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {user?.name} · {user?.email}
              {user?.provider === 'google' && (
                <span className="ml-2 inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleForceSync}
            disabled={syncing}
            title="Sync orders from server"
            className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors flex items-center gap-1.5 border border-green-100 hover:border-green-300 px-3 py-2 rounded-xl"
          >
            <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? 'Syncing...' : 'Sync'}
          </button>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors flex items-center gap-1.5 border border-red-100 hover:border-red-300 px-4 py-2 rounded-xl"
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Orders', value: allOrders.length, icon: '📦' },
          { label: 'Delivered', value: counts.delivered || 0, icon: '🎉' },
          { label: 'In Progress', value: (counts.pending || 0) + (counts.accepted || 0) + (counts.out_for_delivery || 0), icon: '🚚' },
          { label: 'Total Spent', value: `₹${allOrders.reduce((s, o) => s + o.total, 0)}`, icon: '💰' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card p-4 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xl font-black text-gray-800">{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          { id: 'all', label: 'All' },
          { id: 'pending', label: 'Pending' },
          { id: 'accepted', label: 'Accepted' },
          { id: 'out_for_delivery', label: 'On the Way' },
          { id: 'delivered', label: 'Delivered' },
        ].map(({ id, label }) => {
          const s = STATUS_STYLES[id]
          const count = id === 'all' ? allOrders.length : counts[id] || 0
          return (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                filter === id
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-700'
              }`}
            >
              {s?.icon || '📋'} {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            {allOrders.length === 0 ? 'No orders yet' : 'No orders in this category'}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {allOrders.length === 0
              ? 'Start shopping to see your orders here'
              : 'Try a different filter above'}
          </p>

          {/* Re-login prompt when Google user has no auth token */}
          {allOrders.length === 0 && !hasToken && user?.provider === 'google' && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left max-w-sm mx-auto">
              <p className="text-sm font-semibold text-amber-800 mb-1">📱 Orders not syncing?</p>
              <p className="text-xs text-amber-600 mb-4">
                Your session token has expired. Sign out and sign back in with Google to restore your orders from all devices.
              </p>
              <button
                onClick={() => { logout(); navigate('/login') }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors"
              >
                🔄 Sign out &amp; Re-login to sync
              </button>
            </div>
          )}

          {/* Force sync button when token exists but 0 orders */}
          {allOrders.length === 0 && hasToken && (
            <button
              onClick={handleForceSync}
              disabled={syncing}
              className="mb-4 px-5 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-semibold rounded-xl text-sm border border-green-200 transition-colors flex items-center gap-2 mx-auto"
            >
              {syncing ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Syncing...</>
              ) : (
                <><span>🔄</span> Refresh Orders</>
              )}
            </button>
          )}

          {allOrders.length === 0 && (
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <span>🌿</span> Shop Now
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.orderId} order={order} />
          ))}
        </div>
      )}

      {/* Shop more */}
      {allOrders.length > 0 && (
        <div className="text-center mt-10">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <span>🛒</span> Continue Shopping
          </Link>
        </div>
      )}
    </div>
  )
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const s = STATUS_STYLES[order.status] || STATUS_STYLES.pending

  const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className={`card overflow-hidden border-l-4 ${s.border}`}>
      {/* Summary row */}
      <button
        className="w-full text-left p-5"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">
                Order #{order.orderId}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="font-black text-green-700 text-lg">₹{order.total}</p>
              <p className="text-gray-400 text-xs">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${s.bg} ${s.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Items preview */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {order.items.slice(0, 5).map((item) => (
            <span key={item.id} className="inline-flex items-center gap-1 bg-gray-50 text-gray-600 text-xs px-2.5 py-1 rounded-full">
              {item.emoji} {item.name}
            </span>
          ))}
          {order.items.length > 5 && (
            <span className="text-xs text-gray-400 px-2 py-1">+{order.items.length - 5} more</span>
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-50 px-5 pb-5 animate-slide-up">
          {/* Delivery address */}
          <div className="mt-4 bg-gray-50 rounded-xl p-3 text-sm">
            <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <span>📍</span> Delivery Address
            </p>
            <p className="text-gray-500">{order.customer.address}</p>
            {order.customer.notes && (
              <p className="text-gray-400 text-xs mt-1 italic">Note: {order.customer.notes}</p>
            )}
          </div>

          {/* Items breakdown */}
          <div className="mt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Items</p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-700">
                    <span>{item.emoji}</span>
                    <span>{item.name}</span>
                    <span className="text-gray-400 text-xs">× {item.quantity} {item.unit}</span>
                  </span>
                  <span className="font-semibold text-gray-800">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="mt-4 border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span><span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span className={order.deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 border-t pt-2">
              <span>Total</span>
              <span className="text-green-700">₹{order.total}</span>
            </div>
            <div className="flex justify-between text-gray-400 text-xs">
              <span>Payment</span>
              <span>{order.paymentMethod === 'upi' ? '📱 UPI' : '💵 Cash on Delivery'}</span>
            </div>
          </div>

          {/* Delivery time if set */}
          {order.deliveryTime && (
            <div className="mt-3 flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2.5">
              <span>🕐</span>
              <p className="text-sm text-green-700 font-medium">
                Estimated delivery: {order.deliveryTime}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
