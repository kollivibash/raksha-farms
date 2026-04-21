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
    const { name, category, description, price, stock, unit, variants, is_featured } = req.body
    const image_url = req.file ? req.file.path : null   // Cloudinary returns full URL in req.file.path
    const { rows } = await query(
      `INSERT INTO products (name, category, description, price, stock, unit, image_url, variants, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, category, description, price, stock, unit, image_url,
       JSON.stringify(variants || []), is_featured || false]
    )
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function updateProduct(req, res) {
  try {
    const { name, category, description, price, stock, unit, variants, is_active, is_featured } = req.body
    const image_url = req.file ? req.file.path : undefined  // Cloudinary returns full URL in req.file.path
    const fields = ['name','category','description','price','stock','unit','variants','is_active','is_featured']
    const values = [name, category, description, price, stock, unit,
                    JSON.stringify(variants || []), is_active, is_featured]
    if (image_url) { fields.push('image_url'); values.push(image_url) }
    fields.push('updated_at'); values.push('NOW()')
    const setClause = fields.map((f,i) => f==='updated_at' ? `${f}=NOW()` : `${f}=$${i+1}`).filter(s=>!s.includes('NOW()')).join(',') + ',updated_at=NOW()'
    const { rows } = await query(
      `UPDATE products SET ${setClause} WHERE id=$${values.filter((_,i)=>fields[i]!=='updated_at').length+1} RETURNING *`,
      [...values.filter((_,i)=>fields[i]!=='updated_at'), req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' })
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
