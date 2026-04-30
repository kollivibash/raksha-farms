import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'
import { query } from '../config/database.js'
const r = Router()

// GET /api/wishlist
r.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await query('SELECT items FROM wishlists WHERE user_id=$1', [req.user.id])
    res.json(rows[0]?.items || [])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/wishlist — save full wishlist
r.put('/', verifyToken, async (req, res) => {
  try {
    const { items } = req.body
    await query(
      `INSERT INTO wishlists (user_id, items, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET items=$2, updated_at=NOW()`,
      [req.user.id, JSON.stringify(items || [])]
    )
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/wishlist — clear wishlist
r.delete('/', verifyToken, async (req, res) => {
  try {
    await query("UPDATE wishlists SET items='[]', updated_at=NOW() WHERE user_id=$1", [req.user.id])
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default r
