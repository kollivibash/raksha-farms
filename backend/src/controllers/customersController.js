import { query } from '../config/database.js'

export async function getCustomers(req, res) {
  try {
    const { search, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    let sql = `
      SELECT u.id, u.name, u.email, u.phone, u.is_active, u.created_at,
             COUNT(o.id) AS total_orders,
             COALESCE(SUM(o.total),0) AS total_spent
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'delivered'
      WHERE u.role = 'user'`
    const params = []
    if (search) {
      params.push(`%${search}%`)
      sql += ` AND (u.name ILIKE $1 OR u.email ILIKE $1 OR u.phone ILIKE $1)`
    }
    sql += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`
    params.push(limit, offset)
    const { rows } = await query(sql, params)
    const cnt = await query(`SELECT COUNT(*) FROM users WHERE role='user'`)
    res.json({ customers: rows, total: parseInt(cnt.rows[0].count) })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function getCustomerOrders(req, res) {
  try {
    const { rows } = await query(
      `SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50`,
      [req.params.id]
    )
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function toggleCustomerStatus(req, res) {
  try {
    const { rows } = await query(
      'UPDATE users SET is_active = NOT is_active WHERE id=$1 RETURNING id, is_active',
      [req.params.id]
    )
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}
