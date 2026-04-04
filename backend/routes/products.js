const express = require('express')
const Product = require('../models/Product')
const { adminAuth } = require('../middleware/auth')

const router = express.Router()

// GET /api/products — public, list all active products
router.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query
    const filter = { active: true }

    if (category && category !== 'all') filter.category = category
    if (featured === 'true') filter.featured = true
    if (search) filter.name = { $regex: search, $options: 'i' }

    const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 })
    res.json({ success: true, data: products, count: products.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/products/:id — public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, data: product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/products — admin only
router.post('/', adminAuth, async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json({ success: true, data: product })
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map((e) => e.message).join(', ')
      return res.status(400).json({ success: false, message: msg })
    }
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/products/:id — admin only
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, data: product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/products/:id — admin only (soft delete)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    )
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, message: 'Product deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/products/:id/stock — admin only
router.patch('/:id/stock', adminAuth, async (req, res) => {
  try {
    const { stock } = req.body
    if (stock === undefined || isNaN(stock)) {
      return res.status(400).json({ success: false, message: 'Stock value required' })
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: Math.max(0, stock) },
      { new: true }
    )
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, data: product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
