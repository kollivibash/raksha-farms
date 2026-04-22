import { query } from './database.js'

// Called automatically on server startup — safe to run multiple times (IF NOT EXISTS)
export async function initDb() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(150) UNIQUE NOT NULL,
        phone       VARCHAR(15),
        password    VARCHAR(255) NOT NULL,
        role        VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user','admin')),
        address     TEXT,
        is_active   BOOLEAN DEFAULT true,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(200) NOT NULL,
        category    VARCHAR(50) NOT NULL,
        description TEXT,
        price       DECIMAL(10,2) NOT NULL,
        stock       INTEGER DEFAULT 0,
        unit        VARCHAR(20),
        image_url   VARCHAR(500),
        variants    JSONB DEFAULT '[]',
        is_active   BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
        items           JSONB NOT NULL,
        subtotal        DECIMAL(10,2) NOT NULL,
        delivery_fee    DECIMAL(10,2) DEFAULT 0,
        discount        DECIMAL(10,2) DEFAULT 0,
        total           DECIMAL(10,2) NOT NULL,
        status          VARCHAR(30) DEFAULT 'placed',
        payment_method  VARCHAR(20) DEFAULT 'cod',
        payment_status  VARCHAR(20) DEFAULT 'pending',
        address         JSONB,
        coupon_code     VARCHAR(20),
        notes           TEXT,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code            VARCHAR(20) UNIQUE NOT NULL,
        type            VARCHAR(10) DEFAULT 'percent' CHECK (type IN ('percent','flat')),
        value           DECIMAL(10,2) NOT NULL,
        min_order       DECIMAL(10,2) DEFAULT 0,
        max_uses        INTEGER DEFAULT 100,
        used_count      INTEGER DEFAULT 0,
        expires_at      TIMESTAMPTZ,
        is_active       BOOLEAN DEFAULT true,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
        quantity        INTEGER DEFAULT 1,
        frequency       VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN ('daily','weekly','monthly')),
        next_delivery   DATE,
        is_active       BOOLEAN DEFAULT true,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
        change      INTEGER NOT NULL,
        reason      VARCHAR(100),
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // Create default admin user (safe — ON CONFLICT does nothing)
    await query(`
      INSERT INTO users (name, email, phone, password, role)
      VALUES ('Admin', 'admin@rakshafarms.in', '9346566945',
              '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
      ON CONFLICT (email) DO NOTHING
    `)

    console.log('✅ DB tables verified')
  } catch (err) {
    console.error('⚠ DB init error:', err.message)
  }
}
