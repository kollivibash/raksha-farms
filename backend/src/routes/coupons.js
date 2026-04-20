import { Router } from 'express'
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/couponsController.js'
import { adminOnly } from '../middleware/auth.js'
const r = Router()
r.get('/', ...adminOnly, getCoupons)
r.post('/', ...adminOnly, createCoupon)
r.post('/validate', validateCoupon)
r.put('/:id', ...adminOnly, updateCoupon)
r.delete('/:id', ...adminOnly, deleteCoupon)
export default r
