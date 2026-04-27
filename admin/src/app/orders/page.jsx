'use client'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import AdminLayout from '../../components/AdminLayout'
import StatusBadge from '../../components/StatusBadge'
import { ordersAPI } from '../../lib/api'
import { Search, RefreshCw, Download, X, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from 'lucide-react'

const STATUSES = ['placed','accepted','preparing','out_for_delivery','delivered','cancelled','rejected']
const STATUS_LABELS = {
  placed: 'Placed', accepted: 'Accepted', preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
  cancelled: 'Cancelled', rejected: 'Rejected',
}
const STATUS_COLORS = {
  placed: 'bg-blue-100 text-blue-700 border-blue-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  preparing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  out_for_delivery: 'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
}

// ── Rejection Modal ──────────────────────────────────────────────────────────
function RejectModal({ order, onClose, onConfirm }) {
  const items = Array.isArray(order.items) ? order.items : []
  const [checkedIds, setCheckedIds] = useState(new Set(items.map((_,i) => i)))
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function toggle(idx) {
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  const allSelected   = checkedIds.size === items.length
  const noneSelected  = checkedIds.size === 0
  const partialReject = checkedIds.size > 0 && checkedIds.size < items.length

  async function handleSubmit() {
    if (noneSelected) { alert('Select at least one item to reject'); return }
    setSubmitting(true)
    const rejectedItems = items
      .filter((_, i) => checkedIds.has(i))
      .map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price, unit: item.unit, emoji: item.emoji }))
    const newStatus = allSelected ? 'rejected' : 'accepted'
    await onConfirm(newStatus, remarks, rejectedItems)
    setSubmitting(false)
  }

  const rejectedTotal = items.filter((_,i) => checkedIds.has(i)).reduce((s,it) => s + it.price * it.quantity, 0)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Reject Order Items</h2>
            <p className="text-xs text-gray-500 mt-0.5">#{order.reference_id || order.id?.slice(0,8)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="px-6 py-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Select items to reject:</p>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {items.map((item, i) => (
              <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${checkedIds.has(i) ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                <input type="checkbox" checked={checkedIds.has(i)} onChange={() => toggle(i)}
                  className="w-4 h-4 accent-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.emoji} {item.name}</p>
                  <p className="text-xs text-gray-500">× {item.quantity} {item.unit} · ₹{item.price * item.quantity}</p>
                </div>
                {checkedIds.has(i) && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Reject</span>
                )}
              </label>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm">
            {allSelected && <p className="text-orange-700 font-semibold">⚠️ All items rejected → Order status: <span className="text-red-600">Rejected</span></p>}
            {partialReject && <p className="text-orange-700 font-semibold">⚠️ Partial rejection → Order status: <span className="text-green-600">Accepted</span> (only selected items rejected)</p>}
            <p className="text-orange-600 text-xs mt-1">Rejected value: ₹{rejectedTotal} — stock will be restored automatically</p>
          </div>

          {/* Remarks */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Remarks / Reason <span className="text-gray-400 font-normal">(shown to customer)</span></label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="e.g. Item out of stock, quality issue, not available today…"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || noneSelected}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold rounded-xl text-sm transition-colors"
          >
            {submitting ? 'Processing…' : allSelected ? '❌ Reject Order' : '⚠️ Partial Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders, setOrders]     = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [status, setStatus]     = useState('')
  const [search, setSearch]     = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [rejectOrder, setRejectOrder] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [toast, setToast]       = useState(null)  // { msg, type: 'success'|'error' }
  const [tick, setTick]         = useState(0)     // increment to force a reload

  // Keep latest filter state in a ref so async handlers always read fresh values
  const filtersRef = useRef({ page, status, search, fromDate, toDate })
  useEffect(() => { filtersRef.current = { page, status, search, fromDate, toDate } }, [page, status, search, fromDate, toDate])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Central load — always reads fresh filters from ref
  const load = useCallback(async (overrides = {}) => {
    setLoading(true)
    try {
      const f = filtersRef.current
      const params = {
        page:      overrides.page      ?? f.page,
        limit:     15,
        status:    overrides.status    ?? f.status,
        search:    overrides.search    ?? f.search,
        from_date: overrides.fromDate  ?? f.fromDate,
        to_date:   overrides.toDate    ?? f.toDate,
      }
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k] })
      const { data } = await ordersAPI.getAll(params)
      setOrders(data.orders || [])
      setTotal(data.total   || 0)
    } catch(e) {
      console.error('load error', e)
    } finally {
      setLoading(false)
    }
  }, []) // no deps — reads from ref

  // Re-run load whenever page/status/dates change OR tick is bumped
  useEffect(() => { load() }, [page, status, fromDate, toDate, tick, load])

  function forceReload() { setTick(t => t + 1) }

  function applySearch() { setPage(1); load({ page: 1, search }) }

  function changeFilter(key, val) {
    setPage(1)
    if (key === 'status')   setStatus(val)
    if (key === 'fromDate') setFromDate(val)
    if (key === 'toDate')   setToDate(val)
  }

  function clearFilters() {
    setStatus(''); setSearch(''); setFromDate(''); setToDate(''); setPage(1)
    forceReload()
  }

  async function changeStatus(id, newStatus) {
    try {
      await ordersAPI.updateStatus(id, newStatus)
      // Immediate optimistic update — no forceReload (would overwrite with stale data)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
    } catch(e) {
      showToast(e.response?.data?.error || 'Status update failed', 'error')
    }
  }

  async function handleRejectConfirm(orderId, newStatus, remarks, rejectedItems) {
    try {
      await ordersAPI.updateStatus(orderId, newStatus, {
        rejection_notes: remarks,
        rejected_items:  rejectedItems,
      })

      // Build rejection info locally — don't rely on backend response
      // because Render may be running old code that doesn't save notes/total
      const original   = orders.find(o => o.id === orderId)
      const allItems   = Array.isArray(original?.items) ? original.items : []
      const deliveryFee = Number(original?.delivery_fee || 0)

      // Compute originalTotal from items (more reliable than stored total field,
      // which can be 0 if backend had a parse error or prior bad state)
      const itemsSubtotal  = allItems.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 1), 0)
      const originalTotal  = itemsSubtotal > 0 ? itemsSubtotal + deliveryFee : Number(original?.total || 0)

      const rejectedAmount = rejectedItems.reduce((s, ri) => s + Number(ri.price || 0) * Number(ri.quantity || 1), 0)
      const allRejected    = rejectedItems.length >= (allItems.length || original?.items?.length || 0)
      const adjustedTotal  = allRejected ? 0 : Math.max(deliveryFee, originalTotal - rejectedAmount)

      const localNotes = JSON.stringify({
        remarks,
        rejected_items:  rejectedItems,
        original_total:  originalTotal,
        rejected_amount: rejectedAmount,
        adjusted_total:  adjustedTotal,
      })

      setOrders(prev => prev.map(o => {
        if (o.id !== orderId) return o
        return {
          ...o,
          status: newStatus,
          total:  adjustedTotal,
          notes:  localNotes,
        }
      }))

      setRejectOrder(null)
      showToast(newStatus === 'rejected' ? '❌ Order rejected' : '⚠️ Partial rejection saved')
    } catch(e) {
      const msg = e.response?.data?.error || e.message || 'Failed to reject order'
      console.error('reject error:', e)
      showToast(msg, 'error')
    }
  }

  // ── CSV Download ──
  async function downloadCSV() {
    setDownloading(true)
    try {
      const params = { page: 1, limit: 1000, status, search, from_date: fromDate, to_date: toDate }
      Object.keys(params).forEach(k => !params[k] && delete params[k])
      const { data } = await ordersAPI.getAll(params)
      const rows = data.orders || []
      const headers = ['Order ID', 'Customer', 'Phone', 'Address', 'Items', 'Payment', 'Status', 'Total', 'Date']
      const lines = rows.map(o => {
        const addr = typeof o.address === 'string' ? JSON.parse(o.address || '{}') : (o.address || {})
        const items = (Array.isArray(o.items) ? o.items : []).map(i => `${i.name}×${i.quantity}`).join(' | ')
        return [
          o.reference_id || o.id,
          addr.name || o.customer_name || 'Guest',
          addr.phone || o.customer_phone || '',
          (addr.address || '').replace(/,/g, ';'),
          items,
          o.payment_method || '',
          STATUS_LABELS[o.status] || o.status,
          o.total,
          new Date(o.created_at).toLocaleDateString('en-IN'),
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
      })
      const csv = [headers.join(','), ...lines].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`
      a.click(); URL.revokeObjectURL(url)
    } catch(e) { alert('Download failed') }
    finally { setDownloading(false) }
  }

  const activeFilterCount = [status, search, fromDate, toDate].filter(Boolean).length

  return (
    <AdminLayout title="Orders">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold transition-all
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
          {toast.msg}
        </div>
      )}

      {/* Rejection modal */}
      {rejectOrder && (
        <RejectModal
          order={rejectOrder}
          onClose={() => setRejectOrder(null)}
          onConfirm={(newStatus, remarks, rejectedItems) =>
            handleRejectConfirm(rejectOrder.id, newStatus, remarks, rejectedItems)}
        />
      )}

      {/* ── Filters Row ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-48">
            <Search size={15} className="text-gray-400 flex-shrink-0"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
              placeholder="Search by name, phone or order ID…"
              className="outline-none text-sm flex-1 min-w-0"
            />
            {search && <button onClick={() => { setSearch(''); load({ search: '' }) }}><X size={13} className="text-gray-400 hover:text-gray-600"/></button>}
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <input type="date" value={fromDate} onChange={e => changeFilter('fromDate', e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none text-gray-600"/>
            <span className="text-gray-400 text-sm">to</span>
            <input type="date" value={toDate} onChange={e => changeFilter('toDate', e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none text-gray-600"/>
          </div>

          {/* Refresh + Download */}
          <button onClick={forceReload} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors" title="Refresh">
            <RefreshCw size={16} className={loading ? 'animate-spin text-gray-400' : 'text-gray-500'}/>
          </button>
          <button onClick={downloadCSV} disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-600 disabled:opacity-50 transition-colors">
            <Download size={15}/> {downloading ? 'Exporting…' : 'Export CSV'}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium hover:bg-red-100 transition-colors">
              <X size={13}/> Clear ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={() => changeFilter('status', '')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${!status ? 'bg-[#1B4332] text-white border-[#1B4332]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
            All ({total})
          </button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => changeFilter('status', s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${status === s ? STATUS_COLORS[s] + ' !border-current' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Order ID</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Customer</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Items</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Total</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Payment</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="py-16 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin"/>
                </td></tr>
              )}
              {!loading && orders.length === 0 && (
                <tr><td colSpan={8} className="py-16 text-center text-gray-400">
                  <div className="text-3xl mb-2">📦</div>
                  No orders found
                </td></tr>
              )}
              {orders.map(o => {
                const isOpen = expanded === o.id
                const addr = typeof o.address === 'string' ? JSON.parse(o.address || '{}') : (o.address || {})
                const rejectionInfo = (() => {
                  try {
                    if (!o.notes) return null
                    const p = typeof o.notes === 'string' ? JSON.parse(o.notes) : o.notes
                    return p?.rejected_items?.length ? p : null
                  } catch { return null }
                })()
                const isPartialRejection = rejectionInfo && o.status === 'accepted'

                return (
                  <React.Fragment key={o.id}>
                    <tr
                      onClick={() => setExpanded(isOpen ? null : o.id)}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer select-none transition-colors">
                      {/* Order ID */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {isOpen ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0"/> : <ChevronDown size={14} className="text-gray-400 flex-shrink-0"/>}
                          <div>
                            <p className="font-mono text-xs font-semibold text-[#1B4332]">
                              {o.reference_id || o.id?.slice(0,8)}
                            </p>
                            {o.reference_id && <p className="text-[10px] text-gray-400 font-mono">{o.id?.slice(0,8)}</p>}
                          </div>
                        </div>
                      </td>
                      {/* Customer */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{addr.name || o.customer_name || 'Guest'}</p>
                        <p className="text-xs text-gray-400">{addr.phone || o.customer_phone}</p>
                      </td>
                      {/* Items */}
                      <td className="px-4 py-3 text-gray-600">
                        <p>{Array.isArray(o.items) ? o.items.length : 0} items</p>
                        <p className="text-xs text-gray-400 truncate max-w-32">
                          {(Array.isArray(o.items) ? o.items : []).slice(0,2).map(i => i.name).join(', ')}
                          {(Array.isArray(o.items) ? o.items.length : 0) > 2 ? '…' : ''}
                        </p>
                        {/* Show rejected items inline so admin knows at a glance */}
                        {rejectionInfo?.rejected_items?.length > 0 && (
                          <p className="text-xs text-red-500 font-semibold mt-0.5 truncate max-w-36">
                            ❌ {rejectionInfo.rejected_items.map(r => r.name).join(', ')}
                          </p>
                        )}
                      </td>
                      {/* Total */}
                      <td className="px-4 py-3 text-right">
                        {isPartialRejection && rejectionInfo.original_total > Number(o.total) && (
                          <p className="text-xs text-gray-400 line-through">₹{Number(rejectionInfo.original_total).toLocaleString()}</p>
                        )}
                        <p className="font-bold text-gray-800">₹{Number(o.total).toLocaleString()}</p>
                      </td>
                      {/* Payment */}
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${o.payment_method === 'upi' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                          {o.payment_method === 'upi' ? '📱 UPI' : '💵 COD'}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        {isPartialRejection ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                            ⚠️ Partial
                          </span>
                        ) : (
                          <StatusBadge status={o.status}/>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <select value={o.status} onChange={e => changeStatus(o.id, e.target.value)}
                            disabled={o.status === 'rejected' || o.status === 'cancelled'}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1B4332] bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                            {STATUSES.map(s =>
                              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                            )}
                          </select>
                          <button
                            onClick={() => setRejectOrder({...o, items: Array.isArray(o.items) ? o.items : []})}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                            title="Reject order (with item selection)">
                            <AlertTriangle size={14}/>
                          </button>
                        </div>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(o.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                        <br/>
                        <span>{new Date(o.created_at).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</span>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {isOpen && (
                      <tr className="bg-green-50/60 border-b border-gray-100">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {/* Items */}
                            <div className="md:col-span-2">
                              <p className="font-semibold text-gray-700 mb-2">🛒 Items Ordered</p>

                              {/* Rejection summary banner — shown when any items rejected */}
                              {rejectionInfo?.rejected_items?.length > 0 && (
                                <div className={`mb-3 p-3 rounded-xl border ${isPartialRejection ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'}`}>
                                  <p className={`text-xs font-bold mb-1 ${isPartialRejection ? 'text-orange-700' : 'text-red-700'}`}>
                                    {isPartialRejection ? '⚠️ Partially Rejected' : '❌ All Items Rejected'}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {rejectionInfo.rejected_items.map((r, i) => (
                                      <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
                                        ✕ {r.name}
                                        {r.quantity && r.price ? <span className="font-normal opacity-70">×{r.quantity} ₹{r.price * r.quantity}</span> : null}
                                      </span>
                                    ))}
                                  </div>
                                  {rejectionInfo?.remarks && (
                                    <p className="mt-2 text-xs text-red-600 italic">"{rejectionInfo.remarks}"</p>
                                  )}
                                </div>
                              )}

                              <div className="space-y-1.5">
                                {(Array.isArray(o.items) ? o.items : []).map((item, i) => {
                                  const isRejected = rejectionInfo?.rejected_items?.some(r => r.id === item.id || r.name === item.name)
                                  return (
                                    <div key={i} className={`flex justify-between items-center text-gray-600 px-3 py-1.5 rounded-lg ${isRejected ? 'bg-red-50 text-red-400' : 'bg-white'}`}>
                                      <span className={`flex items-center gap-1.5 ${isRejected ? 'line-through' : ''}`}>
                                        {item.emoji} {item.name} × {item.quantity} {item.unit}
                                        {isRejected && <span className="no-underline text-[10px] bg-red-200 text-red-700 px-1.5 py-0.5 rounded-full font-bold not-italic ml-1">Rejected</span>}
                                      </span>
                                      <span className={`font-semibold ${isRejected ? 'line-through' : ''}`}>₹{item.price * item.quantity}</span>
                                    </div>
                                  )
                                })}
                              </div>
                              <div className="mt-2 pt-2 border-t border-green-200 flex justify-between font-bold text-gray-800 px-3">
                                <span>Total</span><span>₹{Number(o.total).toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Delivery */}
                            <div>
                              <p className="font-semibold text-gray-700 mb-2">📍 Delivery Details</p>
                              <div className="space-y-1.5 text-gray-600 bg-white p-3 rounded-xl">
                                <p><span className="text-gray-400 text-xs">Name</span><br/>{addr.name || o.customer_name || '—'}</p>
                                <p><span className="text-gray-400 text-xs">Phone</span><br/>{addr.phone || o.customer_phone || '—'}</p>
                                <p><span className="text-gray-400 text-xs">Address</span><br/>{addr.address || '—'}</p>
                                {addr.slot && <p><span className="text-gray-400 text-xs">Slot</span><br/>{addr.slot}</p>}
                                <p><span className="text-gray-400 text-xs">Payment</span><br/>{o.payment_method === 'cod' ? 'Cash on Delivery' : (o.payment_method || '').toUpperCase()}</p>
                              </div>
                              {/* Call quick contact */}
                              {(addr.phone || o.customer_phone) && (
                                <a href={`tel:+91${(addr.phone || o.customer_phone).replace(/\D/g,'').slice(-10)}`}
                                  className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 bg-[#1B4332] hover:bg-[#15362a] text-white text-xs font-semibold rounded-xl transition-colors">
                                  📞 Call Customer
                                </a>
                              )}
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
          <p className="text-sm text-gray-500">
            Showing {orders.length} of {total} orders
            {(status || search || fromDate || toDate) && <span className="ml-2 text-[#1B4332] font-medium">(filtered)</span>}
          </p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">← Prev</button>
            <span className="px-3 py-1.5 text-sm font-semibold text-gray-700">Page {page}</span>
            <button disabled={orders.length < 15} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">Next →</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
