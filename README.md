# 🌿 Raksha Farms — Fresh from Farm to Your Doorstep

A modern, production-ready grocery ordering website for **Raksha Farms**.

---

## 🚀 Quick Start

### Frontend (runs standalone, no backend needed)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend (optional, requires MongoDB)

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm install
npm run dev
# → http://localhost:5000
```

---

## 🗂️ Project Structure

```
raksha-farms/
├── frontend/                  # React + Vite + Tailwind
│   └── src/
│       ├── context/           # Cart, Products, Orders, Toast state
│       ├── pages/             # HomePage, CartPage, Checkout, Confirmation, Admin
│       ├── components/        # Navbar, ProductCard, HeroSection, Toast, Footer
│       ├── data/products.js   # 20+ seed products (3 categories)
│       └── utils/whatsapp.js  # WhatsApp message generator
│
└── backend/                   # Node.js + Express + MongoDB
    ├── models/                # Product.js, Order.js (Mongoose schemas)
    ├── routes/                # products.js, orders.js, auth.js
    ├── middleware/auth.js     # JWT admin auth
    └── server.js              # Express app entry
```

---

## 👥 User Flows

### Customer
1. **Browse** → Homepage with hero, search, category filter, 20+ products
2. **Cart** → Add items, adjust quantities, see running total
3. **Checkout** → 3-step: (1) Fill name/phone/address → (2) Choose UPI or COD → (3) Review & confirm
4. **WhatsApp** → Order auto-sent to owner's WhatsApp on confirmation
5. **Track** → Order confirmation page shows live status

### Admin (`/admin`, password: `raksha123`)
- **Orders tab** → View all orders, filter by status, accept/reject, set delivery time, mark delivered
- **Products tab** → Add/edit/delete products, update stock/price, mark as featured

---

## 📲 WhatsApp Integration

When a customer places an order, a pre-filled WhatsApp message is generated and opened automatically:

```
🌿 New Order — Raksha Farms

📦 Order ID: #RF123456
👤 Customer: Priya Sharma
📞 Phone: 9876543210
📍 Address: 123 MG Road, Pune - 411001

🛒 Items Ordered:
  • 🍅 Fresh Tomatoes — 2 kg × ₹40 = ₹80
  • 🥦 Broccoli — 1 kg × ₹80 = ₹80

💰 Total Amount: ₹190
💳 Payment: 💵 Cash on Delivery

Please confirm the order and share delivery time 🙏
```

**To set owner's number:** Edit `frontend/src/utils/whatsapp.js` → update `OWNER_PHONE`.

---

## ⚙️ Configuration

### Change Owner WhatsApp Number
```js
// frontend/src/utils/whatsapp.js
export const OWNER_PHONE = '919876543210' // country code + number
export const OWNER_UPI_ID = 'rakshafarms@upi'
```

### Change Admin Password
```js
// frontend/src/pages/AdminPage.jsx  (line 4)
const ADMIN_PASSWORD = 'raksha123'
```

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Routing | React Router v6 |
| State | Context API + localStorage |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (admin) |
| Styling | Tailwind CSS + custom animations |
| WhatsApp | wa.me click-to-chat API |
| Fonts | Poppins (Google Fonts) |

---

## 🌐 Deployment

### Frontend → Vercel (recommended)
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel, Netlify, or GitHub Pages
```

### Backend → Railway / Render
1. Create a MongoDB Atlas cluster
2. Set environment variables from `.env.example`
3. Push `backend/` folder to Railway or Render

### Full Stack on Vercel
```json
// vercel.json in root
{
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } },
    { "src": "backend/server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "backend/server.js" },
    { "src": "/(.*)", "dest": "frontend/dist/$1" }
  ]
}
```

---

## 📦 Order Status Flow

```
placed → pending → accepted → out_for_delivery → delivered
                 ↘ rejected
```

---

## 🔑 Data Persistence

The frontend uses **localStorage** for all data (products, cart, orders) — no backend required to run!
The backend adds MongoDB persistence for production use.

---

## 🎯 Features Summary

- ✅ 20+ products across Vegetables, Fruits, Groceries
- ✅ Real-time stock tracking (auto decreases on order)
- ✅ "Out of Stock" / "Low Stock" indicators
- ✅ 3-step checkout with validation
- ✅ UPI payment (QR + UPI ID copy) + COD
- ✅ WhatsApp order notification to owner
- ✅ Admin panel: manage products & orders
- ✅ Order status pipeline
- ✅ Mobile-first responsive design
- ✅ Toast notifications
- ✅ Search + sort + category filtering
- ✅ Smooth animations & transitions
- ✅ Zero external UI library dependencies
