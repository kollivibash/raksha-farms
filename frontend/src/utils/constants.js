// ─── Delivery settings ───────────────────────────────────────────
export const FREE_DELIVERY_THRESHOLD = 500   // ₹ — orders above this get free delivery
export const DELIVERY_FEE = 30               // ₹ — flat fee when below threshold

export function calcDelivery(subtotal) {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
}
