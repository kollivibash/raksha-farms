import { Router } from 'express'
import { getOrders, getOrder, createOrder, updateOrderStatus, getOrderStats } from '../controllers/ordersController.js'
import { adminOnly, verifyToken } from '../middleware/auth.js'
const r = Router()
r.post('/', (req, res, next) => {
  // Optional auth — logged-in users get their user_id attached, guests pass through
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    return verifyToken(req, res, next)
  }
  next()
}, createOrder)
r.get('/', ...adminOnly, getOrders)
r.get('/stats', ...adminOnly, getOrderStats)
r.get('/:id', ...adminOnly, getOrder)
r.patch('/:id/status', ...adminOnly, updateOrderStatus)
export default r
