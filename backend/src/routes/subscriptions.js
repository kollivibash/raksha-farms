import { Router } from 'express'
import {
  getSubscriptions, getMySubscriptions,
  updateSubscription, markDelivered, skipDelivery,
  toggleMySubscription, cancelMySubscription,
} from '../controllers/subscriptionsController.js'
import { adminOnly, verifyToken } from '../middleware/auth.js'

const r = Router()

// Admin routes
r.get('/',                    ...adminOnly, getSubscriptions)
r.put('/:id',                 ...adminOnly, updateSubscription)
r.post('/:id/mark-delivered', ...adminOnly, markDelivered)
r.post('/:id/skip',           ...adminOnly, skipDelivery)

// Customer routes (logged-in)
r.get('/mine',         verifyToken, getMySubscriptions)
r.patch('/:id/toggle', verifyToken, toggleMySubscription)
r.delete('/:id',       verifyToken, cancelMySubscription)

export default r
