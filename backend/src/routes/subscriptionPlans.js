import { Router } from 'express'
import { getPlans, getPlansAdmin, createPlan, updatePlan, deletePlan } from '../controllers/subscriptionPlansController.js'
import { adminOnly } from '../middleware/auth.js'

const r = Router()

// Public routes
r.get('/', getPlans)

// Admin routes
r.get('/admin/all', ...adminOnly, getPlansAdmin)
r.post('/', ...adminOnly, createPlan)
r.put('/:id', ...adminOnly, updatePlan)
r.delete('/:id', ...adminOnly, deletePlan)

export default r
