const express = require('express')
const Order = require('../models/Order')
const Product = require('../models/Product')
const { adminAuth } = require('../middleware/auth')

const router = express.Router()

// POST /api/orders — public, place an order
router.post('/', async (req, res) => {
  try {
    const { orderId, customer, items, subtotal, deliveryFee, total, paymentMethod } = req.body

    if (!customer?.name || !customer?.phone || !customer?.address) {
      return res.status(400).json({ success: false, message: 'Customer details required' })
    }
    if (!items?.length) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' })
    }

    // Decrease stock for each item
    for (const item of items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        })
      }
    }

    const order = await Order.create({
      orderId,
      customer,
      items,
      subtotal,
      deliveryFee: deliveryFee || 0,
      total,
      paymentMethod: paymentMethod || 'cod',
      status: 'pending',
      statusHistory: [{ status: 'pending' }],
    })

    res.status(201).json({ success: true, data: order })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Order ID already exists' })
    }
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/orders/:orderId — public, track order status
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    res.json({ success: true, data: order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/orders — admin only, list all orders
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query
    const filter = {}
    if (status && status !== 'all') filter.status = status

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(+limit)
      .skip((+page - 1) * +limit)

    const total = await Order.countDocuments(filter)
    res.json({ success: true, data: orders, total, page: +page })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/orders/:orderId/status — admin only
router.patch('/:orderId/status', adminAuth, async (req, res) => {
  try {
    const { status, deliveryTime, note } = req.body
    const validStatuses = ['pending', 'accepted', 'rejected', 'out_for_delivery', 'delivered']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' })
    }

    const order = await Order.findOne({ orderId: req.params.orderId })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    order.status = status
    if (deliveryTime) order.deliveryTime = deliveryTime
    order.statusHistory.push({ status, note: note || '' })
    await order.save()

    res.json({ success: true, data: order, message: `Order status updated to ${status}` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
