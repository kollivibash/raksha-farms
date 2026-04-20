import { query } from '../config/database.js'

export async function getCoupons(req, res) {
  try {
    const { rows } = await query('SELECT * FROM coupons ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function createCoupon(req, res) {
  try {
    const { code, type, value, min_order, max_uses, expires_at } = req.body
    const { rows } = await query(
      `INSERT INTO coupons (code, type, value, min_order, max_uses, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [code.toUpperCase(), type, value, min_order||0, max_uses||100, expires_at||null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Coupon code already exists' })
    res.status(500).json({ error: err.message })
  }
}

export async function updateCoupon(req, res) {
  try {
    const { type, value, min_order, max_uses, expires_at, is_active } = req.body
    const { rows } = await query(
      `UPDATE coupons SET type=$1, value=$2, min_order=$3, max_uses=$4, expires_at=$5, is_active=$6
       WHERE id=$7 RETURNING *`,
      [type, value, min_order, max_uses, expires_at, is_active, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Coupon not found' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function deleteCoupon(req, res) {
  try {
    await query('DELETE FROM coupons WHERE id=$1', [req.params.id])
    res.json({ message: 'Coupon deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function validateCoupon(req, res) {
  try {
    const { code, order_total } = req.body
    const { rows } = await query(
      `SELECT * FROM coupons WHERE code=$1 AND is_active=true
       AND (expires_at IS NULL OR expires_at > NOW())
       AND used_count < max_uses`,
      [code.toUpperCase()]
    )
    if (!rows[0]) return res.status(400).json({ error: 'Invalid or expired coupon' })
    const coupon = rows[0]
    if (order_total < coupon.min_order)
      return res.status(400).json({ error: `Minimum order ₹${coupon.min_order} required` })
    const discount = coupon.type === 'percent'
      ? (order_total * coupon.value / 100)
      : coupon.value
    res.json({ valid: true, discount: Math.min(discount, order_total), coupon })
  } catch (err) { res.status(500).json({ error: err.message }) }
}
