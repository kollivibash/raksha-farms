import { Router } from 'express'
import { register, login, me, changePassword } from '../controllers/authController.js'
import { verifyToken } from '../middleware/auth.js'
const r = Router()
r.post('/register', register)
r.post('/login', login)
r.get('/me', verifyToken, me)
r.put('/change-password', verifyToken, changePassword)
export default r
