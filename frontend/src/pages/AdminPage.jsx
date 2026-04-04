import React, { useState, useRef, useEffect } from 'react'
import { useOrders } from '../context/OrdersContext'
import { useProducts } from '../context/ProductsContext'
import { useToast } from '../context/ToastContext'
import { CATEGORIES } from '../data/products'

const ADMIN_PASSWORD = 'raksha123'

/* ─────────────────────────────────────────────────────────────────
   LOGIN GATE
───────────────────────────────────────────────────────────────── */
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() =>
    sessionStorage.getItem('rf_admin') === 'true'
  )
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')

  function handleLogin(e) {
    e.preventDefault()
    if (pwInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('rf_admin', 'true')
      setAuthenticated(true)
    } else {
      setPwError(true)
      setPwInput('')
      setTimeout(() => setPwError(false), 2000)
    }
  }

  if (!authenticated) {
    return (
      <div className="page-enter min-h-[70vh] flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-sm text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Admin Panel</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your admin password to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              className={`input-field text-center tracking-widest ${pwError ? 'border-red-300 animate-bounce' : ''}`}
              placeholder="••••••••"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              autoFocus
            />
            {pwError && <p className="text-red-500 text-xs">Incorrect password. Try again.</p>}
            <button type="submit" className="btn-primary w-full">🌿 Login to Admin</button>
          </form>
        </div>
      </div>
    )
  }

  const TABS = [
    { id: 'orders',   label: '📦 Orders'   },
    { id: 'products', label: '🌿 Products'  },
    { id: 'daily',    label: '✏️ Daily Update' },
  ]

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Panel ⚙️</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem('rf_admin'); setAuthenticated(false) }}
          className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors flex items-center gap-1"
        >
          🚪 Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit flex-wrap">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === id
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'orders'   && <OrdersPanel />}
      {activeTab === 'products' && <ProductsPanel />}
      {activeTab === 'daily'    && <DailyUpdatePanel />}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   ORDERS PANEL  — full history + search + date filter + revenue
───────────────────────────────────────────────────────────────── */
function OrdersPanel() {
  const { orders, updateOrderStatus } = useOrders()
  const { addToast } = useToast()
  const [filterStatus, setFilterStatus]     = useState('all')
  const [dateFilter, setDateFilter]         = useState('all')   // today | week | all
  const [searchQuery, setSearchQuery]       = useState('')
  const [deliveryTimeInputs, setDeliveryTimeInputs] = useState({})

  /* ---- derived stats ---- */
  const today     = new Date(); today.setHours(0,0,0,0)
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - 6)

  function isToday(dateStr)   { const d = new Date(dateStr); d.setHours(0,0,0,0); return d.getTime() === today.getTime() }
  function isThisWeek(dateStr){ const d = new Date(dateStr); return d >= weekStart }

  const totalRevenue      = orders.filter(o => o.status === 'delivered').reduce((s,o) => s + o.total, 0)
  const todayOrders       = orders.filter(o => isToday(o.createdAt)).length
  const todayRevenue      = orders.filter(o => o.status === 'delivered' && isToday(o.createdAt)).reduce((s,o) => s + o.total, 0)
  const pendingUrgent     = orders.filter(o => o.status === 'pending').length

  const counts = {
    all:              orders.length,
    pending:          orders.filter(o => o.status === 'pending').length,
    accepted:         orders.filter(o => o.status === 'accepted').length,
    out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
    delivered:        orders.filter(o => o.status === 'delivered').length,
    rejected:         orders.filter(o => o.status === 'rejected').length,
  }

  /* ---- apply filters ---- */
  let filtered = [...orders]
  if (filterStatus !== 'all') filtered = filtered.filter(o => o.status === filterStatus)
  if (dateFilter === 'today') filtered = filtered.filter(o => isToday(o.createdAt))
  if (dateFilter === 'week')  filtered = filtered.filter(o => isThisWeek(o.createdAt))
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(o =>
      o.customer.name.toLowerCase().includes(q)  ||
      o.customer.phone.includes(q)               ||
      o.orderId.toLowerCase().includes(q)
    )
  }

  function handleStatusUpdate(orderId, status) {
    const deliveryTime = deliveryTimeInputs[orderId] || null
    updateOrderStatus(orderId, status, deliveryTime)
    addToast(`Order #${orderId.slice(-6)} → ${status.replace(/_/g,' ')}`, 'success')
  }

  return (
    <div className="animate-slide-up">

      {/* ── Revenue / stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon="💰" label="Total Revenue"  value={`₹${totalRevenue}`}  color="text-green-700" highlight />
        <StatCard icon="📋" label="Total Orders"   value={counts.all}           color="text-gray-700"  />
        <StatCard icon="📅" label="Today's Orders" value={todayOrders}          color="text-blue-600"  sub={`₹${todayRevenue} earned`} />
        <StatCard icon="⏳" label="Needs Action"   value={pendingUrgent}        color="text-orange-500" sub="pending" />
      </div>

      {/* ── Filters row ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by name, phone, order ID…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field pl-8 py-2 text-sm"
          />
        </div>
        {/* Date filter */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {[['all','All Time'],['today','Today'],['week','This Week']].map(([val,label]) => (
            <button key={val} onClick={() => setDateFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${dateFilter===val?'bg-white text-green-700 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Status pills ── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(counts).map(([key, count]) => (
          <button key={key} onClick={() => setFilterStatus(key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === key ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
            }`}>
            {key === 'all' ? 'All' : key.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} ({count})
          </button>
        ))}
      </div>

      {/* ── Order list ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 card">
          <span className="text-5xl">📭</span>
          <p className="text-gray-400 mt-4 font-medium">No orders match your filters</p>
          <button onClick={()=>{setFilterStatus('all');setDateFilter('all');setSearchQuery('')}}
            className="btn-outline mt-3 text-sm">Clear Filters</button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {orders.length} orders</p>
          {filtered.map(order => (
            <OrderCard key={order.orderId} order={order}
              deliveryTimeInput={deliveryTimeInputs[order.orderId] || ''}
              onDeliveryTimeChange={val => setDeliveryTimeInputs(prev => ({ ...prev, [order.orderId]: val }))}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Individual Order Card ── */
function OrderCard({ order, deliveryTimeInput, onDeliveryTimeChange, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(false)

  const statusColors = {
    pending:          'bg-yellow-100 text-yellow-700 border-yellow-200',
    accepted:         'bg-green-100  text-green-700  border-green-200',
    out_for_delivery: 'bg-blue-100   text-blue-700   border-blue-200',
    delivered:        'bg-gray-100   text-gray-600   border-gray-200',
    rejected:         'bg-red-100    text-red-600    border-red-200',
  }

  const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const isActive = !['delivered','rejected'].includes(order.status)

  return (
    <div className={`card overflow-hidden border-l-4 ${
      order.status === 'pending'          ? 'border-l-yellow-400' :
      order.status === 'accepted'         ? 'border-l-green-400'  :
      order.status === 'out_for_delivery' ? 'border-l-blue-400'   :
      order.status === 'delivered'        ? 'border-l-gray-300'   : 'border-l-red-300'
    }`}>
      {/* Header */}
      <div className="p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50/70 transition-colors"
        onClick={() => setExpanded(v => !v)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono font-bold text-sm text-gray-700">#{order.orderId.slice(-8)}</span>
            <span className={`badge border ${statusColors[order.status] || statusColors.pending}`}>
              {order.status.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
            </span>
            {order.paymentMethod === 'upi' && (
              <span className="badge bg-purple-50 text-purple-600 border border-purple-100">📱 UPI</span>
            )}
          </div>
          <p className="font-semibold text-gray-800 text-sm">{order.customer.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formattedDate} &nbsp;·&nbsp;
            <span className="font-semibold text-green-700">₹{order.total}</span>
            &nbsp;·&nbsp; {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </p>
          {order.deliveryTime && (
            <p className="text-xs text-blue-600 mt-0.5">🕐 {order.deliveryTime}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a href={`https://wa.me/91${order.customer.phone.replace(/\D/g,'')}`}
            target="_blank" rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            onClick={e => e.stopPropagation()}>
            💬 WhatsApp
          </a>
          <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${expanded?'rotate-180':''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/70 p-4 animate-slide-up">
          {/* Customer info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm">
            <InfoPair icon="👤" label="Name"    value={order.customer.name}/>
            <InfoPair icon="📞" label="Phone"   value={`+91 ${order.customer.phone}`}/>
            <InfoPair icon="💳" label="Payment" value={order.paymentMethod==='upi'?'📱 UPI':'💵 Cash on Delivery'}/>
            <InfoPair icon="📍" label="Address" value={order.customer.address} span/>
            {order.customer.notes && <InfoPair icon="📝" label="Notes" value={order.customer.notes} span italic/>}
          </div>

          {/* Items table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">🛒 Items Ordered</p>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span>{item.emoji}</span>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-400 text-xs">× {item.quantity} {item.unit}</span>
                    <span className="text-gray-400 text-xs">@ ₹{item.price}</span>
                  </div>
                  <span className="font-bold text-gray-800">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex justify-between text-sm">
              <div className="text-gray-500">
                Subtotal ₹{order.subtotal}
                {order.deliveryFee > 0 && <span> + Delivery ₹{order.deliveryFee}</span>}
              </div>
              <span className="font-bold text-green-700 text-base">Total ₹{order.total}</span>
            </div>
          </div>

          {/* Action buttons */}
          {isActive && (
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="text"
                placeholder="Delivery time (e.g. 2–3 hours, by 5pm)"
                value={deliveryTimeInput}
                onChange={e => onDeliveryTimeChange(e.target.value)}
                className="input-field text-sm flex-1 min-w-48 py-2"
              />
              <div className="flex gap-2 flex-wrap">
                {order.status === 'pending' && <>
                  <ActionBtn color="green" onClick={() => onStatusUpdate(order.orderId,'accepted')}>✅ Accept</ActionBtn>
                  <ActionBtn color="red"   onClick={() => onStatusUpdate(order.orderId,'rejected')}>✗ Reject</ActionBtn>
                </>}
                {order.status === 'accepted' && (
                  <ActionBtn color="blue" onClick={() => onStatusUpdate(order.orderId,'out_for_delivery')}>🚚 Out for Delivery</ActionBtn>
                )}
                {order.status === 'out_for_delivery' && (
                  <ActionBtn color="green" onClick={() => onStatusUpdate(order.orderId,'delivered')}>🎉 Mark Delivered</ActionBtn>
                )}
              </div>
            </div>
          )}
          {!isActive && (
            <p className="text-sm text-gray-400 italic">
              {order.status === 'delivered' ? '🎉 Order completed successfully.' : '❌ Order was rejected.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   PRODUCTS PANEL  — inline editing + quick actions
───────────────────────────────────────────────────────────────── */
function ProductsPanel() {
  const { products, addProduct, updateProduct, deleteProduct, resetProducts } = useProducts()
  const { addToast } = useToast()
  const [showForm, setShowForm]   = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterCat, setFilterCat] = useState('all')
  const [form, setForm]           = useState(defaultForm())
  const [errors, setErrors]       = useState({})

  // inline edit state: { [productId]: { price, stock } }
  const [inlineEdits, setInlineEdits] = useState({})
  const [editingCell, setEditingCell] = useState(null) // { id, field }

  function defaultForm() {
    return { name: '', category: 'vegetables', price: '', unit: 'kg', stock: '', emoji: '🥬', description: '', featured: false }
  }

  function openAdd() {
    setForm(defaultForm()); setEditingId(null); setErrors({}); setShowForm(true)
  }
  function openEdit(product) {
    setForm({ ...product }); setEditingId(product.id); setErrors({}); setShowForm(true)
  }
  function validate() {
    const errs = {}
    if (!form.name.trim())                                    errs.name  = 'Name required'
    if (!form.price || isNaN(form.price) || +form.price <= 0) errs.price = 'Valid price required'
    if (form.stock === '' || isNaN(form.stock) || +form.stock < 0) errs.stock = 'Valid stock required'
    return errs
  }
  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    const data = { ...form, price: +form.price, stock: +form.stock }
    if (editingId) { updateProduct(editingId, data); addToast(`${form.emoji} ${form.name} updated`, 'success') }
    else           { addProduct(data);               addToast(`${form.emoji} ${form.name} added`,   'success') }
    setShowForm(false)
  }
  function handleDelete(product) {
    if (window.confirm(`Delete "${product.name}"?`)) {
      deleteProduct(product.id)
      addToast(`${product.name} deleted`, 'info')
    }
  }

  // Inline editing helpers
  function startInlineEdit(product, field) {
    setInlineEdits(prev => ({ ...prev, [product.id]: { price: product.price, stock: product.stock, ...(prev[product.id]||{}) } }))
    setEditingCell({ id: product.id, field })
  }
  function saveInlineEdit(product) {
    const vals = inlineEdits[product.id] || {}
    const price = parseFloat(vals.price)
    const stock = parseInt(vals.stock)
    if (isNaN(price) || price <= 0) { addToast('Invalid price', 'error'); return }
    if (isNaN(stock) || stock < 0)  { addToast('Invalid stock', 'error'); return }
    updateProduct(product.id, { price, stock })
    addToast(`${product.emoji} ${product.name} updated`, 'success')
    setEditingCell(null)
  }
  function cancelInlineEdit() { setEditingCell(null) }
  function quickAdjustStock(product, delta) {
    const newStock = Math.max(0, product.stock + delta)
    updateProduct(product.id, { stock: newStock })
    addToast(`${product.emoji} Stock → ${newStock}`, 'success')
  }

  const filtered = filterCat === 'all' ? products : products.filter(p => p.category === filterCat)
  const outOfStock  = products.filter(p => p.stock === 0).length
  const lowStock    = products.filter(p => p.stock > 0 && p.stock <= 5).length

  return (
    <div className="animate-slide-up">
      {/* Product stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard icon="🛍️" label="Total Products" value={products.length} color="text-gray-700"/>
        <StatCard icon="🥦" label="Vegetables"      value={products.filter(p=>p.category==='vegetables').length} color="text-green-600"/>
        <StatCard icon="❌" label="Out of Stock"    value={outOfStock}  color="text-red-500"    sub="items"/>
        <StatCard icon="⚠️" label="Low Stock"       value={lowStock}    color="text-orange-500" sub="≤5 left"/>
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setFilterCat(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterCat===cat.id ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
              }`}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => { if (window.confirm('Reset all products to default?')) { resetProducts(); addToast('Products reset', 'info') } }}
            className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors">
            Reset Defaults
          </button>
          <button onClick={openAdd} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
            + Add Product
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-3">
        💡 <strong>Tip:</strong> Click any price or stock value to edit it directly in the table.
      </p>

      {/* ── Add / Edit modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}>
          <div className="card p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-800 mb-4">
              {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Emoji</label>
                  <input type="text" className="input-field text-center text-2xl py-2"
                    value={form.emoji} onChange={e => setForm({...form,emoji:e.target.value})} maxLength={2}/>
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
                  <input type="text" className={`input-field ${errors.name?'border-red-300':''}`}
                    placeholder="e.g. Fresh Tomatoes" value={form.name}
                    onChange={e => setForm({...form,name:e.target.value})}/>
                  {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm({...form,category:e.target.value})}>
                    <option value="vegetables">🥦 Vegetables</option>
                    <option value="fruits">🍎 Fruits</option>
                    <option value="groceries">🌾 Groceries</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                  <select className="input-field" value={form.unit} onChange={e => setForm({...form,unit:e.target.value})}>
                    {['kg','g','litre','bunch','dozen','piece','pack'].map(u=>(
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹) *</label>
                  <input type="number" min="1" className={`input-field ${errors.price?'border-red-300':''}`}
                    placeholder="e.g. 40" value={form.price} onChange={e => setForm({...form,price:e.target.value})}/>
                  {errors.price && <p className="text-red-500 text-xs mt-0.5">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Stock *</label>
                  <input type="number" min="0" className={`input-field ${errors.stock?'border-red-300':''}`}
                    placeholder="e.g. 50" value={form.stock} onChange={e => setForm({...form,stock:e.target.value})}/>
                  {errors.stock && <p className="text-red-500 text-xs mt-0.5">{errors.stock}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea rows={2} className="input-field resize-none"
                  placeholder="Short product description..."
                  value={form.description} onChange={e => setForm({...form,description:e.target.value})}/>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" checked={!!form.featured}
                  onChange={e => setForm({...form,featured:e.target.checked})} className="w-4 h-4 accent-green-600"/>
                <label htmlFor="featured" className="text-sm text-gray-600">Mark as Featured ⭐</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? '✓ Save Changes' : '+ Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Products table with inline editing ── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price / Unit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(product => {
                const isEditingPrice = editingCell?.id === product.id && editingCell?.field === 'price'
                const isEditingStock = editingCell?.id === product.id && editingCell?.field === 'stock'
                const editVals = inlineEdits[product.id] || { price: product.price, stock: product.stock }

                return (
                  <tr key={product.id} className="hover:bg-green-50/30 transition-colors group">
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{product.emoji}</span>
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          {product.featured && <span className="text-xs text-yellow-600">⭐ Featured</span>}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="badge bg-green-50 text-green-700 capitalize">{product.category}</span>
                    </td>

                    {/* Price — inline editable */}
                    <td className="px-4 py-3">
                      {isEditingPrice ? (
                        <InlineCellEditor
                          value={editVals.price}
                          prefix="₹"
                          suffix={`/${product.unit}`}
                          onChange={val => setInlineEdits(p=>({...p,[product.id]:{...editVals,price:val}}))}
                          onSave={()=>saveInlineEdit(product)}
                          onCancel={cancelInlineEdit}
                        />
                      ) : (
                        <button
                          onClick={() => startInlineEdit(product,'price')}
                          className="group/cell flex items-center gap-1 font-semibold text-green-700 hover:text-green-800 hover:bg-green-100 px-2 py-1 rounded-lg transition-all"
                          title="Click to edit price"
                        >
                          ₹{product.price}/{product.unit}
                          <span className="opacity-0 group-hover/cell:opacity-100 text-gray-400 text-xs transition-opacity">✏️</span>
                        </button>
                      )}
                    </td>

                    {/* Stock — inline editable + quick buttons */}
                    <td className="px-4 py-3">
                      {isEditingStock ? (
                        <InlineCellEditor
                          value={editVals.stock}
                          suffix=" units"
                          onChange={val => setInlineEdits(p=>({...p,[product.id]:{...editVals,stock:val}}))}
                          onSave={()=>saveInlineEdit(product)}
                          onCancel={cancelInlineEdit}
                        />
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => startInlineEdit(product,'stock')}
                            className={`group/cell flex items-center gap-1 font-semibold hover:bg-gray-100 px-2 py-1 rounded-lg transition-all ${
                              product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-orange-500' : 'text-gray-700'
                            }`}
                            title="Click to edit stock"
                          >
                            {product.stock === 0 ? '❌ Out' : product.stock}
                            <span className="opacity-0 group-hover/cell:opacity-100 text-gray-400 text-xs transition-opacity">✏️</span>
                          </button>
                          {/* Quick +10 / +50 */}
                          <div className="hidden group-hover:flex gap-1">
                            <button onClick={()=>quickAdjustStock(product,10)}
                              className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-1.5 py-0.5 rounded font-semibold transition-colors">+10</button>
                            <button onClick={()=>quickAdjustStock(product,50)}
                              className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-1.5 py-0.5 rounded font-semibold transition-colors">+50</button>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {(isEditingPrice || isEditingStock) ? (
                          <>
                            <button onClick={()=>saveInlineEdit(product)}
                              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                              ✓ Save
                            </button>
                            <button onClick={cancelInlineEdit}
                              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-medium transition-colors">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={()=>openEdit(product)}
                              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-medium transition-colors">
                              ✏️ Edit
                            </button>
                            <button onClick={()=>handleDelete(product)}
                              className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg font-medium transition-colors">
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl">🌿</span>
              <p className="mt-2">No products in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   DAILY UPDATE PANEL  — quick price + stock board for every morning
───────────────────────────────────────────────────────────────── */
function DailyUpdatePanel() {
  const { products, updateProduct } = useProducts()
  const { addToast } = useToast()
  const [filterCat, setFilterCat] = useState('all')
  const [drafts, setDrafts]       = useState(() =>
    Object.fromEntries(products.map(p => [p.id, { price: p.price, stock: p.stock }]))
  )
  const [saved, setSaved] = useState({})

  // Keep drafts in sync with any externally-added products
  useEffect(() => {
    setDrafts(prev => {
      const next = { ...prev }
      products.forEach(p => {
        if (!next[p.id]) next[p.id] = { price: p.price, stock: p.stock }
      })
      return next
    })
  }, [products])

  function handleChange(id, field, value) {
    setDrafts(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
    setSaved(prev => ({ ...prev, [id]: false }))
  }

  function saveRow(product) {
    const d = drafts[product.id]
    const price = parseFloat(d.price)
    const stock = parseInt(d.stock)
    if (isNaN(price) || price <= 0) { addToast('Invalid price for ' + product.name, 'error'); return }
    if (isNaN(stock) || stock < 0)  { addToast('Invalid stock for ' + product.name, 'error'); return }
    updateProduct(product.id, { price, stock })
    setSaved(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => setSaved(prev => ({ ...prev, [product.id]: false })), 2000)
  }

  function saveAll() {
    let count = 0
    products.forEach(product => {
      const d = drafts[product.id]
      if (!d) return
      const price = parseFloat(d.price)
      const stock = parseInt(d.stock)
      if (!isNaN(price) && price > 0 && !isNaN(stock) && stock >= 0) {
        updateProduct(product.id, { price, stock })
        count++
      }
    })
    addToast(`✅ ${count} products updated successfully!`, 'success')
    setSaved(Object.fromEntries(products.map(p=>[p.id,true])))
    setTimeout(() => setSaved({}), 2500)
  }

  const filtered = filterCat === 'all' ? products : products.filter(p => p.category === filterCat)
  const changedCount = products.filter(p => {
    const d = drafts[p.id]
    return d && (parseFloat(d.price) !== p.price || parseInt(d.stock) !== p.stock)
  }).length

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="card p-5 mb-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-bold text-green-800 text-lg flex items-center gap-2">
              ✏️ Daily Price & Stock Update
            </h2>
            <p className="text-green-600 text-sm mt-0.5">
              Update today's prices and restock quantities. Click <strong>Save All</strong> when done.
            </p>
          </div>
          <button
            onClick={saveAll}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            {changedCount > 0 ? `💾 Save All (${changedCount} changed)` : '💾 Save All'}
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setFilterCat(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterCat===cat.id ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
            }`}>
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Product rows */}
      <div className="space-y-2">
        {filtered.map(product => {
          const d       = drafts[product.id] || { price: product.price, stock: product.stock }
          const changed = parseFloat(d.price) !== product.price || parseInt(d.stock) !== product.stock
          const isSaved = saved[product.id]

          return (
            <div key={product.id}
              className={`card p-3 flex items-center gap-3 flex-wrap transition-all duration-200 ${
                isSaved  ? 'bg-green-50 border border-green-200' :
                changed  ? 'bg-yellow-50 border border-yellow-200' : ''
              }`}>

              {/* Product name */}
              <div className="flex items-center gap-2 flex-1 min-w-36">
                <span className="text-xl">{product.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
                  <span className="text-xs text-gray-400 capitalize">{product.category}</span>
                </div>
              </div>

              {/* Current vs draft price */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Price (₹/{product.unit})</label>
                  <div className="flex items-center gap-1">
                    {parseFloat(d.price) !== product.price && (
                      <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                    )}
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                      <input
                        type="number" min="1" step="1"
                        value={d.price}
                        onChange={e => handleChange(product.id, 'price', e.target.value)}
                        className="input-field py-1.5 pl-5 pr-2 w-20 text-sm font-semibold text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Stock (qty)</label>
                  <div className="flex items-center gap-1">
                    {parseInt(d.stock) !== product.stock && (
                      <span className="text-xs text-gray-400 line-through">{product.stock}</span>
                    )}
                    <input
                      type="number" min="0" step="1"
                      value={d.stock}
                      onChange={e => handleChange(product.id, 'stock', e.target.value)}
                      className={`input-field py-1.5 px-2 w-20 text-sm font-semibold text-center ${
                        parseInt(d.stock) === 0 ? 'text-red-500 border-red-200' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Quick stock presets */}
                <div className="flex flex-col gap-1">
                  {[10,25,50].map(n => (
                    <button key={n}
                      onClick={() => handleChange(product.id, 'stock', String(n))}
                      className="text-xs bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-500 px-1.5 rounded font-semibold transition-colors leading-5">
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save / status */}
              <div className="flex-shrink-0">
                {isSaved ? (
                  <span className="text-green-600 font-semibold text-sm">✅ Saved!</span>
                ) : changed ? (
                  <button onClick={() => saveRow(product)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                    Save
                  </button>
                ) : (
                  <span className="text-gray-300 text-xs font-medium">No changes</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer save all */}
      {filtered.length > 3 && (
        <div className="mt-5 flex justify-end">
          <button onClick={saveAll} className="btn-primary flex items-center gap-2">
            {changedCount > 0 ? `💾 Save All (${changedCount} changed)` : '💾 Save All'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   SHARED SMALL COMPONENTS
───────────────────────────────────────────────────────────────── */
function InlineCellEditor({ value, prefix = '', suffix = '', onChange, onSave, onCancel }) {
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select() }, [])

  function handleKey(e) {
    if (e.key === 'Enter')  onSave()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center bg-white border-2 border-green-400 rounded-lg px-2 shadow-sm">
        {prefix && <span className="text-gray-400 text-xs">{prefix}</span>}
        <input
          ref={inputRef}
          type="number" min="0"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKey}
          className="w-16 text-sm font-semibold outline-none py-1 text-center bg-transparent"
        />
        {suffix && <span className="text-gray-400 text-xs whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, sub, highlight }) {
  return (
    <div className={`card p-4 text-center ${highlight ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100' : ''}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5 font-medium">{label}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  )
}

function InfoPair({ icon, label, value, span, italic }) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <span className="text-gray-400 text-xs">{icon} {label}: </span>
      <span className={`text-gray-700 text-sm font-medium ${italic ? 'italic' : ''}`}>{value}</span>
    </div>
  )
}

function ActionBtn({ color, onClick, children }) {
  const styles = {
    green: 'bg-green-600 hover:bg-green-700 text-white',
    red:   'bg-red-100   hover:bg-red-200   text-red-600',
    blue:  'bg-blue-600  hover:bg-blue-700  text-white',
  }
  return (
    <button onClick={onClick}
      className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1 ${styles[color]}`}>
      {children}
    </button>
  )
}
