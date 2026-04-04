// Owner's WhatsApp number — update this in production
export const OWNER_PHONE = '919346566945' // Format: country code + number (no +)
export const OWNER_UPI_ID = 'rakshafarms@upi' // ⚠️ Replace with client's real UPI ID before going live
export const OWNER_UPI_NAME = 'Raksha Farms'

export function generateOrderId() {
  const now = Date.now()
  const rand = Math.floor(Math.random() * 1000)
  return `RF${now.toString().slice(-6)}${rand}`
}

export function generateWhatsAppMessage(order) {
  const { customer, items, total, paymentMethod, orderId } = order

  const itemLines = items
    .map(
      (item) =>
        `  • ${item.name} — ${item.quantity} ${item.unit} × ₹${item.price} = *₹${(item.quantity * item.price).toFixed(0)}*`
    )
    .join('\n')

  const payLabel = paymentMethod === 'upi' ? '💳 UPI' : '💵 Cash on Delivery'

  const message = [
    `🌿 *New Order — Raksha Farms*`,
    ``,
    `📦 *Order ID:* #${orderId}`,
    `👤 *Customer:* ${customer.name}`,
    `📞 *Phone:* ${customer.phone}`,
    `📍 *Address:* ${customer.address}`,
    ``,
    `🛒 *Items Ordered:*`,
    itemLines,
    ``,
    `💰 *Total Amount: ₹${total}*`,
    `💳 *Payment: ${payLabel}*`,
    ``,
    `Please confirm the order and share delivery time 🙏`,
    ``,
    `_Sent from Raksha Farms website_`,
  ].join('\n')

  return encodeURIComponent(message)
}

export function openWhatsApp(order) {
  const message = generateWhatsAppMessage(order)
  const url = `https://wa.me/${OWNER_PHONE}?text=${message}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function formatCurrency(amount) {
  return `₹${Number(amount).toFixed(0)}`
}
