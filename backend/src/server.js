import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

import { initDb } from './config/initDb.js'
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
  origin: (origin, callback) => {
    const allowed = [
      process.env.ADMIN_URL  || 'http://localhost:3001',
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173',
    ].filter(Boolean)
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin || allowed.includes(origin)) return callback(null, true)
    // Allow any Netlify, Vercel, or Render subdomain
    if (/\.(netlify\.app|vercel\.app|onrender\.com)$/.test(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15*60*1000, max: 20, message: 'Too many requests' }))
app.use('/api', rateLimit({ windowMs: 60*1000, max: 200 }))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve uploaded images (from Render disk at /uploads, or local uploads/ folder)
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
app.use('/uploads', express.static(UPLOAD_DIR))

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

// Auto-create DB tables on startup (safe — uses IF NOT EXISTS)
initDb().then(() => {
  app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`))
})
export default app
