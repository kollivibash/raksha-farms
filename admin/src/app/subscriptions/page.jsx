'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { subscriptionsAPI } from '../../lib/api'
import { RefreshCw, CheckCircle, SkipForward, Pause, Play, ChevronDown, ChevronUp } from 'lucide-react'

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000)
  return diff
}

function DeliveryBadge({ dateStr }) {
  const days = daysUntil(dateStr)
  if (days === null) return <span className="text-gray-400 text-xs">—</span>
  if (days < 0)  return <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Overdue {Math.abs(days)}d</span>
  if (days === 0) return <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Today!</span>
  if (days <= 2)  return <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">In {days}d</span>
  return <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">In {days}d</span>
}

export default function SubscriptionsPage() {
  const [subs, setSubs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [busy, setBusy]       = useState(null)

  useEffect(() => { fetchSubs() }, [])

  async function fetchSubs() {
    try {
      const res = await subscriptionsAPI.getAll()
      setSubs(Array.isArray(res.data) ? res.data : [])
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function action(id, fn, label) {
    if (!confirm(`${label}?`)) return
    setBusy(id)
    try {
      await fn()
      await fetchSubs()
    } catch { alert(`Failed: ${label}`) }
    finally { setBusy(null) }
  }

  const active   = subs.filter(s => s.is_active).length
  const paused   = subs.filter(s => !s.is_active).length
  const overdue  = subs.filter(s => s.is_active && daysUntil(s.next_delivery) < 0).length
  const today    = subs.filter(s => s.is_active && daysUntil(s.next_delivery) === 0).length

  return (
    <AdminLayout title="Customer Subscriptions">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Active',   value: active,  color: 'text-green-600'  },
          { label: 'Paused',   value: paused,  color: 'text-gray-400'   },
          { label: 'Overdue',  value: overdue, color: 'text-red-600'    },
          { label: 'Due Today',value: today,   color: 'text-orange-500' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Plan</th>
              <th className="text-left px-4 py-3">Items</th>
              <th className="text-right px-4 py-3">Per Cycle</th>
              <th className="text-center px-4 py-3">Delivered</th>
              <th className="text-center px-4 py-3">Skipped</th>
              <th className="text-center px-4 py-3">Next Delivery</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={9} className="py-12 text-center text-gray-400">Loading…</td></tr>}
            {!loading && subs.length === 0 && (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <RefreshCw size={32} className="opacity-30"/>
                    <p className="font-medium">No subscriptions yet</p>
                    <p className="text-xs">Customers who subscribe during checkout appear here</p>
                  </div>
                </td>
              </tr>
            )}
            {subs.map(s => {
              const items    = Array.isArray(s.items) ? s.items : []
              const isExpanded = expanded === s.id
              const isBusy   = busy === s.id

              return (
                <>
                  <tr key={s.id} className={`border-b border-gray-50 hover:bg-gray-50 transition ${!s.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{s.customer_name || '—'}</p>
                      <p className="text-xs text-gray-400">{s.customer_phone || s.customer_email || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-700">{s.plan_name || '—'}</p>
                      <p className="text-xs text-gray-400 capitalize">{s.frequency}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[140px]">
                      <p className="text-xs text-gray-600 truncate">{items.map(i => `${i.name} ×${i.quantity}`).join(', ') || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">₹{parseFloat(s.price_per_cycle||0).toFixed(0)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-green-600">{s.delivery_count || 0}</span>
                      <p className="text-[10px] text-gray-400">deliveries</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-orange-400">{s.skipped_count || 0}</span>
                      <p className="text-[10px] text-gray-400">skipped</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DeliveryBadge dateStr={s.next_delivery} />
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {s.next_delivery ? new Date(s.next_delivery).toLocaleDateString('en-IN') : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.is_active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Mark Delivered */}
                        <button
                          disabled={isBusy || !s.is_active}
                          onClick={() => action(s.id, () => subscriptionsAPI.markDelivered(s.id), 'Mark as Delivered')}
                          title="Mark Delivered"
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 disabled:opacity-30 transition"
                        >
                          <CheckCircle size={16}/>
                        </button>
                        {/* Skip */}
                        <button
                          disabled={isBusy || !s.is_active}
                          onClick={() => action(s.id, () => subscriptionsAPI.skipDelivery(s.id), 'Skip this delivery')}
                          title="Skip Delivery"
                          className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500 disabled:opacity-30 transition"
                        >
                          <SkipForward size={16}/>
                        </button>
                        {/* Pause/Resume */}
                        <button
                          disabled={isBusy}
                          onClick={() => action(s.id, () => subscriptionsAPI.update(s.id, { is_active: !s.is_active, next_delivery: s.next_delivery }), s.is_active ? 'Pause subscription' : 'Resume subscription')}
                          title={s.is_active ? 'Pause' : 'Resume'}
                          className={`p-1.5 rounded-lg transition disabled:opacity-30 ${s.is_active ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-600'}`}
                        >
                          {s.is_active ? <Pause size={16}/> : <Play size={16}/>}
                        </button>
                        {/* Expand */}
                        <button
                          onClick={() => setExpanded(isExpanded ? null : s.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
                        >
                          {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {isExpanded && (
                    <tr key={`${s.id}-expanded`} className="bg-blue-50/40 border-b border-blue-100">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* Items breakdown */}
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Items in This Subscription</p>
                            <div className="space-y-1">
                              {items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm text-gray-700">
                                  <span>{item.emoji} {item.name} ×{item.quantity}</span>
                                  <span className="font-medium">₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Delivery stats */}
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Delivery Stats</p>
                            <div className="space-y-1.5 text-sm text-gray-700">
                              <div className="flex justify-between">
                                <span>Started on</span>
                                <span>{s.start_date ? new Date(s.start_date).toLocaleDateString('en-IN') : new Date(s.created_at).toLocaleDateString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total delivered</span>
                                <span className="font-bold text-green-600">{s.delivery_count || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total skipped</span>
                                <span className="font-bold text-orange-500">{s.skipped_count || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total earned</span>
                                <span className="font-bold text-gray-800">₹{((s.delivery_count || 0) * parseFloat(s.price_per_cycle || 0)).toFixed(0)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Next delivery + actions */}
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Next Delivery</p>
                            <p className="text-lg font-bold text-gray-900">
                              {s.next_delivery ? new Date(s.next_delivery).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) : '—'}
                            </p>
                            <DeliveryBadge dateStr={s.next_delivery} />
                            <div className="mt-3 flex gap-2">
                              <button
                                disabled={isBusy || !s.is_active}
                                onClick={() => action(s.id, () => subscriptionsAPI.markDelivered(s.id), 'Mark as Delivered')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-40 transition"
                              >
                                <CheckCircle size={13}/> Mark Delivered
                              </button>
                              <button
                                disabled={isBusy || !s.is_active}
                                onClick={() => action(s.id, () => subscriptionsAPI.skipDelivery(s.id), 'Skip this delivery')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg hover:bg-orange-200 disabled:opacity-40 transition"
                              >
                                <SkipForward size={13}/> Skip
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
