import { query } from '../config/database.js'

const VALID_STATUSES = ['placed','accepted','preparing','out_for_delivery','delivered','cancelled']

export async function createOrder(req, res) {
  try {
    const { customer, items, subtotal, deliveryFee, total, paymentMethod, deliverySlot, notes } = req.body
    if (!items?.length || !total) return res.status(400).json({ error: 'items and total are required' })

    // Build address JSONB from customer object
    const address = {
      name:    customer?.name    || '',
      phone:   customer?.phone   || '',
      address: customer?.address || '',
      notes:   customer?.notes   || notes || '',
      slot:    deliverySlot      || '',
    }

    const { rows } = await query(
      `INSERT INTO orders (user_id, items, subtotal, delivery_fee, total, status, payment_method, address, notes)
       VALUES ($1, $2, $3, $4, $5, 'placed', $6, $7, $8) RETURNING *`,
      [
        req.user?.id || null,
        JSON.stringify(items),
        subtotal  || total,
        deliveryFee || 0,
        total,
        paymentMethod || 'cod',
        JSON.stringify(address),
        customer?.notes || notes || '',
      ]
    )
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function getOrders(req, res) {
  try {
    const { status, page = 1, limit = 20, search } = req.query
    const offset = (page - 1) * limit
    let sql = `SELECT o.*, u.name as customer_name, u.phone as customer_phone
               FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE 1=1`
    const params = []
    if (status) { params.push(status); sql += ` AND o.status=$${params.length}` }
    if (search) { params.push(`%${search}%`); sql += ` AND (u.name ILIKE $${params.length} OR u.phone ILIKE $${params.length})` }
    sql += ` ORDER BY o.created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`
    params.push(limit, offset)
    const { rows } = await query(sql, params)
    const cnt = await query(`SELECT COUNT(*) FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE 1=1${status?` AND o.status='${status}'`:''}`)
    res.json({ orders: rows, total: parseInt(cnt.rows[0].count), page: parseInt(page) })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function getOrder(req, res) {
  try {
    const { rows } = await query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE o.id=$1`,
      [req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body
    if (!VALID_STATUSES.includes(status))
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` })
    const { rows } = await query(
      'UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function getOrderStats(req, res) {
  try {
    const { rows } = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status='placed')           AS placed,
        COUNT(*) FILTER (WHERE status='accepted')         AS accepted,
        COUNT(*) FILTER (WHERE status='out_for_delivery') AS out_for_delivery,
        COUNT(*) FILTER (WHERE status='delivered')        AS delivered,
        COUNT(*) FILTER (WHERE status='cancelled')        AS cancelled,
        COUNT(*) AS total
      FROM orders WHERE DATE(created_at) = CURRENT_DATE
    `)
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}
