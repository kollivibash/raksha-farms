import { query } from '../config/database.js'

const VALID_STATUSES = ['placed','accepted','preparing','out_for_delivery','delivered','cancelled','rejected']

export async function createOrder(req, res) {
  try {
    const { customer, items, subtotal, deliveryFee, total, paymentMethod, deliverySlot, notes, referenceId, subscription_plan_id } = req.body
    if (!items?.length || !total) return res.status(400).json({ error: 'items and total are required' })

    // Build address JSONB from customer object
    const emailForAddress = req.user?.email || customer?.email || ''
    const address = {
      name:    customer?.name    || '',
      phone:   customer?.phone   || '',
      address: customer?.address || '',
      notes:   customer?.notes   || notes || '',
      slot:    deliverySlot      || '',
      email:   emailForAddress,
    }

    // If not authenticated but email known, try linking to user
    let userId = req.user?.id || null
    if (!userId && customer?.email) {
      const { rows: u } = await query('SELECT id FROM users WHERE email=$1', [customer.email.toLowerCase()]).catch(() => ({ rows: [] }))
      if (u[0]) userId = u[0].id
    }

    const { rows } = await query(
      `INSERT INTO orders (user_id, items, subtotal, delivery_fee, total, status, payment_method, address, notes, reference_id)
       VALUES ($1, $2, $3, $4, $5, 'placed', $6, $7, $8, $9) RETURNING *`,
      [
        userId,
        JSON.stringify(items),
        subtotal  || total,
        deliveryFee || 0,
        total,
        paymentMethod || 'cod',
        JSON.stringify(address),
        customer?.notes || notes || '',
        referenceId || null,
      ]
    )
    const order = rows[0]

    // If a subscription plan was selected, create a subscription record
    if (subscription_plan_id && userId) {
      try {
        const { rows: planRows } = await query('SELECT * FROM subscription_plans WHERE id=$1', [subscription_plan_id])
        const plan = planRows[0]
        if (plan) {
          const nextDelivery = new Date()
          nextDelivery.setDate(nextDelivery.getDate() + (plan.frequency_days || 1))
          await query(
            `INSERT INTO subscriptions (user_id, plan_id, items, price_per_cycle, frequency, next_delivery, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, true)`,
            [userId, plan.id, JSON.stringify(items), total, plan.frequency, nextDelivery.toISOString().split('T')[0]]
          )
        }
      } catch(subErr) {
        console.error('Subscription save error (non-fatal):', subErr.message)
      }
    }

    res.status(201).json(order)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function getOrders(req, res) {
  try {
    const { status, page = 1, limit = 20, search, from_date, to_date } = req.query
    const offset = (page - 1) * limit
    let sql = `SELECT o.*, u.name as customer_name, u.phone as customer_phone
               FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE 1=1`
    const params = []
    if (status) { params.push(status); sql += ` AND o.status=$${params.length}` }
    if (search) {
      params.push(`%${search}%`)
      sql += ` AND (u.name ILIKE $${params.length} OR u.phone ILIKE $${params.length} OR o.reference_id ILIKE $${params.length} OR o.address->>'phone' ILIKE $${params.length} OR o.address->>'name' ILIKE $${params.length})`
    }
    if (from_date) { params.push(from_date); sql += ` AND o.created_at >= $${params.length}::date` }
    if (to_date)   { params.push(to_date);   sql += ` AND o.created_at <  ($${params.length}::date + interval '1 day')` }
    const countSql = sql.replace('SELECT o.*, u.name as customer_name, u.phone as customer_phone', 'SELECT COUNT(*)')
    sql += ` ORDER BY o.created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`
    params.push(limit, offset)
    const { rows } = await query(sql, params)
    const cnt = await query(countSql, params.slice(0, params.length - 2))
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
    const { status, rejection_notes, rejected_items, delivery_time } = req.body
    if (!VALID_STATUSES.includes(status))
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` })

    // Fetch current order
    const { rows: existing } = await query('SELECT * FROM orders WHERE id=$1', [req.params.id])
    if (!existing[0]) return res.status(404).json({ error: 'Order not found' })

    const ord = existing[0]

    // Parse full items list (to look up prices for rejected items)
    const fullItems = (() => {
      try { return Array.isArray(ord.items) ? ord.items : JSON.parse(ord.items || '[]') }
      catch { return [] }
    })()

    // --- Rejection logic ---
    let notesPayload = rejection_notes || ord.notes || ''
    let newTotal = null // only set when rejection changes the total

    if (rejected_items?.length) {
      // Enrich rejected_items with price from stored order items
      const enriched = rejected_items.map(ri => {
        const found = fullItems.find(fi => fi.id === ri.id || fi.name === ri.name)
        return {
          id:       ri.id || found?.id,
          name:     ri.name || found?.name,
          quantity: ri.quantity ?? found?.quantity ?? 1,
          unit:     found?.unit || '',
          emoji:    found?.emoji || '',
          price:    found?.price ?? ri.price ?? 0,
        }
      })

      // Calculate how much was rejected
      const rejectedAmount = enriched.reduce((sum, ri) => sum + (ri.price * ri.quantity), 0)
      const originalTotal  = Number(ord.total)
      const deliveryFee    = Number(ord.delivery_fee || 0)
      const allRejected    = enriched.length >= fullItems.length

      // New total = original minus rejected items cost; if all rejected → 0
      const adjustedTotal = allRejected
        ? 0
        : Math.max(deliveryFee, originalTotal - rejectedAmount)

      newTotal = adjustedTotal

      notesPayload = JSON.stringify({
        remarks:        rejection_notes || '',
        rejected_items: enriched,
        original_total: originalTotal,
        rejected_amount: rejectedAmount,
        adjusted_total: adjustedTotal,
      })
    }

    const updateFields = ['status=$1', 'updated_at=NOW()']
    const updateParams = [status]

    if (notesPayload !== ord.notes) {
      updateFields.push(`notes=$${updateParams.length + 1}`)
      updateParams.push(notesPayload)
    }
    if (newTotal !== null) {
      updateFields.push(`total=$${updateParams.length + 1}`)
      updateParams.push(newTotal)
    }
    if (delivery_time) {
      updateFields.push(`delivery_time=$${updateParams.length + 1}`)
      updateParams.push(delivery_time)
    }
    updateParams.push(req.params.id)

    const { rows } = await query(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id=$${updateParams.length} RETURNING *`,
      updateParams
    )

    // Restore stock for every rejected item (partial or full rejection)
    if (rejected_items?.length) {
      for (const item of rejected_items) {
        await query(
          `UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id = $2`,
          [item.quantity || 1, item.id]
        ).catch(() => {})
      }
    }

    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// Authenticated: return all orders for the logged-in user (by user_id in DB)
export async function getMyOrders(req, res) {
  try {
    // First: auto-link any unlinked orders that match this user's email (case-insensitive)
    await query(
      `UPDATE orders SET user_id=$1
       WHERE user_id IS NULL
         AND (address->>'email' ILIKE $2 OR notes ILIKE $3)
         AND address->>'email' != ''`,
      [req.user.id, req.user.email, `%${req.user.email}%`]
    ).catch(() => {}) // non-fatal

    // Fetch all orders by user_id OR by email match in address JSON (handles old unlinked orders)
    const { rows } = await query(
      `SELECT id, reference_id, status, total, delivery_fee, payment_method,
              items, address, notes, created_at, updated_at
       FROM orders
       WHERE user_id=$1
          OR (user_id IS NULL AND address->>'email' ILIKE $2 AND address->>'email' != '')
       ORDER BY created_at DESC LIMIT 100`,
      [req.user.id, req.user.email]
    )
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// Public: return all orders matching a phone number (last 90 days) — full data for proper restore
// No auth needed — phone number acts as the identifier for guest/user orders
export async function getOrdersByPhone(req, res) {
  try {
    const phone = req.params.phone.replace(/\D/g, '').slice(-10)
    if (phone.length < 8) return res.status(400).json({ error: 'Invalid phone' })
    const { rows } = await query(
      `SELECT id, reference_id, status, total, delivery_fee, payment_method,
              items, address, notes, created_at, updated_at
       FROM orders
       WHERE address->>'phone' LIKE $1
         AND created_at > NOW() - INTERVAL '90 days'
       ORDER BY created_at DESC
       LIMIT 50`,
      [`%${phone}`]
    )
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// User-facing status poll by DB UUID — no admin needed
export async function trackOrder(req, res) {
  try {
    const { rows } = await query(
      `SELECT id, user_id, status, updated_at FROM orders WHERE id=$1`,
      [req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' })
    if (req.user?.id && rows[0].user_id && rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    res.json({ id: rows[0].id, status: rows[0].status, updatedAt: rows[0].updated_at })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// User-facing status poll by frontend reference ID (RF-dd-mm-yyyy-...) — no auth needed
export async function trackOrderByRef(req, res) {
  try {
    const { rows } = await query(
      `SELECT id, status, updated_at FROM orders WHERE reference_id=$1`,
      [req.params.ref]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' })
    res.json({ id: rows[0].id, status: rows[0].status, updatedAt: rows[0].updated_at })
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
