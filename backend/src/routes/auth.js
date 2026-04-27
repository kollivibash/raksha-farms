import { Router } from 'express'
import { register, login, adminLogin, me, changePassword, googleAuth } from '../controllers/authController.js'
import { verifyToken } from '../middleware/auth.js'
const r = Router()
r.post('/register',     register)
r.post('/login',        login)           // customer + admin (role in token, client must check)
r.post('/admin-login',  adminLogin)      // admin panel only — server rejects non-admin roles
r.post('/google',       googleAuth)
r.get('/me',            verifyToken, me)
r.put('/change-password', verifyToken, changePassword)
export default r
