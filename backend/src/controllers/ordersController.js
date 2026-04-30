import { query } from '../config/database.js'
import pool from '../config/database.js'

const VALID_STATUSES = ['placed','accepted','preparing','out_for_delivery','delivered','cancelled','rejected']

// ── Helper: safely parse previously rejected items from order notes ─────────
function getPrevRejectedIds(ord) {
  try {
    const p = typeof ord.notes === 'string' ? JSON.parse(ord.notes) : ord.notes
    return new Set((p?.rejected_items || []).map(r => r.id).filter(Boolean))
  } catch { return new Set() }
}

export async function createOrder(req, res) {
  const client = await pool.connect()
  try {
    const { customer, items, subtotal, deliveryFee, total, paymentMethod, deliverySlot, notes, referenceId, subscription_plan_id } = req.body
    if (!items?.length || !total) return res.status(400).json({ error: 'items and total are required' })

    await client.query('BEGIN')

    let serverTotal = deliveryFee || 0
    const validatedItems = []

    for (const item of items) {
      if (!item.id) continue

      // ── FIX BUG 1: Atomic stock check + deduct in one statement ──────────────
      // SELECT FOR UPDATE locks the row so no concurrent transaction can read
      // stale stock between our check and our update.
      const { rows: pRows } = await client.query(
        'SELECT id, name, price, offer_price, stock, unit, variants, is_active FROM products WHERE id=$1 FOR UPDATE',
        [item.id]
      )
      const prod = pRows[0]

      if (!prod) {
        await client.query('ROLLBACK')
        return res.status(400).json({ error: `Product "${item.name}" could not be found. Please remove it from your cart and try again.` })
      }
      if (!prod.is_active) {
        await client.query('ROLLBACK')
        return res.status(400).json({ error: `"${prod.name}" is no longer available. Please remove it from your cart and try again.` })
      }

      // ── FIX BUG 2: Resolve variant price/unit before falling back to base ────
      const variants = Array.isArray(prod.variants)
        ? prod.variants
        : (() => { try { return JSON.parse(prod.variants || '[]') } catch { return [] } })()

      let serverPrice
      let serverUnit = prod.unit

      if (variants.length && item.unit) {
        const variant = variants.find(v => v.label === item.unit)
        if (variant) {
          serverPrice = Number(variant.price)
          serverUnit  = variant.label
        }
      }
      // Fallback: base product price (offer_price takes precedence)
      if (!serverPrice) {
        serverPrice = prod.offer_price && Number(prod.offer_price) > 0
          ? Number(prod.offer_price)
          : Number(prod.price)
      }

      // ── FIX BUG 1 (continued): Atomic deduct with WHERE stock >= qty ─────────
      // If stock was already taken by a concurrent order, rowCount === 0 → reject.
      const { rowCount } = await client.query(
        `UPDATE products
         SET stock = stock - $1, updated_at = NOW()
         WHERE id = $2 AND stock >= $1`,
        [item.quantity, item.id]
      )
      if (rowCount === 0) {
        await client.query('ROLLBACK')
        return res.status(400).json({ error: `Insufficient stock for "${prod.name}". Please reduce quantity and try again.` })
      }

      await client.query(
        `INSERT INTO inventory_logs (product_id, change, reason) VALUES ($1,$2,'order_placed')`,
        [item.id, -item.quantity]
      ).catch(() => {})

      serverTotal += serverPrice * item.quantity
      validatedItems.push({ ...item, price: serverPrice, unit: serverUnit })
    }

    // ── Build order ───────────────────────────────────────────────────────────
    const emailForAddress = req.user?.email || customer?.email || ''
    const address = {
      name:    customer?.name    || '',
      phone:   customer?.phone   || '',
      address: customer?.address || '',
      notes:   customer?.notes   || notes || '',
      slot:    deliverySlot      || '',
      email:   emailForAddress,
    }

    let userId = req.user?.id || null
    if (!userId && customer?.email) {
      const { rows: u } = await client.query('SELECT id FROM users WHERE email=$1', [customer.email.toLowerCase()]).catch(() => ({ rows: [] }))
      if (u[0]) userId = u[0].id
    }

    const { rows } = await client.query(
      `INSERT INTO orders (user_id, items, subtotal, delivery_fee, total, status, payment_method, address, notes, reference_id)
       VALUES ($1, $2, $3, $4, $5, 'placed', $6, $7, $8, $9) RETURNING *`,
      [
        userId,
        JSON.stringify(validatedItems),
        serverTotal - (deliveryFee || 0),
        deliveryFee || 0,
        serverTotal,
        paymentMethod || 'cod',
        JSON.stringify(address),
        customer?.notes || notes || '',
        referenceId || null,
      ]
    )
    const order = rows[0]

    // ── Subscription creation ─────────────────────────────────────────────────
    if (subscription_plan_id && userId) {
      try {
        const { rows: planRows } = await client.query('SELECT * FROM subscription_plans WHERE id=$1', [subscription_plan_id])
        const plan = planRows[0]
        if (plan) {
          const nextDelivery = new Date()
          nextDelivery.setDate(nextDelivery.getDate() + (plan.frequency_days || 1))
          await client.query(
            `INSERT INTO subscriptions (user_id, plan_id, items, price_per_cycle, frequency, next_delivery, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, true)`,
            [userId, plan.id, JSON.stringify(validatedItems), serverTotal, plan.frequency, nextDelivery.toISOString().split('T')[0]]
          )
        }
      } catch(subErr) {
        console.error('Subscription save error (non-fatal):', subErr.message)
      }
    }

    await client.query('COMMIT')
    res.status(201).json(order)
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
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
  const client = await pool.connect()
  try {
    const { status, rejection_notes, rejected_items, delivery_time } = req.body
    if (!VALID_STATUSES.includes(status))
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` })

    await client.query('BEGIN')

    // Lock the order row to prevent concurrent status updates
    const { rows: existing } = await client.query('SELECT * FROM orders WHERE id=$1 FOR UPDATE', [req.params.id])
    if (!existing[0]) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Order not found' })
    }

    const ord = existing[0]

    // Parse full items list
    const fullItems = (() => {
      try { return Array.isArray(ord.items) ? ord.items : JSON.parse(ord.items || '[]') }
      catch { return [] }
    })()

    // ── FIX BUG 5: Only restore stock for items NOT previously rejected ────────
    const prevRejectedIds = getPrevRejectedIds(ord)

    let notesPayload = rejection_notes || ord.notes || ''
    let newTotal = null

    if (rejected_items?.length) {
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

      const rejectedAmount = enriched.reduce((sum, ri) => sum + (ri.price * ri.quantity), 0)
      const originalTotal  = Number(ord.total)
      const deliveryFee    = Number(ord.delivery_fee || 0)
      const allRejected    = enriched.length >= fullItems.length

      const adjustedTotal = allRejected
        ? 0
        : Math.max(deliveryFee, originalTotal - rejectedAmount)

      newTotal = adjustedTotal

      notesPayload = JSON.stringify({
        remarks:         rejection_notes || '',
        rejected_items:  enriched,
        original_total:  originalTotal,
        rejected_amount: rejectedAmount,
        adjusted_total:  adjustedTotal,
      })

      // Restore stock only for items not already restored in a previous rejection
      for (const item of enriched) {
        if (!item.id || prevRejectedIds.has(item.id)) continue   // already restored — skip
        await client.query(
          `UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id = $2`,
          [item.quantity || 1, item.id]
        ).catch(() => {})
        await client.query(
          `INSERT INTO inventory_logs (product_id, change, reason) VALUES ($1,$2,'rejection_restore')`,
          [item.id, item.quantity || 1]
        ).catch(() => {})
      }
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

    const { rows } = await client.query(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id=$${updateParams.length} RETURNING *`,
      updateParams
    )

    // ── FIX BUG 6: Cancel only restores items not already restored by rejection ─
    if (status === 'cancelled' && ord.status !== 'rejected' && ord.status !== 'cancelled') {
      const updatedPrevRejectedIds = getPrevRejectedIds(ord) // use original ord (before this update)
      for (const item of fullItems) {
        if (!item.id) continue
        if (updatedPrevRejectedIds.has(item.id)) continue  // already restored at rejection time
        await client.query(
          `UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id = $2`,
          [item.quantity || 1, item.id]
        ).catch(() => {})
        await client.query(
          `INSERT INTO inventory_logs (product_id, change, reason) VALUES ($1,$2,'cancellation_restore')`,
          [item.id, item.quantity || 1]
        ).catch(() => {})
      }
    }

    await client.query('COMMIT')
    res.json(rows[0])
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
}

// Authenticated: return all orders for the logged-in user
export async function getMyOrders(req, res) {
  try {
    await query(
      `UPDATE orders SET user_id=$1
       WHERE user_id IS NULL
         AND (address->>'email' ILIKE $2 OR notes ILIKE $3)
         AND address->>'email' != ''`,
      [req.user.id, req.user.email, `%${req.user.email}%`]
    ).catch(() => {})

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
