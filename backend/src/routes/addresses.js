import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'
import { query } from '../config/database.js'
const r = Router()

// Checkout stores the delivery address as one combined string:
//   "street line, city — pincode"
// Split it back into parts so the checkout form can prefill every field.
// POS/walk-in orders store a freeform address with no city/pincode — those
// come back with street only and the customer fills the rest once.
function splitAddress(combined) {
  const raw = String(combined || '').trim()
  if (!raw) return null
  let street = raw, city = '', pincode = ''

  // Pincode: after an em/en dash, or a trailing 6-digit number
  const dashSplit = raw.split(/\s[—–-]\s/)
  if (dashSplit.length > 1) {
    const tail = dashSplit.pop().trim()
    if (/^\d{6}$/.test(tail)) { pincode = tail; street = dashSplit.join(' — ').trim() }
  }
  if (!pincode) {
    const m = street.match(/(\d{6})\s*$/)
    if (m) { pincode = m[1]; street = street.slice(0, m.index).replace(/[,\s]+$/, '').trim() }
  }

  // City: last comma-separated segment of what remains
  const parts = street.split(',').map(s => s.trim()).filter(Boolean)
  if (parts.length > 1) { city = parts.pop(); street = parts.join(', ') }

  return { address: street, city, pincode }
}

// GET /api/addresses — saved addresses for the logged-in user.
//
// If the address book is empty we fall back to the customer's order history so
// they never have to retype an address the store already has. This covers
// customers billed at the offline POS (walk-in orders carry no user_id, so we
// match on phone) and orders placed before the address book existed.
r.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, label, name, phone, address, city, pincode, notes, created_at
       FROM user_addresses WHERE user_id=$1 ORDER BY created_at DESC`,
      [req.user.id]
    )
    if (rows.length > 0) return res.json(rows)

    // ── Fallback: derive from past orders + profile ──────────────────────────
    const { rows: [me] } = await query(
      `SELECT name, phone, address FROM users WHERE id=$1`, [req.user.id]
    )
    const myDigits = String(me?.phone || '').replace(/\D/g, '').slice(-10)

    const { rows: pastOrders } = await query(
      `SELECT o.address, o.created_at
       FROM orders o
       WHERE o.address->>'address' IS NOT NULL
         AND o.address->>'address' != ''
         AND (
           o.user_id = $1
           OR ($2 != '' AND RIGHT(REGEXP_REPLACE(COALESCE(o.address->>'phone',''),'\\D','','g'),10) = $2)
         )
       ORDER BY o.created_at DESC
       LIMIT 5`,
      [req.user.id, myDigits]
    )

    const derived = []
    const seen = new Set()
    const pushDerived = (combined, name, phone) => {
      const parsed = splitAddress(combined)
      if (!parsed) return
      const key = parsed.address.toLowerCase()
      if (seen.has(key)) return
      seen.add(key)
      derived.push({
        // Synthetic id so the frontend can key/select these like real rows.
        // Not a user_addresses row — saved for real on the next order.
        id: `derived-${derived.length + 1}`,
        derived: true,
        label: 'Previous',
        name:  name  || me?.name  || '',
        phone: phone || me?.phone || '',
        ...parsed,
        notes: '',
        created_at: null,
      })
    }

    for (const o of pastOrders) {
      const a = o.address || {}
      pushDerived(a.address, a.name, a.phone)
    }
    if (me?.address) pushDerived(me.address, me.name, me.phone)

    res.json(derived)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/addresses — save a new address (skips duplicates by address+city+pincode+name)
r.post('/', verifyToken, async (req, res) => {
  try {
    const { label, name, phone, address, city, pincode, notes } = req.body
    // Check for an existing identical address first
    const existing = await query(
      `SELECT * FROM user_addresses
       WHERE user_id=$1
         AND LOWER(TRIM(address))=$2
         AND LOWER(TRIM(city))=$3
         AND LOWER(TRIM(pincode))=$4
         AND LOWER(TRIM(name))=$5
       LIMIT 1`,
      [req.user.id,
       (address||'').trim().toLowerCase(),
       (city||'').trim().toLowerCase(),
       (pincode||'').trim().toLowerCase(),
       (name||'').trim().toLowerCase()]
    )
    if (existing.rows.length > 0) {
      // Already exists — return the existing row (treat as success)
      return res.status(200).json(existing.rows[0])
    }
    const { rows } = await query(
      `INSERT INTO user_addresses (user_id, label, name, phone, address, city, pincode, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user.id, label||'Home', name||'', phone||'', address||'', city||'', pincode||'', notes||'']
    )
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/addresses/:id — update an address
r.put('/:id', verifyToken, async (req, res) => {
  try {
    const { label, name, phone, address, city, pincode, notes } = req.body
    const { rows } = await query(
      `UPDATE user_addresses SET label=$1, name=$2, phone=$3, address=$4, city=$5, pincode=$6, notes=$7
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [label||'Home', name||'', phone||'', address||'', city||'', pincode||'', notes||'', req.params.id, req.user.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Address not found' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/addresses/:id — remove a saved address
r.delete('/:id', verifyToken, async (req, res) => {
  try {
    await query('DELETE FROM user_addresses WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id])
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default r
