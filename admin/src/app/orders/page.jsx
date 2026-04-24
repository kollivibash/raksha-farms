'use client'
import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import StatusBadge from '../../components/StatusBadge'
import { ordersAPI } from '../../lib/api'
import { Search, RefreshCw, Eye } from 'lucide-react'

const STATUSES = ['placed','accepted','preparing','out_for_delivery','delivered','rejected']

const STATUS_LABELS = {
  placed:           'Placed',
  accepted:         'Accepted',
  preparing:        'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Rejected',
  rejected:         'Rejected',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)  // expanded order id (not modal)

  async function load() {
    setLoading(true)
    try {
      const { data } = await ordersAPI.getAll({ page, limit: 15, status, search })
      setOrders(data.orders); setTotal(data.total)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [page, status])

  async function changeStatus(id, newStatus) {
    try {
      await ordersAPI.updateStatus(id, newStatus)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
    } catch(e) { alert(e.response?.data?.error || 'Failed') }
  }

  return (
    <AdminLayout title="Orders">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 max-w-xs">
          <Search size={16} className="text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()}
            placeholder="Search by name/phone…" className="outline-none text-sm flex-1"/>
        </div>
        <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
          <option value="">All Statuses</option>
          {STATUSES.map(s=><option key={s} value={s}>{STATUS_LABELS[s] || s.replace(/_/g,' ')}</option>)}
        </select>
        <button onClick={load} className="bg-white border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50">
          <RefreshCw size={16}/>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Order ID</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Customer</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Items</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Total</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Update</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading…</td></tr>}
              {!loading && orders.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-400">No orders found</td></tr>}
              {orders.map(o => {
                const isOpen = selected === o.id
                const addr   = typeof o.address === 'string' ? JSON.parse(o.address || '{}') : (o.address || {})
                return (
                  <React.Fragment key={o.id}>
                    <tr
                      onClick={() => setSelected(isOpen ? null : o.id)}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer select-none"
                      title="Click to view order details">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-gray-500">{o.id.slice(0,8)}…</span>
                          <span className="text-gray-300 text-xs">{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{o.customer_name || addr.name || 'Guest'}</p>
                        <p className="text-xs text-gray-400">{o.customer_phone || addr.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{Array.isArray(o.items) ? o.items.length : 0} items</td>
                      <td className="px-4 py-3 text-right font-semibold">₹{Number(o.total).toLocaleString()}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.status}/></td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <select value={o.status} onChange={e=>changeStatus(o.id, e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1B4332]">
                          {STATUSES.map(s=><option key={s} value={s}>{STATUS_LABELS[s] || s.replace(/_/g,' ')}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>

                    {isOpen && (
                      <tr className="bg-green-50 border-b border-gray-100">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {/* Items */}
                            <div>
                              <p className="font-semibold text-gray-700 mb-2">🛒 Items Ordered</p>
                              <ul className="space-y-1">
                                {(Array.isArray(o.items) ? o.items : []).map((item, i) => (
                                  <li key={i} className="flex justify-between text-gray-600">
                                    <span>{item.name} × {item.quantity} {item.unit}</span>
                                    <span className="font-medium">₹{item.price * item.quantity}</span>
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-2 pt-2 border-t border-green-200 flex justify-between font-semibold text-gray-800">
                                <span>Total</span><span>₹{Number(o.total).toLocaleString()}</span>
                              </div>
                            </div>
                            {/* Delivery info */}
                            <div>
                              <p className="font-semibold text-gray-700 mb-2">📍 Delivery Details</p>
                              <div className="space-y-1 text-gray-600">
                                <p><span className="text-gray-400">Name:</span> {addr.name || o.customer_name || '—'}</p>
                                <p><span className="text-gray-400">Phone:</span> {addr.phone || o.customer_phone || '—'}</p>
                                <p><span className="text-gray-400">Address:</span> {addr.address || '—'}</p>
                                {addr.slot && <p><span className="text-gray-400">Slot:</span> {addr.slot}</p>}
                                {(addr.notes || o.notes) && <p><span className="text-gray-400">Notes:</span> {addr.notes || o.notes}</p>}
                                <p><span className="text-gray-400">Payment:</span> {o.payment_method === 'cod' ? 'Cash on Delivery' : (o.payment_method || '').toUpperCase()}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">Showing {orders.length} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page===1} onClick={()=>setPage(p=>p-1)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
            <button disabled={orders.length<15} onClick={()=>setPage(p=>p+1)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
