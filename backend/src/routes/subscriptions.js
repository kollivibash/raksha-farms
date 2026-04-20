import { Router } from 'express'
import { getSubscriptions, updateSubscription } from '../controllers/subscriptionsController.js'
import { adminOnly } from '../middleware/auth.js'
const r = Router()
r.get('/', ...adminOnly, getSubscriptions)
r.put('/:id', ...adminOnly, updateSubscription)
export default r
