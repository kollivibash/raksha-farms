import { query } from '../config/database.js'

const BASE_SELECT = `
  SELECT
    s.id, s.is_active, s.frequency, s.next_delivery, s.price_per_cycle,
    s.delivery_count, s.skipped_count, s.start_date, s.created_at, s.items,
    u.id   AS user_id,
    u.name AS customer_name,
    u.phone AS customer_phone,
    u.email AS customer_email,
    sp.id   AS plan_id,
    sp.name AS plan_name,
    sp.frequency_days,
    sp.discount_percent
  FROM subscriptions s
  LEFT JOIN users u               ON s.user_id = u.id
  LEFT JOIN subscription_plans sp ON s.plan_id  = sp.id
`

// Admin: get all subscriptions
export async function getSubscriptions(req, res) {
  try {
    const { rows } = await query(`${BASE_SELECT} ORDER BY s.created_at DESC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// Customer: get own subscriptions
export async function getMySubscriptions(req, res) {
  try {
    const { rows } = await query(`${BASE_SELECT} WHERE s.user_id = $1 ORDER BY s.created_at DESC`, [req.user.id])
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// Admin: update subscription (pause/resume, next_delivery)
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

// Admin: mark delivery done — advance next_delivery by frequency_days, increment count
export async function markDelivered(req, res) {
  try {
    const { rows: sub } = await query(
      `SELECT s.*, sp.frequency_days FROM subscriptions s
       LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.id = $1`, [req.params.id]
    )
    if (!sub[0]) return res.status(404).json({ error: 'Subscription not found' })

    const days = sub[0].frequency_days || 1
    const { rows } = await query(
      `UPDATE subscriptions
       SET delivery_count = delivery_count + 1,
           next_delivery  = COALESCE(next_delivery, CURRENT_DATE) + ($1 || ' days')::interval,
           updated_at     = NOW()
       WHERE id = $2 RETURNING *`,
      [days, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// Admin: skip next delivery — advance without incrementing delivery_count
export async function skipDelivery(req, res) {
  try {
    const { rows: sub } = await query(
      `SELECT s.*, sp.frequency_days FROM subscriptions s
       LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.id = $1`, [req.params.id]
    )
    if (!sub[0]) return res.status(404).json({ error: 'Subscription not found' })

    const days = sub[0].frequency_days || 1
    const { rows } = await query(
      `UPDATE subscriptions
       SET skipped_count = skipped_count + 1,
           next_delivery = COALESCE(next_delivery, CURRENT_DATE) + ($1 || ' days')::interval,
           updated_at    = NOW()
       WHERE id = $2 RETURNING *`,
      [days, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// Customer: pause or resume own subscription
export async function toggleMySubscription(req, res) {
  try {
    const { rows } = await query(
      `UPDATE subscriptions SET is_active = NOT is_active, updated_at = NOW()
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// Customer: cancel subscription
export async function cancelMySubscription(req, res) {
  try {
    const { rows } = await query(
      `DELETE FROM subscriptions WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
}
