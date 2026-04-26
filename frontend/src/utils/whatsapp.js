// Owner's WhatsApp number — update this in production
export const OWNER_PHONE = '919346566945' // Format: country code + number (no +)
export const OWNER_UPI_ID = 'rakshafarms@upi' // ⚠️ Replace with client's real UPI ID before going live
export const OWNER_UPI_NAME = 'Raksha Farms'

// Sequential counter stored in sessionStorage so it resets each tab but is
// unique within a session; the time-stamp already disambiguates across sessions.
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

export function formatCurrency(amount) {
  return `₹${Number(amount).toFixed(0)}`
}
