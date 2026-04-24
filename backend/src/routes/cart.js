import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'
import { query } from '../config/database.js'
const r = Router()

// GET /api/cart — load cart for logged-in user
r.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT items FROM carts WHERE user_id=$1', [req.user.id]
    )
    res.json(rows[0]?.items || [])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/cart — save entire cart for logged-in user
r.put('/', verifyToken, async (req, res) => {
  try {
    const { items } = req.body
    await query(
      `INSERT INTO carts (user_id, items, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET items=$2, updated_at=NOW()`,
      [req.user.id, JSON.stringify(items || [])]
    )
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/cart — clear cart after order placed
r.delete('/', verifyToken, async (req, res) => {
  try {
    await query('UPDATE carts SET items=\'[]\', updated_at=NOW() WHERE user_id=$1', [req.user.id])
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default r
