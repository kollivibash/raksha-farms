import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { CartProvider } from './context/CartContext'
import { ProductsProvider } from './context/ProductsContext'
import { OrdersProvider } from './context/OrdersContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ToastContainer from './components/Toast'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import MyOrdersPage from './pages/MyOrdersPage'

// Redirect unauthenticated users to /login, preserving intended destination
function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth()
  const location = useLocation()
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}

export default function App() {
  return (
    <ToastProvider>
      <ProductsProvider>
        <OrdersProvider>
          <CartProvider>
            <AuthProvider>
              <Router>
                <div className="min-h-screen bg-farm-50 font-poppins flex flex-col">
                  <Navbar />
                  <ToastContainer />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={
                        <RequireAuth><CheckoutPage /></RequireAuth>
                      } />
                      <Route path="/confirmation/:orderId" element={<OrderConfirmationPage />} />
                      <Route path="/my-orders" element={
                        <RequireAuth><MyOrdersPage /></RequireAuth>
                      } />
                      <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </Router>
            </AuthProvider>
          </CartProvider>
        </OrdersProvider>
      </ProductsProvider>
    </ToastProvider>
  )
}
