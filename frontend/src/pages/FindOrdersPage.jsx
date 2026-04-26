import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const STATUS_LABEL = {
  placed: '⏳ Pending', accepted: '✅ Accepted', preparing: '🍳 Preparing',
  out_for_delivery: '🚚 Out for Delivery', delivered: '🎉 Delivered',
  cancelled: '❌ Cancelled', rejected: '❌ Rejected', pending: '⏳ Pending',
}

export default function FindOrdersPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')

  async function search() {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) { setError('Enter a valid 10-digit number'); return }
    setError(''); setLoading(true); setOrders(null)
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/by-phone/${digits}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Server error')
      setOrders(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌿</div>
          <h1 className="text-2xl font-black text-green-700">Find Your Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Enter the mobile number you used at checkout</p>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
            onKeyDown={e => e.key === 'Enter' && search()}
            className="flex-1 border-2 border-green-200 focus:border-green-500 rounded-2xl px-4 py-3 text-lg font-semibold focus:outline-none"
          />
          <button
            onClick={search}
            disabled={loading || phone.replace(/\D/g,'').length < 10}
            className="px-5 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold rounded-2xl text-sm transition-colors"
          >
            {loading ? '…' : 'Find'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm mb-4">
            ❌ {error}
          </div>
        )}

        {orders !== null && orders.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📦</div>
            <p className="font-semibold">No orders found for this number</p>
            <p className="text-xs mt-1">Try the exact number used during checkout</p>
          </div>
        )}

        {orders && orders.length > 0 && (
          <div>
            <p className="text-green-700 font-bold mb-3">✅ Found {orders.length} order(s)</p>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {orders.map(o => {
                const items = (() => { try { const a = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items||[]); return a.map(i=>i.name).join(', ') || '—' } catch { return '—' } })()
                const date = o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}) : ''
                return (
                  <div key={o.id} className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-gray-400 font-mono">#{o.reference_id || o.id?.slice(0,8)}</span>
                      <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">{STATUS_LABEL[o.status] || o.status}</span>
                    </div>
                    <div className="text-2xl font-black text-green-700">₹{o.total}</div>
                    <div className="text-sm text-gray-600 mt-1 truncate">{items}</div>
                    <div className="text-xs text-gray-400 mt-1">{date}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-2 justify-center">
          <Link to="/" className="text-sm text-green-600 hover:underline font-semibold">← Home</Link>
          <span className="text-gray-300">|</span>
          <Link to="/my-orders" className="text-sm text-green-600 hover:underline font-semibold">My Orders →</Link>
        </div>
      </div>
    </div>
  )
}
