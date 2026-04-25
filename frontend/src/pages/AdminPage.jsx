import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useProducts } from '../context/ProductsContext'
import { useToast } from '../context/ToastContext'
import { useOrders } from '../context/OrdersContext'
import { CATEGORIES as FALLBACK_CATEGORIES } from '../data/products2'

// Password is stored only in env/config — never shown as a hint in UI
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'raksha@admin2024'
const BACKEND_URL    = import.meta.env.VITE_API_URL        || 'http://localhost:4000'

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('rf_admin') === 'true')
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')

  async function handleLogin(e) {
    e.preventDefault()
    if (pwInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('rf_admin', 'true')
      setAuthenticated(true)
      // Also get a backend JWT so the Orders panel can fetch from the database.
      // Try the entered password first, then the default 'password' from migration.
      for (const pwd of [pwInput, 'password']) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@rakshafarms.in', password: pwd }),
          })
          const data = await res.json()
          if (res.ok && data.token && data.user?.role === 'admin') {
            sessionStorage.setItem('rf_admin_token', data.token)
            break
          }
        } catch {}
      }
    } else {
      setPwError(true)
      setPwInput('')
      setTimeout(() => setPwError(false), 2500)
    }
  }

  if (!authenticated) {
    return (
      <div className="page-enter min-h-[70vh] flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-forest-500 flex items-center justify-center mb-4 shadow-forest">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Admin Panel</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your admin credentials to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              className={`input-field text-center tracking-widest ${pwError ? 'border-red-300 animate-bounce' : ''}`}
              placeholder="Password"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              autoFocus
              autoComplete="current-password"
            />
            {pwError && <p className="text-red-500 text-xs">Incorrect password. Please try again.</p>}
            <button type="submit" className="btn-primary w-full">Access Dashboard</button>
          </form>
        </div>
      </div>
    )
  }

  const TABS = [
    { id: 'orders',   label: 'Orders',        icon: '📦' },
    { id: 'products', label: 'Products',       icon: '🌿' },
    { id: 'daily',    label: 'Daily Update',   icon: '✏️'  },
    { id: 'analytics',label: 'Analytics',      icon: '📊' },
  ]

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem('rf_admin'); setAuthenticated(false) }}
          className="text-sm text-red-400 hover:text-red-600 font-medium border border-red-200 hover:border-red-400 px-4 py-2 rounded-xl transition-all"
        >
          Logout
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === id ? 'bg-white text-forest-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </div>

      {activeTab === 'orders'    && <OrdersPanel />}
      {activeTab === 'products'  && <ProductsPanel />}
      {activeTab === 'daily'     && <DailyUpdatePanel />}
      {activeTab === 'analytics' && <AnalyticsPanel />}
    </div>
  )
}

/* ── ORDERS PANEL ─────────────────────────────────────────────────────── */
// Normalize a backend DB row into the shape OrderCard expects
function normalizeOrder(row) {
  const addr  = row.address  || {}
  const items = Array.isArray(row.items) ? row.items : []
  // Backend uses 'placed' → show as 'pending'; 'cancelled' → show as 'rejected'
  const statusMap = { placed: 'pending', cancelled: 'rejected' }
  return {
    orderId:       `#${row.id}`,
    dbId:          row.id,
    customer: {
      name:    addr.name    || row.customer_name  || 'Guest',
      phone:   addr.phone   || row.customer_phone || '',
      address: addr.address || '',
      notes:   addr.notes   || row.notes          || '',
    },
    items,
    total:         Number(row.total)        || 0,
    subtotal:      Number(row.subtotal)     || 0,
    deliveryFee:   Number(row.delivery_fee) || 0,
    deliverySlot:  addr.slot        || '',
    paymentMethod: row.payment_method || 'cod',
    status:        statusMap[row.status] || row.status,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
  }
}

function OrdersPanel() {
  const { addToast } = useToast()
  const { orders: localOrders, updateOrderStatus: updateLocalStatus } = useOrders()
  const [backendOrders, setBackendOrders] = useState([])
  const [loading, setLoading]             = useState(true)
  const [fetchError, setFetchError]       = useState(null)
  const [filterStatus, setFilterStatus]   = useState('all')
  const [dateFilter, setDateFilter]       = useState('all')
  const [searchQuery, setSearchQuery]     = useState('')
  const [deliveryTimeInputs, setDeliveryTimeInputs] = useState({})

  // Merge backend orders + localStorage orders, deduplicating by orderId
  const orders = React.useMemo(() => {
    const map = new Map()
    // Backend orders take priority
    backendOrders.forEach(o => map.set(o.orderId, o))
    // Add localStorage orders that aren't already in backend
    localOrders.forEach(o => { if (!map.has(o.orderId)) map.set(o.orderId, o) })
    return Array.from(map.values())
  }, [backendOrders, localOrders])

  // Get admin JWT: try stored → try login → fallback
  async function getAdminToken() {
    const stored = sessionStorage.getItem('rf_admin_token')
    if (stored) return stored
    for (const pwd of [ADMIN_PASSWORD, 'password']) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@rakshafarms.in', password: pwd }),
        })
        const data = await res.json()
        if (res.ok && data.token && data.user?.role === 'admin') {
          sessionStorage.setItem('rf_admin_token', data.token)
          return data.token
        }
      } catch {}
    }
    return ADMIN_PASSWORD
  }

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const token = await getAdminToken()
      const res = await fetch(`${BACKEND_URL}/api/orders?limit=500`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)
      setBackendOrders((data.orders || []).map(normalizeOrder))
    } catch (err) {
      setFetchError(err.message)
      // Backend fetch failed — localStorage orders still shown
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const today     = new Date(); today.setHours(0, 0, 0, 0)
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - 6)

  const isToday    = (d) => { const dt = new Date(d); dt.setHours(0,0,0,0); return dt.getTime() === today.getTime() }
  const isThisWeek = (d) => new Date(d) >= weekStart

  const totalRevenue  = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0)
  const todayOrders   = orders.filter((o) => isToday(o.createdAt)).length
  const todayRevenue  = orders.filter((o) => o.status === 'delivered' && isToday(o.createdAt)).reduce((s, o) => s + o.total, 0)
  const pendingCount  = orders.filter((o) => o.status === 'pending').length

  const counts = {
    all:              orders.length,
    pending:          orders.filter((o) => o.status === 'pending').length,
    accepted:         orders.filter((o) => o.status === 'accepted').length,
    out_for_delivery: orders.filter((o) => o.status === 'out_for_delivery').length,
    delivered:        orders.filter((o) => o.status === 'delivered').length,
    rejected:         orders.filter((o) => o.status === 'rejected').length,
  }

  let filtered = [...orders]
  if (filterStatus !== 'all') filtered = filtered.filter((o) => o.status === filterStatus)
  if (dateFilter === 'today') filtered = filtered.filter((o) => isToday(o.createdAt))
  if (dateFilter === 'week')  filtered = filtered.filter((o) => isThisWeek(o.createdAt))
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter((o) =>
      o.customer.name.toLowerCase().includes(q) || o.customer.phone.includes(q) || o.orderId.toLowerCase().includes(q)
    )
  }
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  async function handleStatusUpdate(orderId, status) {
    const order = orders.find((o) => o.orderId === orderId)
    if (!order) return
    // Update localStorage order immediately (works always)
    updateLocalStatus(orderId, status)
    // Also update backend if this is a backend order (has dbId)
    if (order.dbId) {
      // 'rejected' is now a valid backend status — send it directly
      const backendStatus = status
      try {
        const token = await getAdminToken()
        const res = await fetch(`${BACKEND_URL}/api/orders/${order.dbId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: backendStatus }),
        })
        if (res.ok) {
          setBackendOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o))
        }
      } catch {}
    }
    addToast(`Order ${orderId} → ${status.replace(/_/g, ' ')}`, 'success')
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <svg className="animate-spin w-8 h-8 text-forest-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-gray-400 text-sm">Loading orders…</p>
      </div>
    )
  }

  return (
    <div className="animate-slide-up">
      {/* Error banner — shown when backend fetch fails */}
      {fetchError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <p className="font-bold mb-1">⚠ Could not load orders from server</p>
          <p className="text-xs text-red-500 mb-1">Connecting to: <code className="bg-red-100 px-1 rounded">{BACKEND_URL}</code></p>
          <p className="text-xs text-red-500">Error: {fetchError}</p>
          <button onClick={fetchOrders} className="mt-2 text-xs font-semibold underline">Try again</button>
        </div>
      )}
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon="💰" label="Total Revenue"  value={`₹${totalRevenue.toLocaleString('en-IN')}`} color="text-forest-600" highlight />
        <StatCard icon="📋" label="Total Orders"   value={counts.all}          color="text-gray-700" />
        <StatCard icon="📅" label="Today's Orders" value={todayOrders}         color="text-blue-600" sub={`₹${todayRevenue} earned`} />
        <StatCard icon="⏳" label="Needs Action"   value={pendingCount}        color="text-earth-500" sub="pending" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search by name, phone, order ID…" value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-9 py-2 text-sm" />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-shrink-0">
          {[['all','All'],['today','Today'],['week','This Week']].map(([v,l]) => (
            <button key={v} onClick={() => setDateFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${dateFilter===v?'bg-white text-forest-600 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={fetchOrders}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold bg-forest-50 text-forest-600 hover:bg-forest-100 border border-forest-200 transition-all">
          🔄 Refresh
        </button>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(counts).map(([key, count]) => (
          <button key={key} onClick={() => setFilterStatus(key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === key ? 'bg-forest-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-forest-300'
            }`}>
            {key === 'all' ? 'All' : key.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} ({count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-400 font-medium">{orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}</p>
          {orders.length > 0 && <button onClick={()=>{setFilterStatus('all');setDateFilter('all');setSearchQuery('')}} className="btn-outline mt-3 text-sm">Clear Filters</button>}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {orders.length} orders</p>
          {filtered.map((order) => (
            <OrderCard key={order.orderId} order={order}
              deliveryTimeInput={deliveryTimeInputs[order.orderId] || ''}
              onDeliveryTimeChange={(v) => setDeliveryTimeInputs((p) => ({ ...p, [order.orderId]: v }))}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, deliveryTimeInput, onDeliveryTimeChange, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const statusColors = {
    pending:          'bg-yellow-100 text-yellow-700 border-yellow-200',
    accepted:         'bg-green-100  text-green-700  border-green-200',
    out_for_delivery: 'bg-blue-100   text-blue-700   border-blue-200',
    delivered:        'bg-gray-100   text-gray-600   border-gray-200',
    rejected:         'bg-red-100    text-red-600    border-red-200',
  }
  const borderColor = {
    pending: 'border-l-yellow-400', accepted: 'border-l-green-400',
    out_for_delivery: 'border-l-blue-400', delivered: 'border-l-gray-300', rejected: 'border-l-red-300',
  }
  const isActive = !['delivered','rejected'].includes(order.status)
  const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', { day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit' })

  return (
    <div className={`card overflow-hidden border-l-4 ${borderColor[order.status] || 'border-l-gray-200'}`}>
      <div className="p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50/70 transition-colors" onClick={() => setExpanded((v)=>!v)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-mono font-bold text-sm text-gray-700">#{order.orderId.slice(-8)}</span>
            <span className={`badge border ${statusColors[order.status]||statusColors.pending}`}>
              {order.status?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
            </span>
            {order.paymentMethod === 'upi'  && <span className="badge bg-purple-50 text-purple-600 border border-purple-100">UPI</span>}
            {order.paymentMethod === 'card' && <span className="badge bg-blue-50 text-blue-600 border border-blue-100">Card</span>}
          </div>
          <p className="font-semibold text-gray-800 text-sm">{order.customer.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formattedDate} · <span className="font-semibold text-forest-600">₹{order.total}</span> · {order.items.length} item{order.items.length!==1?'s':''}
          </p>
          {order.deliverySlot && <p className="text-xs text-forest-600 mt-0.5">{order.deliverySlot}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a href={`https://wa.me/91${order.customer.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            onClick={(e)=>e.stopPropagation()}>
            WhatsApp
          </a>
          <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${expanded?'rotate-180':''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/70 p-4 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm">
            <InfoPair label="Phone"   value={`+91 ${order.customer.phone}`}/>
            <InfoPair label="Payment" value={order.paymentMethod==='cod'?'Cash on Delivery':order.paymentMethod?.toUpperCase()}/>
            <InfoPair label="Address" value={order.customer.address} span/>
            {order.customer.notes && <InfoPair label="Notes" value={order.customer.notes} span italic/>}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Items Ordered</p>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span>{item.emoji||'🌿'}</span>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-400 text-xs">×{item.quantity} {item.unit} @ ₹{item.price}</span>
                  </div>
                  <span className="font-bold text-gray-800">₹{item.price*item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex justify-between text-sm">
              <div className="text-gray-500">
                Subtotal ₹{order.subtotal}{order.deliveryFee>0&&<span> + Delivery ₹{order.deliveryFee}</span>}
              </div>
              <span className="font-bold text-forest-600 text-base">Total ₹{order.total}</span>
            </div>
          </div>

          {isActive && (
            <div className="flex flex-wrap gap-2 items-center">
              <input type="text" placeholder="Delivery time (e.g. 2–3 hrs, by 5PM)"
                value={deliveryTimeInput} onChange={(e)=>onDeliveryTimeChange(e.target.value)}
                className="input-field text-sm flex-1 min-w-48 py-2"/>
              <div className="flex gap-2 flex-wrap">
                {order.status==='pending' && <>
                  <ActionBtn color="green" onClick={()=>onStatusUpdate(order.orderId,'accepted')}>Accept</ActionBtn>
                  <ActionBtn color="red"   onClick={()=>onStatusUpdate(order.orderId,'rejected')}>Reject</ActionBtn>
                </>}
                {order.status==='accepted'         && <ActionBtn color="blue"  onClick={()=>onStatusUpdate(order.orderId,'out_for_delivery')}>Out for Delivery</ActionBtn>}
                {order.status==='out_for_delivery' && <ActionBtn color="green" onClick={()=>onStatusUpdate(order.orderId,'delivered')}>Mark Delivered</ActionBtn>}
              </div>
            </div>
          )}
          {!isActive && (
            <p className="text-sm text-gray-400 italic">
              {order.status==='delivered' ? 'Order completed successfully.' : 'Order was rejected.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ── PRODUCTS PANEL ────────────────────────────────────────────────────── */
function ProductsPanel() {
  const { products, addProduct, updateProduct, deleteProduct, resetProducts } = useProducts()
  const { addToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterCat, setFilterCat] = useState('all')
  const [form, setForm] = useState(defaultForm())
  const [errors, setErrors] = useState({})
  const [inlineEdits, setInlineEdits] = useState({})
  const [editingCell, setEditingCell] = useState(null)
  const [CATEGORIES, setCategories] = useState(FALLBACK_CATEGORIES)

  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    fetch(`${BACKEND_URL}/api/categories`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const cats = [
            { id: 'all', label: 'All Products', icon: '🛒' },
            ...data.map(c => ({ id: c.slug, label: c.name, icon: c.emoji || '🌿' }))
          ]
          setCategories(cats)
        }
      })
      .catch(() => {})
  }, [])

  function defaultForm() {
    return { name:'', category:'vegetables', price:'', unit:'kg', stock:'', description:'', featured:false }
  }

  function validate() {
    const errs = {}
    if (!form.name.trim())                                     errs.name  = 'Name required'
    if (!form.price || isNaN(form.price) || +form.price <= 0)  errs.price = 'Valid price required'
    if (form.stock==='' || isNaN(form.stock) || +form.stock<0) errs.stock = 'Valid stock required'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    const data = { ...form, price: +form.price, stock: +form.stock }
    if (editingId) { updateProduct(editingId, data); addToast(`${form.name} updated`, 'success') }
    else           { addProduct(data);               addToast(`${form.name} added`,   'success') }
    setShowForm(false)
    setForm(defaultForm())
    setEditingId(null)
  }

  function startInlineEdit(product, field) {
    setInlineEdits((p) => ({ ...p, [product.id]: { price: product.price, stock: product.stock, ...(p[product.id]||{}) } }))
    setEditingCell({ id: product.id, field })
  }
  function saveInlineEdit(product) {
    const vals  = inlineEdits[product.id] || {}
    const price = parseFloat(vals.price)
    const stock = parseInt(vals.stock)
    if (isNaN(price)||price<=0) { addToast('Invalid price','error'); return }
    if (isNaN(stock)||stock<0)  { addToast('Invalid stock','error'); return }
    updateProduct(product.id, { price, stock })
    addToast(`${product.name} updated`, 'success')
    setEditingCell(null)
  }
  function quickStock(product, delta) {
    const s = Math.max(0, product.stock + delta)
    updateProduct(product.id, { stock: s })
    addToast(`${product.name} stock → ${s}`, 'success')
  }

  const filtered   = filterCat === 'all' ? products : products.filter((p) => p.category === filterCat)
  const outOfStock = products.filter((p) => p.stock === 0).length
  const lowStock   = products.filter((p) => p.stock > 0 && p.stock <= 5).length

  return (
    <div className="animate-slide-up">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard icon="🛍️" label="Total Products" value={products.length}    color="text-gray-700"/>
        <StatCard icon="✅" label="In Stock"        value={products.filter(p=>p.stock>0).length} color="text-forest-600"/>
        <StatCard icon="❌" label="Out of Stock"    value={outOfStock}         color="text-red-500" sub="items"/>
        <StatCard icon="⚠️" label="Low Stock"       value={lowStock}           color="text-earth-500" sub="≤5 left"/>
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setFilterCat(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterCat===cat.id ? 'bg-forest-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-forest-300'
              }`}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={()=>{ if(window.confirm('Reset all products to default?')){ resetProducts(); addToast('Products reset','info') }}}
            className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors">Reset</button>
          <button onClick={() => { setForm(defaultForm()); setEditingId(null); setErrors({}); setShowForm(true) }}
            className="btn-primary text-sm px-4 py-2">+ Add Product</button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-3">Tip: Click any price or stock value to edit inline.</p>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={()=>setShowForm(false)}>
          <div className="card p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-800 mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
                <input type="text" className={`input-field ${errors.name?'border-red-300':''}`}
                  placeholder="e.g. Fresh Tomatoes" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
                {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select className="input-field" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>
                    {CATEGORIES.filter(c=>c.id!=='all').map((c)=>(<option key={c.id} value={c.id}>{c.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                  <select className="input-field" value={form.unit} onChange={(e)=>setForm({...form,unit:e.target.value})}>
                    {['kg','g','500g','250g','litre','ml','bunch','dozen','piece','pack','tray'].map((u)=>(<option key={u} value={u}>{u}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹) *</label>
                  <input type="number" min="1" className={`input-field ${errors.price?'border-red-300':''}`}
                    placeholder="e.g. 40" value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})}/>
                  {errors.price && <p className="text-red-500 text-xs mt-0.5">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Stock *</label>
                  <input type="number" min="0" className={`input-field ${errors.stock?'border-red-300':''}`}
                    placeholder="e.g. 50" value={form.stock} onChange={(e)=>setForm({...form,stock:e.target.value})}/>
                  {errors.stock && <p className="text-red-500 text-xs mt-0.5">{errors.stock}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea rows={2} className="input-field resize-none" placeholder="Short product description..."
                  value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={!!form.featured} onChange={(e)=>setForm({...form,featured:e.target.checked})} className="w-4 h-4 accent-forest-600"/>
                Mark as Featured
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editingId ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((product) => {
                const isEPrice = editingCell?.id === product.id && editingCell?.field === 'price'
                const isEStock = editingCell?.id === product.id && editingCell?.field === 'stock'
                const ev = inlineEdits[product.id] || { price: product.price, stock: product.stock }
                return (
                  <tr key={product.id} className="hover:bg-sage-50/30 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {product.image
                          ? <img src={product.image} alt={product.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0"/>
                          : <span className="text-xl">{product.emoji||'🌿'}</span>}
                        <div>
                          <p className="font-medium text-gray-800 text-sm leading-tight">{product.name}</p>
                          {product.featured && <span className="text-[10px] text-earth-500 font-semibold">Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="badge bg-forest-50 text-forest-700 capitalize">{product.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      {isEPrice ? (
                        <InlineCellEditor value={ev.price} prefix="₹" suffix={`/${product.unit}`}
                          onChange={(v)=>setInlineEdits((p)=>({...p,[product.id]:{...ev,price:v}}))}
                          onSave={()=>saveInlineEdit(product)} onCancel={()=>setEditingCell(null)}/>
                      ) : (
                        <button onClick={()=>startInlineEdit(product,'price')}
                          className="flex items-center gap-1 font-semibold text-forest-600 hover:bg-forest-50 px-2 py-1 rounded-lg transition-all text-sm">
                          ₹{product.price}/{product.unit}
                          <span className="opacity-0 group-hover:opacity-100 text-gray-400 text-xs transition-opacity">✏️</span>
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEStock ? (
                        <InlineCellEditor value={ev.stock} suffix=" units"
                          onChange={(v)=>setInlineEdits((p)=>({...p,[product.id]:{...ev,stock:v}}))}
                          onSave={()=>saveInlineEdit(product)} onCancel={()=>setEditingCell(null)}/>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button onClick={()=>startInlineEdit(product,'stock')}
                            className={`flex items-center gap-1 font-semibold hover:bg-gray-100 px-2 py-1 rounded-lg transition-all text-sm ${
                              product.stock===0?'text-red-500':product.stock<=5?'text-earth-500':'text-gray-700'}`}>
                            {product.stock===0?'Out':product.stock}
                            <span className="opacity-0 group-hover:opacity-100 text-gray-400 text-xs transition-opacity">✏️</span>
                          </button>
                          <div className="hidden group-hover:flex gap-1">
                            <button onClick={()=>quickStock(product,10)} className="text-[10px] bg-forest-100 hover:bg-forest-200 text-forest-700 px-1.5 py-0.5 rounded font-semibold">+10</button>
                            <button onClick={()=>quickStock(product,50)} className="text-[10px] bg-forest-100 hover:bg-forest-200 text-forest-700 px-1.5 py-0.5 rounded font-semibold">+50</button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={()=>{ setForm({...product,price:String(product.price),stock:String(product.stock)}); setEditingId(product.id); setErrors({}); setShowForm(true) }}
                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-medium transition-colors">Edit</button>
                        <button onClick={()=>{ if(window.confirm(`Delete "${product.name}"?`)){ deleteProduct(product.id); addToast(`${product.name} deleted`,'info') }}}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-2 py-1.5 rounded-lg font-medium transition-colors">Del</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length===0&&<div className="text-center py-12 text-gray-400"><p className="text-3xl mb-2">🌿</p><p>No products in this category</p></div>}
        </div>
      </div>
    </div>
  )
}

/* ── DAILY UPDATE PANEL ─────────────────────────────────────────────────── */
function DailyUpdatePanel() {
  const { products, updateProduct } = useProducts()
  const { addToast } = useToast()
  const [filterCat, setFilterCat] = useState('all')
  const [drafts, setDrafts] = useState(() => Object.fromEntries(products.map((p) => [p.id, { price: p.price, stock: p.stock }])))
  const [saved, setSaved]   = useState({})
  const [CATEGORIES, setCategories] = useState(FALLBACK_CATEGORIES)

  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    fetch(`${BACKEND_URL}/api/categories`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories([
            { id: 'all', label: 'All Products', icon: '🛒' },
            ...data.map(c => ({ id: c.slug, label: c.name, icon: c.emoji || '🌿' }))
          ])
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev }
      products.forEach((p) => { if (!next[p.id]) next[p.id] = { price: p.price, stock: p.stock } })
      return next
    })
  }, [products])

  function handleChange(id, field, value) {
    setDrafts((p) => ({ ...p, [id]: { ...p[id], [field]: value } }))
    setSaved((p) => ({ ...p, [id]: false }))
  }

  function saveRow(product) {
    const d = drafts[product.id]
    const price = parseFloat(d?.price); const stock = parseInt(d?.stock)
    if (isNaN(price)||price<=0) { addToast('Invalid price for '+product.name,'error'); return }
    if (isNaN(stock)||stock<0)  { addToast('Invalid stock for '+product.name,'error'); return }
    updateProduct(product.id, { price, stock })
    setSaved((p) => ({ ...p, [product.id]: true }))
    setTimeout(() => setSaved((p) => ({ ...p, [product.id]: false })), 2000)
  }

  function saveAll() {
    let count = 0
    products.forEach((p) => {
      const d = drafts[p.id]; if (!d) return
      const price = parseFloat(d.price); const stock = parseInt(d.stock)
      if (!isNaN(price)&&price>0&&!isNaN(stock)&&stock>=0) { updateProduct(p.id,{price,stock}); count++ }
    })
    addToast(`${count} products updated!`, 'success')
    setSaved(Object.fromEntries(products.map((p)=>[p.id,true])))
    setTimeout(() => setSaved({}), 2500)
  }

  const filtered     = filterCat === 'all' ? products : products.filter((p) => p.category === filterCat)
  const changedCount = products.filter((p) => { const d=drafts[p.id]; return d&&(parseFloat(d.price)!==p.price||parseInt(d.stock)!==p.stock) }).length

  return (
    <div className="animate-slide-up">
      <div className="card p-5 mb-5 bg-gradient-to-r from-forest-50 to-sage-50 border border-forest-100">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-bold text-forest-700 text-lg">Daily Price & Stock Update</h2>
            <p className="text-forest-600 text-sm mt-0.5">Update prices and restock quantities, then click <strong>Save All</strong>.</p>
          </div>
          <button onClick={saveAll} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            {changedCount > 0 ? `Save All (${changedCount} changed)` : 'Save All'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setFilterCat(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterCat===cat.id?'bg-forest-600 text-white':'bg-white text-gray-600 border border-gray-200 hover:border-forest-300'}`}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((product) => {
          const d       = drafts[product.id] || { price: product.price, stock: product.stock }
          const changed = parseFloat(d.price)!==product.price || parseInt(d.stock)!==product.stock
          const isSaved = saved[product.id]
          return (
            <div key={product.id} className={`card p-3 flex items-center gap-3 flex-wrap transition-all duration-200 ${isSaved?'bg-forest-50 border border-forest-200':changed?'bg-yellow-50 border border-yellow-200':''}`}>
              <div className="flex items-center gap-2 flex-1 min-w-36">
                {product.image
                  ? <img src={product.image} alt={product.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0"/>
                  : <span className="text-xl">{product.emoji||'🌿'}</span>}
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
                  <span className="text-xs text-gray-400 capitalize">{product.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Price (₹/{product.unit})</label>
                  <div className="flex items-center gap-1">
                    {parseFloat(d.price)!==product.price&&<span className="text-xs text-gray-400 line-through">₹{product.price}</span>}
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                      <input type="number" min="1" value={d.price} onChange={(e)=>handleChange(product.id,'price',e.target.value)}
                        className="input-field py-1.5 pl-5 pr-2 w-20 text-sm font-semibold text-center"/>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Stock</label>
                  <div className="flex items-center gap-1">
                    {parseInt(d.stock)!==product.stock&&<span className="text-xs text-gray-400 line-through">{product.stock}</span>}
                    <input type="number" min="0" value={d.stock} onChange={(e)=>handleChange(product.id,'stock',e.target.value)}
                      className={`input-field py-1.5 px-2 w-20 text-sm font-semibold text-center ${parseInt(d.stock)===0?'text-red-500 border-red-200':''}`}/>
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-4">
                  {[10,25,50].map((n)=>(
                    <button key={n} onClick={()=>handleChange(product.id,'stock',String(n))}
                      className="text-xs bg-gray-100 hover:bg-forest-100 hover:text-forest-700 text-gray-500 px-1.5 rounded font-semibold transition-colors leading-5">{n}</button>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0">
                {isSaved?<span className="text-forest-600 font-semibold text-sm">✅ Saved!</span>
                  :changed?<button onClick={()=>saveRow(product)} className="bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">Save</button>
                  :<span className="text-gray-300 text-xs font-medium">No changes</span>}
              </div>
            </div>
          )
        })}
      </div>
      {filtered.length>3&&(
        <div className="mt-5 flex justify-end">
          <button onClick={saveAll} className="btn-primary">{changedCount>0?`Save All (${changedCount} changed)`:'Save All'}</button>
        </div>
      )}
    </div>
  )
}

/* ── ANALYTICS PANEL ────────────────────────────────────────────────────── */
function AnalyticsPanel() {
  const { orders }   = useOrders()
  const { products } = useProducts()

  const delivered = orders.filter((o) => o.status === 'delivered')
  const revenue   = delivered.reduce((s, o) => s + o.total, 0)

  // Top selling products
  const salesMap = {}
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!salesMap[item.id]) salesMap[item.id] = { name: item.name, qty: 0, revenue: 0, emoji: item.emoji }
      salesMap[item.id].qty     += item.quantity
      salesMap[item.id].revenue += item.price * item.quantity
    })
  })
  const topProducts = Object.entries(salesMap)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Category breakdown
  const catRevenue = {}
  orders.forEach((o) => o.items.forEach((item) => {
    const product = products.find((p) => p.id === item.id)
    const cat = product?.category || 'other'
    catRevenue[cat] = (catRevenue[cat] || 0) + item.price * item.quantity
  }))
  const maxCatRevenue = Math.max(...Object.values(catRevenue), 1)

  const today     = new Date(); today.setHours(0,0,0,0)
  const todayRev  = delivered.filter((o)=>{ const d=new Date(o.createdAt); d.setHours(0,0,0,0); return d.getTime()===today.getTime() }).reduce((s,o)=>s+o.total,0)
  const avgOrder  = delivered.length ? Math.round(revenue / delivered.length) : 0

  return (
    <div className="animate-slide-up space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="💰" label="Total Revenue"  value={`₹${revenue.toLocaleString('en-IN')}`} color="text-forest-600" highlight/>
        <StatCard icon="📅" label="Today Revenue"  value={`₹${todayRev}`}    color="text-blue-600"/>
        <StatCard icon="📊" label="Avg Order Value" value={`₹${avgOrder}`}   color="text-earth-500"/>
        <StatCard icon="✅" label="Completed"       value={delivered.length}  color="text-green-600"/>
      </div>

      {/* Top products */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-800 mb-4">Top Selling Products</h3>
        {topProducts.length === 0
          ? <p className="text-gray-400 text-sm text-center py-8">No sales data yet</p>
          : <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-gray-400 font-bold w-5 text-sm">#{i+1}</span>
                  <span className="text-lg">{p.emoji||'🌿'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.qty} units sold</p>
                  </div>
                  <span className="font-bold text-forest-600 text-sm">₹{p.revenue.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
        }
      </div>

      {/* Category revenue */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-800 mb-4">Revenue by Category</h3>
        {Object.keys(catRevenue).length === 0
          ? <p className="text-gray-400 text-sm text-center py-8">No sales data yet</p>
          : <div className="space-y-3">
              {Object.entries(catRevenue).sort(([,a],[,b])=>b-a).map(([cat,rev]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 capitalize">{cat}</span>
                    <span className="font-bold text-forest-600">₹{rev.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-forest-500 rounded-full transition-all duration-700" style={{ width:`${(rev/maxCatRevenue)*100}%` }}/>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}

/* ── SHARED ──────────────────────────────────────────────────────────────── */
function InlineCellEditor({ value, prefix='', suffix='', onChange, onSave, onCancel }) {
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select() }, [])
  const handleKey = (e) => { if(e.key==='Enter') onSave(); if(e.key==='Escape') onCancel() }
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center bg-white border-2 border-forest-400 rounded-lg px-2 shadow-sm">
        {prefix&&<span className="text-gray-400 text-xs">{prefix}</span>}
        <input ref={inputRef} type="number" min="0" value={value} onChange={(e)=>onChange(e.target.value)} onKeyDown={handleKey}
          className="w-16 text-sm font-semibold outline-none py-1 text-center bg-transparent"/>
        {suffix&&<span className="text-gray-400 text-xs whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, sub, highlight }) {
  return (
    <div className={`card p-4 text-center ${highlight?'bg-gradient-to-br from-forest-50 to-sage-50 border border-forest-100':''}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5 font-medium">{label}</div>
      {sub&&<div className="text-xs text-gray-400">{sub}</div>}
    </div>
  )
}

function InfoPair({ label, value, span, italic }) {
  return (
    <div className={span?'sm:col-span-2':''}>
      <span className="text-gray-400 text-xs">{label}: </span>
      <span className={`text-gray-700 text-sm font-medium ${italic?'italic':''}`}>{value}</span>
    </div>
  )
}

function ActionBtn({ color, onClick, children }) {
  const s = { green:'bg-forest-600 hover:bg-forest-700 text-white', red:'bg-red-100 hover:bg-red-200 text-red-600', blue:'bg-blue-600 hover:bg-blue-700 text-white' }
  return (
    <button onClick={onClick} className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${s[color]}`}>
      {children}
    </button>
  )
}
