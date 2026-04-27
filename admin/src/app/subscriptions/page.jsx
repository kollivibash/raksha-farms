'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { subscriptionsAPI } from '../../lib/api'
import { RefreshCw } from 'lucide-react'

export default function SubscriptionsPage() {
  const [subs, setSubs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSubs() }, [])

  async function fetchSubs() {
    try {
      const res = await subscriptionsAPI.getAll()
      setSubs(Array.isArray(res.data) ? res.data : [])
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function toggle(id, is_active) {
    try {
      await subscriptionsAPI.update(id, { is_active: !is_active })
      setSubs(prev => prev.map(s => s.id === id ? { ...s, is_active: !is_active } : s))
    } catch { alert('Failed to update') }
  }

  const active   = subs.filter(s => s.is_active).length
  const inactive = subs.filter(s => !s.is_active).length

  return (
    <AdminLayout title="Customer Subscriptions">
      <div className="flex gap-4 mb-5">
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{active}</p>
          <p className="text-sm text-gray-500 mt-0.5">Active</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-400">{inactive}</p>
          <p className="text-sm text-gray-500 mt-0.5">Paused</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{subs.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Customer</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Plan</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Items</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Per Cycle</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Frequency</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Next Delivery</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="px-4 py-3"/>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400">Loading…</td></tr>
            )}
            {!loading && subs.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <RefreshCw size={32} className="opacity-30" />
                    <p className="font-medium">No subscriptions yet</p>
                    <p className="text-xs">Customers who subscribe during checkout will appear here</p>
                  </div>
                </td>
              </tr>
            )}
            {subs.map(s => {
              const items = Array.isArray(s.items) ? s.items : []
              return (
                <tr key={s.id} className={`border-b border-gray-50 hover:bg-gray-50 transition ${!s.is_active ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{s.customer_name || '—'}</p>
                    <p className="text-xs text-gray-400">{s.customer_phone || s.customer_email || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-700">{s.plan_name || '—'}</p>
                    {s.discount_percent > 0 && (
                      <p className="text-xs text-green-600">{s.discount_percent}% off</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <p className="text-xs truncate max-w-[160px]">
                      {items.length > 0 ? items.map(i => `${i.name} ×${i.quantity}`).join(', ') : '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">
                    ₹{parseFloat(s.price_per_cycle || 0).toFixed(0)}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    <span className="flex items-center gap-1 text-gray-600">
                      <RefreshCw size={12}/> {s.frequency || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {s.next_delivery ? new Date(s.next_delivery).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.is_active ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(s.id, s.is_active)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                        s.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {s.is_active ? 'Pause' : 'Resume'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
