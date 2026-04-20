import { Router } from 'express'
import { login, me, changePassword } from '../controllers/authController.js'
import { verifyToken, isAdmin } from '../middleware/auth.js'
const r = Router()
r.post('/login', login)
r.get('/me', verifyToken, isAdmin, me)
r.put('/change-password', verifyToken, isAdmin, changePassword)
export default r
