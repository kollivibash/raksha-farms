import { query } from '../config/database.js'

export async function getProducts(req, res) {
  try {
    const { category, search, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    let sql = 'SELECT * FROM products WHERE 1=1'
    const params = []
    if (category) { params.push(category); sql += ` AND category = $${params.length}` }
    if (search)   { params.push(`%${search}%`); sql += ` AND name ILIKE $${params.length}` }
    sql += ` ORDER BY created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`
    params.push(limit, offset)
    const { rows } = await query(sql, params)
    const count = await query('SELECT COUNT(*) FROM products WHERE 1=1' +
      (category ? ' AND category=$1' : '') + (search ? ` AND name ILIKE $${category?2:1}` : ''),
      [category, search].filter(Boolean).map((v,i) => i===1&&search ? `%${v}%` : v)
    )
    res.json({ products: rows, total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit) })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function getProduct(req, res) {
  try {
    const { rows } = await query('SELECT * FROM products WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function createProduct(req, res) {
  try {
    const { name, category, description, price, offer_price, stock, unit, variants, is_featured } = req.body
    const image_url = req.file ? `/uploads/${req.file.filename}` : null
    const offerVal = offer_price && Number(offer_price) > 0 ? Number(offer_price) : null
    const { rows } = await query(
      `INSERT INTO products (name, category, description, price, offer_price, stock, unit, image_url, variants, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, category, description, price, offerVal, stock, unit, image_url,
       JSON.stringify(variants || []), is_featured || false]
    )
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function updateProduct(req, res) {
  try {
    const { name, category, description, price, offer_price, stock, unit, is_active, is_featured } = req.body
    const image_url   = req.file ? `/uploads/${req.file.filename}` : undefined
    const offerVal    = offer_price && Number(offer_price) > 0 ? Number(offer_price) : null
    const activeVal   = is_active === true || is_active === 'true'
    const featuredVal = is_featured === true || is_featured === 'true'

    // Check if product exists first
    const { rows: existing } = await query('SELECT id FROM products WHERE id=$1', [req.params.id])
    if (!existing[0]) return res.status(404).json({ error: 'Product not found' })

    // Build SET clause only for defined fields
    const sets = [
      `name=$1`, `category=$2`, `description=$3`, `price=$4`,
      `stock=$5`, `unit=$6`, `is_active=$7`, `is_featured=$8`,
      `offer_price=$9`, `updated_at=NOW()`
    ]
    const vals = [name, category, description, price, stock, unit, activeVal, featuredVal, offerVal]

    if (image_url) { sets.push(`image_url=$${vals.length + 1}`); vals.push(image_url) }

    const { rows } = await query(
      `UPDATE products SET ${sets.join(',')} WHERE id=$${vals.length + 1} RETURNING *`,
      [...vals, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function deleteProduct(req, res) {
  try {
    const { rows } = await query('DELETE FROM products WHERE id=$1 RETURNING id', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' })
    res.json({ message: 'Product deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function updateStock(req, res) {
  try {
    const { stock, reason } = req.body
    const { rows: prod } = await query('SELECT stock FROM products WHERE id=$1', [req.params.id])
    if (!prod[0]) return res.status(404).json({ error: 'Product not found' })
    const change = stock - prod[0].stock
    await query('UPDATE products SET stock=$1, updated_at=NOW() WHERE id=$2', [stock, req.params.id])
    await query('INSERT INTO inventory_logs (product_id, change, reason) VALUES ($1,$2,$3)',
      [req.params.id, change, reason || 'Manual update'])
    res.json({ message: 'Stock updated', stock })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function getLowStock(req, res) {
  try {
    const threshold = req.query.threshold || 10
    const { rows } = await query(
      'SELECT id, name, category, stock, unit FROM products WHERE stock <= $1 AND is_active=true ORDER BY stock ASC',
      [threshold]
    )
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}
