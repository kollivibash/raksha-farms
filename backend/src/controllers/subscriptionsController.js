import { query } from '../config/database.js'
import pool from '../config/database.js'

const BASE_SELECT = `
  SELECT
    s.id, s.is_active, s.frequency, s.next_delivery, s.price_per_cycle,
    s.delivery_count, s.skipped_count, s.start_date, s.created_at, s.items,
    s.payment_status, s.address AS sub_address, s.notes AS sub_notes,
    u.id    AS user_id,
    u.name  AS customer_name,
    u.email AS customer_email,
    u.address AS customer_address,
    -- Phone: users table first, then subscription address, then most recent order address
    COALESCE(
      NULLIF(u.phone, ''),
      NULLIF(s.address->>'phone', ''),
      (SELECT NULLIF(o.address->>'phone', '')
       FROM orders o WHERE o.user_id = s.user_id
       ORDER BY o.created_at DESC LIMIT 1)
    ) AS customer_phone,
    sp.id            AS plan_id,
    sp.name          AS plan_name,
    sp.frequency_days,
    sp.discount_percent
  FROM subscriptions s
  LEFT JOIN users u               ON s.user_id = u.id
  LEFT JOIN subscription_plans sp ON s.plan_id  = sp.id
`

// ── Admin: dashboard stats + stock warnings ────────────────────────────────────
export async function getDashboard(req, res) {
  try {
    // Counts
    const { rows: statsRows } = await query(`
      SELECT
        COUNT(*) FILTER (WHERE is_active AND next_delivery  = CURRENT_DATE)          AS due_today,
        COUNT(*) FILTER (WHERE is_active AND next_delivery  = CURRENT_DATE + 1)      AS due_tomorrow,
        COUNT(*) FILTER (WHERE is_active AND next_delivery  < CURRENT_DATE)          AS overdue,
        COUNT(*) FILTER (WHERE is_active)                                            AS active,
        COUNT(*) FILTER (WHERE NOT is_active)                                        AS paused,
        COUNT(*) FILTER (WHERE payment_status = 'failed')                            AS failed_payment,
        COUNT(*)                                                                      AS total
      FROM subscriptions
    `)
    const stats = statsRows[0]

    // Stock check: aggregate items needed for today + tomorrow's deliveries
    const { rows: dueSubs } = await query(`
      SELECT items FROM subscriptions
      WHERE is_active = true
        AND next_delivery <= CURRENT_DATE + 1
    `)

    const needed = {}  // { product_id: { name, qty } }
    for (const sub of dueSubs) {
      const items = Array.isArray(sub.items) ? sub.items : JSON.parse(sub.items || '[]')
      for (const item of items) {
        const key = item.id || item.name
        if (!key) continue
        if (!needed[key]) needed[key] = { id: item.id, name: item.name, qty: 0 }
        needed[key].qty += Number(item.quantity) || 1
      }
    }

    const stockWarnings = []
    for (const [, info] of Object.entries(needed)) {
      if (!info.id) continue
      const { rows: pRows } = await query(
        'SELECT name, stock FROM products WHERE id=$1', [info.id]
      )
      if (pRows[0] && pRows[0].stock < info.qty) {
        stockWarnings.push({
          product_id: info.id,
          name:       pRows[0].name || info.name,
          needed:     info.qty,
          available:  pRows[0].stock,
          short:      info.qty - pRows[0].stock,
        })
      }
    }

    // Today's delivery list (preview)
    const { rows: todayList } = await query(`
      ${BASE_SELECT}
      WHERE s.is_active = true AND s.next_delivery = CURRENT_DATE
      ORDER BY u.name ASC
    `)

    res.json({ stats, stockWarnings, todayList })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// ── Admin: calendar — subscriptions grouped by delivery date ───────────────────
export async function getCalendar(req, res) {
  try {
    const today    = new Date().toISOString().split('T')[0]
    const sevenOut = new Date(Date.now() + 13 * 86400000).toISOString().split('T')[0]
    const from = req.query.from || today
    const to   = req.query.to   || sevenOut

    const { rows } = await query(`
      SELECT
        s.id, s.next_delivery, s.items, s.price_per_cycle,
        s.frequency, s.is_active, s.delivery_count, s.skipped_count,
        s.payment_status,
        u.name  AS customer_name,
        u.email AS customer_email,
        u.address AS customer_address,
        COALESCE(
          NULLIF(u.phone, ''),
          NULLIF(s.address->>'phone', ''),
          (SELECT NULLIF(o.address->>'phone', '')
           FROM orders o WHERE o.user_id = s.user_id
           ORDER BY o.created_at DESC LIMIT 1)
        ) AS customer_phone,
        sp.name AS plan_name, sp.frequency_days
      FROM subscriptions s
      LEFT JOIN users u               ON s.user_id = u.id
      LEFT JOIN subscription_plans sp ON s.plan_id  = sp.id
      WHERE s.is_active = true
        AND s.next_delivery BETWEEN $1 AND $2
      ORDER BY s.next_delivery ASC, u.name ASC
    `, [from, to])

    // Group by date
    const grouped = {}
    for (const row of rows) {
      const d = row.next_delivery instanceof Date
        ? row.next_delivery.toISOString().split('T')[0]
        : String(row.next_delivery).split('T')[0]
      if (!grouped[d]) grouped[d] = []
      grouped[d].push(row)
    }

    res.json({ from, to, calendar: grouped })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// ── Admin: generate orders for a given date ────────────────────────────────────
export async function generateOrders(req, res) {
  const client = await pool.connect()
  try {
    const targetDate = req.body.date || new Date().toISOString().split('T')[0]

    const { rows: dueSubs } = await client.query(`
      SELECT s.*,
        u.name  AS uname,
        u.email AS uemail,
        u.address AS uaddress,
        COALESCE(
          NULLIF(u.phone, ''),
          NULLIF(s.address->>'phone', ''),
          (SELECT NULLIF(o.address->>'phone', '')
           FROM orders o WHERE o.user_id = s.user_id
           ORDER BY o.created_at DESC LIMIT 1)
        ) AS uphone,
        sp.frequency_days
      FROM subscriptions s
      LEFT JOIN users u               ON s.user_id = u.id
      LEFT JOIN subscription_plans sp ON s.plan_id  = sp.id
      WHERE s.is_active = true AND s.next_delivery = $1
    `, [targetDate])

    if (!dueSubs.length) {
      return res.json({ generated: 0, orders: [], message: 'No subscriptions due on this date' })
    }

    await client.query('BEGIN')

    const created = []
    for (const sub of dueSubs) {
      const items = Array.isArray(sub.items) ? sub.items : JSON.parse(sub.items || '[]')
      const address = sub.address || sub.uaddress
        ? (typeof (sub.address || sub.uaddress) === 'string'
            ? JSON.parse(sub.address || sub.uaddress)
            : (sub.address || sub.uaddress))
        : {}
      const addr = {
        name:    sub.uname    || address.name    || '',
        phone:   sub.uphone   || address.phone   || '',
        email:   sub.uemail   || address.email   || '',
        address: address.address || address.street || '',
        notes:   `Subscription delivery (${sub.frequency})`,
      }

      // Create order
      const { rows: oRows } = await client.query(
        `INSERT INTO orders
           (user_id, items, subtotal, delivery_fee, total, status, payment_method, address, notes)
         VALUES ($1,$2,$3,0,$3,'placed','cod',$4,$5)
         RETURNING id, reference_id`,
        [sub.user_id, JSON.stringify(items), sub.price_per_cycle,
         JSON.stringify(addr), `Subscription - ${sub.frequency}`]
      )
      const orderId = oRows[0].id

      // Record delivery entry
      await client.query(
        `INSERT INTO subscription_deliveries
           (subscription_id, delivery_date, status, order_id, payment_status, payment_amount)
         VALUES ($1,$2,'pending',$3,'cod_due',$4)`,
        [sub.id, targetDate, orderId, sub.price_per_cycle]
      )

      // Advance next_delivery + increment delivery_count + reset payment for new cycle
      const days = sub.frequency_days || 1
      await client.query(
        `UPDATE subscriptions
         SET delivery_count = delivery_count + 1,
             next_delivery  = $1::date + ($2 || ' days')::interval,
             payment_status = 'cod_due',
             updated_at     = NOW()
         WHERE id = $3`,
        [targetDate, days, sub.id]
      )

      created.push({
        subscription_id: sub.id,
        order_id:        orderId,
        customer:        sub.uname,
        items:           items.length,
        amount:          sub.price_per_cycle,
      })
    }

    await client.query('COMMIT')
    res.json({ generated: created.length, date: targetDate, orders: created })
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
}

// ── Admin: full detail + delivery history ─────────────────────────────────────
export async function getSubscriptionDetail(req, res) {
  try {
    const { rows: sub } = await query(`${BASE_SELECT} WHERE s.id = $1`, [req.params.id])
    if (!sub[0]) return res.status(404).json({ error: 'Subscription not found' })

    const { rows: history } = await query(`
      SELECT sd.*, o.reference_id, o.status AS order_status
      FROM subscription_deliveries sd
      LEFT JOIN orders o ON sd.order_id = o.id
      WHERE sd.subscription_id = $1
      ORDER BY sd.delivery_date DESC
      LIMIT 50
    `, [req.params.id])

    res.json({ ...sub[0], history })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// ── Admin: full update (items, date, status, payment_status, notes) ────────────
export async function updateSubscriptionAdmin(req, res) {
  try {
    const { is_active, next_delivery, items, price_per_cycle, payment_status, notes } = req.body
    const sets = ['updated_at=NOW()']
    const vals = []

    if (is_active     !== undefined) { vals.push(is_active);                sets.push(`is_active=$${vals.length}`) }
    if (next_delivery)                { vals.push(next_delivery);             sets.push(`next_delivery=$${vals.length}`) }
    if (items)                        { vals.push(JSON.stringify(items));     sets.push(`items=$${vals.length}`) }
    if (price_per_cycle)              { vals.push(price_per_cycle);           sets.push(`price_per_cycle=$${vals.length}`) }
    if (payment_status)               { vals.push(payment_status);            sets.push(`payment_status=$${vals.length}`) }
    if (notes !== undefined)          { vals.push(notes);                     sets.push(`notes=$${vals.length}`) }

    vals.push(req.params.id)
    const { rows } = await query(
      `UPDATE subscriptions SET ${sets.join(', ')} WHERE id=$${vals.length} RETURNING *`,
      vals
    )
    if (!rows[0]) return res.status(404).json({ error: 'Subscription not found' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// ── Admin: get all subscriptions ───────────────────────────────────────────────
export async function getSubscriptions(req, res) {
  try {
    const { rows } = await query(`${BASE_SELECT} ORDER BY s.next_delivery ASC, s.created_at DESC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// ── Customer: get own subscriptions ───────────────────────────────────────────
export async function getMySubscriptions(req, res) {
  try {
    const { rows } = await query(`${BASE_SELECT} WHERE s.user_id=$1 ORDER BY s.created_at DESC`, [req.user.id])
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// ── Admin: mark delivered — COD collected, payment auto-set to paid ────────────
export async function markDelivered(req, res) {
  try {
    const { rows: sub } = await query(
      `SELECT s.*, sp.frequency_days FROM subscriptions s
       LEFT JOIN subscription_plans sp ON s.plan_id=sp.id WHERE s.id=$1`, [req.params.id]
    )
    if (!sub[0]) return res.status(404).json({ error: 'Subscription not found' })
    const days = sub[0].frequency_days || 1
    const today = new Date().toISOString().split('T')[0]
    const deliveryDate = sub[0].next_delivery
      ? String(sub[0].next_delivery).split('T')[0]
      : today

    // Record delivery: COD is collected at the door → payment_status = paid
    await query(
      `INSERT INTO subscription_deliveries
         (subscription_id, delivery_date, status, payment_status, payment_amount)
       VALUES ($1,$2,'delivered','paid',$3)`,
      [req.params.id, deliveryDate, sub[0].price_per_cycle]
    ).catch(() => {})

    // Advance next_delivery, increment delivery_count, mark this cycle paid
    const { rows } = await query(
      `UPDATE subscriptions
       SET delivery_count  = delivery_count + 1,
           next_delivery   = COALESCE(next_delivery, CURRENT_DATE) + ($1 || ' days')::interval,
           payment_status  = 'paid',
           updated_at      = NOW()
       WHERE id=$2 RETURNING *`,
      [days, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// ── Admin: skip next delivery ─────────────────────────────────────────────────
export async function skipDelivery(req, res) {
  try {
    const { rows: sub } = await query(
      `SELECT s.*, sp.frequency_days FROM subscriptions s
       LEFT JOIN subscription_plans sp ON s.plan_id=sp.id WHERE s.id=$1`, [req.params.id]
    )
    if (!sub[0]) return res.status(404).json({ error: 'Subscription not found' })
    const days = sub[0].frequency_days || 1
    const today = new Date().toISOString().split('T')[0]

    await query(
      `INSERT INTO subscription_deliveries (subscription_id, delivery_date, status, payment_status, payment_amount)
       VALUES ($1,$2,'skipped','pending',0)`,
      [req.params.id, sub[0].next_delivery || today]
    ).catch(() => {})

    const { rows } = await query(
      `UPDATE subscriptions
       SET skipped_count = skipped_count + 1,
           next_delivery = COALESCE(next_delivery, CURRENT_DATE) + ($1 || ' days')::interval,
           updated_at    = NOW()
       WHERE id=$2 RETURNING *`,
      [days, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// ── Customer: pause or resume own subscription ─────────────────────────────────
export async function toggleMySubscription(req, res) {
  try {
    const { rows } = await query(
      `UPDATE subscriptions SET is_active=NOT is_active, updated_at=NOW()
       WHERE id=$1 AND user_id=$2 RETURNING *`,
      [req.params.id, req.user.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// ── Customer: cancel subscription ─────────────────────────────────────────────
export async function cancelMySubscription(req, res) {
  try {
    const { rows } = await query(
      `DELETE FROM subscriptions WHERE id=$1 AND user_id=$2 RETURNING id`,
      [req.params.id, req.user.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
}
