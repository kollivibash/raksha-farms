const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const router = express.Router()

// In production, store admin credentials securely in DB / env
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  // Store hashed password — default: "raksha123"
  passwordHash: process.env.ADMIN_PASSWORD_HASH || '$2a$10$XFE/N2GpVBa4z1A5YmV0BOkdMD/YBvAu.V5e.i9WuIVKLrUQ5Ld3m',
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' })
    }

    if (username !== ADMIN_CREDENTIALS.username) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash)
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { username, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({ success: true, token, message: 'Login successful' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
