import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useOrders } from '../context/OrdersContext'

const STATUS_FLOW = [
  { key: 'pending',          label: 'Order Placed',      icon: '📋', desc: 'Your order has been received' },
  { key: 'accepted',         label: 'Confirmed',          icon: '✅', desc: 'Farmer has confirmed your order' },
  { key: 'out_for_delivery', label: 'Out for Delivery',   icon: '🚚', desc: 'Your order is on the way' },
  { key: 'delivered',        label: 'Delivered',          icon: '🎉', desc: 'Order successfully delivered' },
]

const STATUS_INDEX = {
  pending:          0,
  accepted:         1,
  out_for_delivery: 2,
  delivered:        3,
  rejected:         -1,
}


export default function OrderTrackingPage() {
  const { orderId } = useParams()
  const { orders, syncOrdersByUser, syncOrdersByPhone } = useOrders()
  const order = orders.find((o) => o.orderId === orderId)
  const [syncing, setSyncing] = useState(false)

  // Sync on mount + every 30s — user_id first, phone fallback
  useEffect(() => {
    async function sync() {
      setSyncing(true)
      await syncOrdersByUser()
      const phone = order?.customer?.phone
      if (phone) await syncOrdersByPhone(phone)
      setSyncing(false)
    }
    sync()
    const interval = setInterval(sync, 30_000)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line

  if (!order) {
    return (
      <div className="page-enter min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-5xl mb-4">📦</p>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Order not found</h2>
        <p className="text-gray-400 mb-5">Check your order ID or visit My Orders</p>
        <Link to="/my-orders" className="btn-primary">My Orders</Link>
      </div>
    )
  }

  const currentStep = STATUS_INDEX[order.status] ?? 0
  const isRejected  = order.status === 'rejected'

  return (
    <div className="page-enter max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/my-orders" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-forest-500 transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Orders
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Track Order</h1>
          {syncing && (
            <span className="flex items-center gap-1 text-xs text-forest-500 font-medium">
              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Syncing…
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm mt-0.5">Order #{order.orderId.slice(-12)}</p>
      </div>

      {/* Status tracker */}
      {isRejected ? (
        <div className="card p-6 mb-5 text-center bg-red-50 border border-red-200">
          <p className="text-4xl mb-3">❌</p>
          <h2 className="font-bold text-red-700 text-lg">Order Rejected</h2>
          <p className="text-red-500 text-sm mt-1">This order could not be fulfilled. Please contact us for assistance.</p>
          <a href="tel:+919346566945" className="btn-primary mt-4 inline-flex bg-red-500 hover:bg-red-600">
            Call Support
          </a>
        </div>
      ) : (
        <div className="card p-6 mb-5">
          {/* Current status highlight */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-forest-500 flex items-center justify-center text-3xl shadow-forest mb-3">
              {STATUS_FLOW[currentStep]?.icon}
            </div>
            <h2 className="font-bold text-gray-800 text-xl">{STATUS_FLOW[currentStep]?.label}</h2>
            <p className="text-gray-400 text-sm mt-1">{STATUS_FLOW[currentStep]?.desc}</p>
            {order.deliveryTime && (
              <p className="text-forest-600 font-semibold text-sm mt-2">
                Estimated: {order.deliveryTime}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div className="relative">
            {STATUS_FLOW.map((step, i) => {
              const done    = i < currentStep
              const active  = i === currentStep
              const pending = i > currentStep
              return (
                <div key={step.key} className="flex gap-4 pb-5 last:pb-0">
                  {/* Dot + line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base transition-all duration-500 ${
                      done    ? 'bg-forest-500 text-white shadow-forest' :
                      active  ? 'bg-forest-500 text-white shadow-forest ring-4 ring-forest-100' :
                                'bg-gray-100 text-gray-400'
                    }`}>
                      {done ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : step.icon}
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`w-0.5 flex-1 mt-1 transition-all duration-500 ${done ? 'bg-forest-500' : 'bg-gray-200'}`} style={{ minHeight: '24px' }} />
                    )}
                  </div>
                  {/* Label */}
                  <div className="pt-2 pb-1">
                    <p className={`font-semibold text-sm ${done || active ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
                    {(done || active) && (
                      <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Order details */}
      <div className="card p-5 mb-4">
        <h3 className="font-bold text-gray-800 mb-4">Order Details</h3>
        {/* Customer info */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex gap-2">
            <span className="text-gray-400 w-16 flex-shrink-0">Name</span>
            <span className="font-medium text-gray-700">{order.customer.name}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-16 flex-shrink-0">Phone</span>
            <span className="font-medium text-gray-700">+91 {order.customer.phone}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-16 flex-shrink-0">Address</span>
            <span className="font-medium text-gray-700">{order.customer.address}</span>
          </div>
          {order.deliverySlot && (
            <div className="flex gap-2">
              <span className="text-gray-400 w-16 flex-shrink-0">Slot</span>
              <span className="font-medium text-gray-700">{order.deliverySlot}</span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="text-gray-400 w-16 flex-shrink-0">Payment</span>
            <span className="font-medium text-gray-700 capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod?.toUpperCase()}</span>
          </div>
        </div>

        {/* Items */}
        <div className="border-t pt-4 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span>{item.emoji || '🌿'}</span>
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-400">×{item.quantity} {item.unit}</span>
              </div>
              <span className="font-semibold text-gray-800">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t mt-3 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Delivery</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2 mt-2">
            <span>Total</span>
            <span className="text-forest-500">₹{order.total}</span>
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="card p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-700 text-sm">Need help with your order?</p>
          <p className="text-xs text-gray-400">Available 7AM – 8PM daily</p>
        </div>
        <a href="tel:+919346566945" className="btn-primary text-xs px-4 py-2 flex-shrink-0">Call Us</a>
      </div>
    </div>
  )
}
