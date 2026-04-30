import { Router } from 'express'
import { getDeliverySettings, updateDeliverySettings } from '../controllers/settingsController.js'
import { adminOnly } from '../middleware/auth.js'
const r = Router()
r.get('/delivery', ...adminOnly, getDeliverySettings)
r.put('/delivery', ...adminOnly, updateDeliverySettings)
export default r
