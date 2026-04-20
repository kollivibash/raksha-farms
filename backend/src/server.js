import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

import authRoutes          from './routes/auth.js'
import productsRoutes      from './routes/products.js'
import ordersRoutes        from './routes/orders.js'
import analyticsRoutes     from './routes/analytics.js'
import customersRoutes     from './routes/customers.js'
import couponsRoutes       from './routes/coupons.js'
import subscriptionsRoutes from './routes/subscriptions.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 4000

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({
  origin: [
    process.env.ADMIN_URL  || 'http://localhost:3001',
    process.env.CLIENT_URL || 'http://localhost:5173',
  ],
  credentials: true,
}))

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15*60*1000, max: 20, message: 'Too many requests' }))
app.use('/api', rateLimit({ windowMs: 60*1000, max: 200 }))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth',          authRoutes)
app.use('/api/products',      productsRoutes)
app.use('/api/orders',        ordersRoutes)
app.use('/api/analytics',     analyticsRoutes)
app.use('/api/customers',     customersRoutes)
app.use('/api/coupons',       couponsRoutes)
app.use('/api/subscriptions', subscriptionsRoutes)

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`))
export default app
