import { Router } from 'express'
import { getDashboardStats, getSalesAnalytics, getCategoryRevenue } from '../controllers/analyticsController.js'
import { adminOnly } from '../middleware/auth.js'
const r = Router()
r.get('/', ...adminOnly, getDashboardStats)
r.get('/sales', ...adminOnly, getSalesAnalytics)
r.get('/categories', ...adminOnly, getCategoryRevenue)
export default r
