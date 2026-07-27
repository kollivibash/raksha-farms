import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg

const isProduction = process.env.NODE_ENV === 'production'
const dbUrl = process.env.DATABASE_URL || ''

// Managed Postgres (Neon, Render, Supabase…) requires TLS. Decide from the
// connection string rather than NODE_ENV alone, so pointing a local dev server
// at the hosted database works without extra flags.
const needsSsl = isProduction
  || /sslmode=require/i.test(dbUrl)
  || /\.neon\.tech|\.render\.com|\.supabase\.co|\.aivencloud\.com/i.test(dbUrl)

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: needsSsl ? { rejectUnauthorized: false } : false,
        max: parseInt(process.env.DB_POOL_MAX) || 20,
        idleTimeoutMillis: 30000,
        // Generous: covers a cold serverless-Postgres wake (Neon autosuspend)
        // and a scale-to-zero container starting up.
        connectionTimeoutMillis: 15000,
      }
    : {
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME     || 'raksha_farms',
        user:     process.env.DB_USER     || 'postgres',
        password: process.env.DB_PASSWORD || '',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
      }
)

pool.on('error', (err) => {
  console.error('Unexpected DB client error', err)
})

export const query = (text, params) => pool.query(text, params)
export const getClient = () => pool.connect()
export default pool
