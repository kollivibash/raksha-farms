// Sequential order ID counter
function _nextSeq() {
  const key = '_rf_seq'
  const n = parseInt(sessionStorage.getItem(key) || '0', 10) + 1
  sessionStorage.setItem(key, String(n))
  return String(n).padStart(4, '0')
}

export function generateOrderId() {
  const d = new Date()
  const dd   = String(d.getDate()).padStart(2, '0')
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh   = String(d.getHours()).padStart(2, '0')
  const min  = String(d.getMinutes()).padStart(2, '0')
  const ss   = String(d.getSeconds()).padStart(2, '0')
  return `RF-${dd}-${mm}-${yyyy}-${hh}${min}${ss}-${_nextSeq()}`
}

export const FREE_DELIVERY_THRESHOLD = 500
export const DELIVERY_FEE_STANDARD  = 30
export const DELIVERY_FEE_EXPRESS   = 60
export const OWNER_UPI_ID           = 'rakshafarms@upi'
export const OWNER_PHONE            = '9346566945'

export function calcDelivery(subtotal, slotType = 'standard') {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0
  return slotType === 'express' ? DELIVERY_FEE_EXPRESS : DELIVERY_FEE_STANDARD
}

export const DELIVERY_SLOTS = [
  {
    id: 'express',
    label: 'Express Delivery',
    desc: 'Within 2 hours',
    icon: '⚡',
    fee: DELIVERY_FEE_EXPRESS,
    available: () => {
      const h = new Date().getHours()
      return h >= 7 && h < 18
    },
  },
  {
    id: 'morning',
    label: 'Morning Delivery',
    desc: '7 AM – 10 AM',
    icon: '🌅',
    fee: 0,
    available: () => true,
  },
  {
    id: 'evening',
    label: 'Evening Delivery',
    desc: '5 PM – 8 PM',
    icon: '🌆',
    fee: 0,
    available: () => true,
  },
]
