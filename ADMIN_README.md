# Raksha Farms — Full Stack System

## Folder Structure
```
raksha-farms/
├── frontend/          # Customer-facing React app (Vite) — port 5173
├── backend/           # Node.js + Express API              — port 4000
└── admin/             # Next.js admin dashboard            — port 3001
```

## Setup

### 1. Database (PostgreSQL)
```bash
createdb raksha_farms
cd backend && npm install
cp .env.example .env   # Fill in DB credentials
node src/config/migrate.js
```

### 2. Backend
```bash
cd backend && npm run dev
# Runs on http://localhost:4000
```

### 3. Admin Dashboard
```bash
cd admin && npm install && npm run dev
# Runs on http://localhost:3001
# Login: admin@rakshafarms.in / password
```

### 4. Frontend
```bash
cd frontend && npm run dev
# Runs on http://localhost:5173
```

## API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/login | Admin login |
| GET | /api/analytics | Dashboard KPIs + charts |
| GET | /api/orders | All orders (paginated) |
| PATCH | /api/orders/:id/status | Update order status |
| GET | /api/products | Product list |
| POST | /api/products | Create product (with image) |
| PUT | /api/products/:id | Update product |
| GET | /api/customers | Customer list |
| GET | /api/coupons | All coupons |
| POST | /api/coupons | Create coupon |
| GET | /api/subscriptions | All subscriptions |
