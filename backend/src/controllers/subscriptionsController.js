import { query } from '../config/database.js'

export async function getSubscriptions(req, res) {
  try {
    const { rows } = await query(`
      SELECT
        s.id, s.is_active, s.frequency, s.next_delivery, s.price_per_cycle, s.created_at,
        s.items,
        u.name  AS customer_name,
        u.phone AS customer_phone,
        u.email AS customer_email,
        sp.name AS plan_name,
        sp.discount_percent
      FROM subscriptions s
      LEFT JOIN users u              ON s.user_id = u.id
      LEFT JOIN subscription_plans sp ON s.plan_id  = sp.id
      ORDER BY s.created_at DESC
    `)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function updateSubscription(req, res) {
  try {
    const { is_active, next_delivery } = req.body
    const { rows } = await query(
      `UPDATE subscriptions SET is_active=$1, next_delivery=$2, updated_at=NOW()
       WHERE id=$3 RETURNING *`,
      [is_active, next_delivery, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}
