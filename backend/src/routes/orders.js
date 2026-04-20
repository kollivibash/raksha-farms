import { Router } from 'express'
import { getOrders, getOrder, updateOrderStatus, getOrderStats } from '../controllers/ordersController.js'
import { adminOnly } from '../middleware/auth.js'
const r = Router()
r.get('/', ...adminOnly, getOrders)
r.get('/stats', ...adminOnly, getOrderStats)
r.get('/:id', ...adminOnly, getOrder)
r.patch('/:id/status', ...adminOnly, updateOrderStatus)
export default r
