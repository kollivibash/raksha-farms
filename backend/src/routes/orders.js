import { Router } from 'express'
import { getOrders, getOrder, createOrder, updateOrderStatus, getOrderStats, trackOrder, trackOrderByRef } from '../controllers/ordersController.js'
import { adminSecret, verifyToken } from '../middleware/auth.js'

// Optional auth middleware — attaches user if token present, otherwise continues
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    return verifyToken(req, res, next)
  }
  next()
}

const r = Router()
r.post('/', optionalAuth, createOrder)
r.get('/', adminSecret, getOrders)
r.get('/stats', adminSecret, getOrderStats)
r.get('/track/:id', optionalAuth, trackOrder)         // Poll by DB UUID
r.get('/track-ref/:ref', trackOrderByRef)             // Poll by RF-... reference ID (no auth)
r.get('/:id', adminSecret, getOrder)
r.patch('/:id/status', adminSecret, updateOrderStatus)
export default r
