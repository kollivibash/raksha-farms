import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useOrders } from '../context/OrdersContext'
import { useProducts } from '../context/ProductsContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { generateOrderId, OWNER_UPI_ID } from '../utils/whatsapp'
import { calcDelivery } from '../utils/constants'

const STEPS = ['Cart', 'Details', 'Payment', 'Confirm']

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart()
  const { addOrder } = useOrders()
  const { decreaseStock } = useProducts()
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    notes: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)

  const deliveryFee = calcDelivery(totalPrice)
  const finalTotal = totalPrice + deliveryFee

  if (cart.length === 0) {
    return (
      <div className="page-enter max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <Link to="/" className="btn-primary inline-flex items-center gap-2 mt-4">
          <span>🌿</span> Go Shopping
        </Link>
      </div>
    )
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required'
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) errs.phone = 'Enter valid 10-digit Indian mobile number'
    if (!form.address.trim()) errs.address = 'Delivery address is required'
    if (!form.city.trim()) errs.city = 'City is required'
    if (!/^\d{6}$/.test(form.pincode.trim())) errs.pincode = 'Enter valid 6-digit pincode'
    return errs
  }

  function handleNext() {
    if (step === 1) {
      const errs = validate()
      if (Object.keys(errs).length > 0) {
        setErrors(errs)
        addToast('Please fix the errors below', 'error')
        return
      }
      setErrors({})
    }
    setStep((s) => s + 1)
  }

  async function handlePlaceOrder() {
    setPlacing(true)
    const orderId = generateOrderId()
    const order = {
      orderId,
      customer: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: `${form.address.trim()}, ${form.city.trim()} - ${form.pincode.trim()}`,
        notes: form.notes.trim(),
      },
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
      })),
      total: finalTotal,
      subtotal: totalPrice,
      deliveryFee,
      paymentMethod,
      status: 'pending',
      userEmail: user?.email || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save order + update stock
    addOrder(order)
    cart.forEach((item) => decreaseStock(item.id, item.quantity))

    clearCart()
    setPlacing(false)
    addToast('Order placed successfully! 🎉', 'success', 4000)
    navigate(`/confirmation/${orderId}`)
  }

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 mt-4">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i < step
                    ? 'bg-green-600 text-white'
                    : i === step
                    ? 'bg-green-600 text-white ring-4 ring-green-100'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium hidden sm:block ${i <= step ? 'text-green-700' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 transition-all duration-300 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Step 1: Customer details */}
          {step === 1 && (
            <div className="card p-6 animate-slide-up">
              <h2 className="font-bold text-gray-800 text-lg mb-5 flex items-center gap-2">
                <span>👤</span> Delivery Details
              </h2>
              <div className="space-y-4">
                <Field
                  label="Full Name"
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  error={errors.name}
                  required
                />
                <Field
                  label="Mobile Number"
                  placeholder="10-digit mobile number"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  error={errors.phone}
                  required
                  prefix="+91"
                />
                <Field
                  label="Delivery Address"
                  placeholder="House/Flat no., Street name, Locality"
                  value={form.address}
                  onChange={(v) => setForm({ ...form, address: v })}
                  error={errors.address}
                  required
                  textarea
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="City"
                    placeholder="e.g. Pune"
                    value={form.city}
                    onChange={(v) => setForm({ ...form, city: v })}
                    error={errors.city}
                    required
                  />
                  <Field
                    label="Pincode"
                    placeholder="6-digit pincode"
                    value={form.pincode}
                    onChange={(v) => setForm({ ...form, pincode: v })}
                    error={errors.pincode}
                    required
                  />
                </div>
                <Field
                  label="Delivery Notes (optional)"
                  placeholder="Any specific instructions for delivery..."
                  value={form.notes}
                  onChange={(v) => setForm({ ...form, notes: v })}
                  textarea
                />
              </div>
              <button onClick={handleNext} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
                Continue to Payment <span>→</span>
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card p-6 animate-slide-up">
              <h2 className="font-bold text-gray-800 text-lg mb-5 flex items-center gap-2">
                <span>💳</span> Select Payment Method
              </h2>

              <div className="space-y-3 mb-6">
                <PaymentOption
                  id="cod"
                  selected={paymentMethod === 'cod'}
                  onSelect={() => setPaymentMethod('cod')}
                  icon="💵"
                  title="Cash on Delivery"
                  subtitle="Pay in cash when your order arrives at your door"
                />
                <PaymentOption
                  id="upi"
                  selected={paymentMethod === 'upi'}
                  onSelect={() => setPaymentMethod('upi')}
                  icon="📱"
                  title="UPI Payment"
                  subtitle="Pay via UPI — PhonePe, GPay, Paytm, BHIM"
                />
              </div>

              {paymentMethod === 'upi' && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 text-center border border-green-200 mb-4 animate-slide-up">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Pay to Raksha Farms</p>
                  {/* QR code placeholder */}
                  <div className="w-36 h-36 mx-auto bg-white rounded-xl border-2 border-green-300 flex flex-col items-center justify-center mb-3 shadow-sm">
                    <span className="text-4xl">📱</span>
                    <span className="text-xs text-gray-400 mt-1">QR Code</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-green-200 w-fit mx-auto">
                    <span className="text-green-600 font-mono font-semibold text-sm">{OWNER_UPI_ID}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(OWNER_UPI_ID)
                        addToast('UPI ID copied!', 'success')
                      }}
                      className="text-gray-400 hover:text-green-600 transition-colors"
                      title="Copy UPI ID"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Complete payment and click "Place Order" to confirm
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                  ← Back
                </button>
                <button onClick={handleNext} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card p-6 animate-slide-up">
              <h2 className="font-bold text-gray-800 text-lg mb-5 flex items-center gap-2">
                <span>📋</span> Review Your Order
              </h2>

              {/* Customer summary */}
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{form.name}</p>
                    <p className="text-sm text-gray-500">+91 {form.phone}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{form.address}, {form.city} - {form.pincode}</p>
                    {form.notes && <p className="text-xs text-gray-400 mt-1 italic">Note: {form.notes}</p>}
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-green-600 hover:underline">Edit</button>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <span>{item.emoji}</span>
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-400">× {item.quantity} {item.unit}</span>
                    </div>
                    <span className="font-semibold text-gray-800">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Payment method */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-2">
                <span className="text-sm text-gray-600">Payment Method</span>
                <span className="text-sm font-semibold text-gray-800">
                  {paymentMethod === 'upi' ? '📱 UPI' : '💵 Cash on Delivery'}
                </span>
              </div>

              {/* Order notice */}
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mt-4 flex items-start gap-3">
                <span className="text-xl mt-0.5">✅</span>
                <p className="text-xs text-green-800 leading-relaxed">
                  Clicking "Place Order" will confirm your order online. Our team will contact you
                  on <strong>+91 {form.phone}</strong> to confirm delivery time.
                </p>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                  ← Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 bg-green-600"
                >
                  {placing ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Placing...
                    </>
                  ) : (
                    <>✅ Place Order</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h3 className="font-bold text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm mb-3 max-h-48 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <span>{item.emoji}</span>
                    <span className="truncate max-w-[110px]">{item.name}</span>
                    <span className="text-gray-400 text-xs flex-shrink-0">×{item.quantity}</span>
                  </span>
                  <span className="flex-shrink-0">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2">
                <span>Total</span>
                <span className="text-green-700">₹{finalTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, placeholder, value, onChange, error, required, textarea, type = 'text', prefix }) {
  const cls = `input-field ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''} ${prefix ? 'pl-12' : ''}`
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">{prefix}</span>
        )}
        {textarea ? (
          <textarea
            rows={3}
            className={cls + ' resize-none'}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            type={type}
            className={cls}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function PaymentOption({ id, selected, onSelect, icon, title, subtitle }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
        selected
          ? 'border-green-500 bg-green-50 shadow-sm'
          : 'border-gray-200 hover:border-green-200 hover:bg-green-50/50'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="font-semibold text-gray-800 text-sm">{title}</p>
        <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        selected ? 'border-green-500 bg-green-500' : 'border-gray-300'
      }`}>
        {selected && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </button>
  )
}
