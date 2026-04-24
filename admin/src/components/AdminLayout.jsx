'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import { Bell } from 'lucide-react'
import Cookies from 'js-cookie'
import { ordersAPI } from '../lib/api'

const SEEN_KEY = 'rf_admin_seen_orders'

function getSeenIds() {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')) } catch { return new Set() }
}
function markAllSeen(ids) {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]))
}

export default function AdminLayout({ children, title }) {
  const router = useRouter()
  const [user, setUser] = useState(null)

  // Notifications state
  const [newOrders, setNewOrders]   = useState([])   // recent 'placed' orders
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen]             = useState(false)
  const bellRef = useRef(null)

  useEffect(() => {
    const token = Cookies.get('admin_token') || localStorage.getItem('admin_token')
    if (!token) { router.replace('/login'); return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
    } catch { router.replace('/login') }
  }, [])

  // Poll backend for recent placed orders every 30 s
  const fetchNew = useCallback(async () => {
    try {
      const { data } = await ordersAPI.getAll({ status: 'placed', limit: 10, page: 1 })
      const orders = data.orders || []
      setNewOrders(orders)
      const seen = getSeenIds()
      setUnreadCount(orders.filter(o => !seen.has(o.id)).length)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    if (!user) return
    fetchNew()
    const t = setInterval(fetchNew, 30_000)
    return () => clearInterval(t)
  }, [user, fetchNew])

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function toggleOpen() {
    setOpen(v => {
      if (!v) {
        // Mark all current orders as seen when opening
        markAllSeen(newOrders.map(o => o.id))
        setUnreadCount(0)
      }
      return !v
    })
  }

  function goToOrders() {
    setOpen(false)
    router.push('/orders')
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          <div className="flex items-center gap-4">

            {/* Notification bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={toggleOpen}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="New order notifications"
              >
                <Bell size={20} className={unreadCount > 0 ? 'text-[#1B4332]' : 'text-gray-500'} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-0.5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-800 text-sm">New Orders</p>
                    <button onClick={goToOrders} className="text-xs text-[#1B4332] font-semibold hover:underline">
                      View all →
                    </button>
                  </div>

                  {newOrders.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-400 text-sm">
                      🎉 No pending orders right now
                    </div>
                  ) : (
                    <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {newOrders.map(o => {
                        const addr = typeof o.address === 'string'
                          ? JSON.parse(o.address || '{}') : (o.address || {})
                        const name = o.customer_name || addr.name || 'Guest'
                        const items = Array.isArray(o.items) ? o.items.length : 0
                        const time  = new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                        return (
                          <li key={o.id}
                            onClick={goToOrders}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-green-50 cursor-pointer transition-colors">
                            <div className="w-9 h-9 bg-[#1B4332] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-sm font-bold">{name[0]?.toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-sm truncate">{name}</p>
                              <p className="text-xs text-gray-500">{items} item{items !== 1 ? 's' : ''} · ₹{Number(o.total).toLocaleString()}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{time}</p>
                            </div>
                            <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full self-center flex-shrink-0">
                              Placed
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
                    <p className="text-xs text-gray-400">Refreshes every 30 seconds</p>
                  </div>
                </div>
              )}
            </div>

            {/* User avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1B4332] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user.name?.[0]?.toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
