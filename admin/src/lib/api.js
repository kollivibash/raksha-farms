import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 15000,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('admin_token') ||
    (typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('admin_token')
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
}

// ── Products ──────────────────────────────────────────
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (formData) => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, stock, reason) => api.patch(`/products/${id}/stock`, { stock, reason }),
  getLowStock: (threshold) => api.get('/products/low-stock', { params: { threshold } }),
}

// ── Orders ────────────────────────────────────────────
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status, extras = {}) => api.patch(`/orders/${id}/status`, { status, ...extras }),
  getStats: () => api.get('/orders/stats'),
}

// ── Analytics ─────────────────────────────────────────
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics'),
  getSales: (period) => api.get('/analytics/sales', { params: { period } }),
  getCategories: () => api.get('/analytics/categories'),
}

// ── Customers ─────────────────────────────────────────
export const customersAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getOrders: (id) => api.get(`/customers/${id}/orders`),
  toggle: (id) => api.patch(`/customers/${id}/toggle`),
}

// ── Coupons ───────────────────────────────────────────
export const couponsAPI = {
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
}

// ── Subscriptions (Customer) ──────────────────────────
export const subscriptionsAPI = {
  getAll:         ()         => api.get('/subscriptions'),
  update:         (id, data) => api.put(`/subscriptions/${id}`, data),
  markDelivered:  (id)       => api.post(`/subscriptions/${id}/mark-delivered`),
  skipDelivery:   (id)       => api.post(`/subscriptions/${id}/skip`),
}

// ── Subscription Plans (Admin) ─────────────────────────
export const subscriptionPlansAPI = {
  getAll: () => api.get('/subscription-plans/admin/all'),
  create: (data) => api.post('/subscription-plans', data),
  update: (id, data) => api.put(`/subscription-plans/${id}`, data),
  delete: (id) => api.delete(`/subscription-plans/${id}`),
}

// ── Categories ────────────────────────────────────────
export const categoriesAPI = {
  getAll: () => api.get('/categories/all'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

export default api
