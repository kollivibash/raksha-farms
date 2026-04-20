import { query } from '../config/database.js'

export async function getSubscriptions(req, res) {
  try {
    const { rows } = await query(`
      SELECT s.*, u.name as customer_name, u.phone as customer_phone,
             p.name as product_name, p.image_url, p.unit
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN products p ON s.product_id = p.id
      ORDER BY s.created_at DESC
    `)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function updateSubscription(req, res) {
  try {
    const { frequency, quantity, is_active, next_delivery } = req.body
    const { rows } = await query(
      `UPDATE subscriptions SET frequency=$1, quantity=$2, is_active=$3, next_delivery=$4
       WHERE id=$5 RETURNING *`,
      [frequency, quantity, is_active, next_delivery, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}
