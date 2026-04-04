import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const announcements = [
  '🌱 100% Organic & Pesticide Free',
  '⚡ Same-day delivery available in Hyderabad',
  '🌿 Fresh from farm — harvested daily',
  '💰 No middlemen — honest farm prices',
  '📞 Call us: +91 9346566945',
  '🥦 Fresh vegetables & fruits delivered daily',
]

export default function Navbar() {
  const { totalItems } = useCart()
  const { user, logout, isLoggedIn } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setUserMenuOpen(false)
  }, [location])

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const marqueeItems = [...announcements, ...announcements]

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="bg-green-700 text-white text-xs overflow-hidden">
        <div className="py-2 relative">
          <div className="marquee-track whitespace-nowrap">
            {marqueeItems.map((msg, i) => (
              <span key={i} className="inline-flex items-center mr-12 font-medium">
                {msg}
                {i !== marqueeItems.length - 1 && (
                  <span className="mx-6 text-green-400">•</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className={`transition-all duration-300 ${
        scrolled ? 'bg-white/97 backdrop-blur-md shadow-soft' : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-lg">🌿</span>
              </div>
              <div>
                <span className="text-lg font-black text-green-700 tracking-tight leading-none">Raksha Farms</span>
                <p className="text-[10px] text-green-500 font-medium hidden sm:block">Farm to Doorstep</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink to="/" active={location.pathname === '/'}>Shop</NavLink>
              <a href="/#categories" className="text-sm font-semibold text-gray-600 hover:text-green-600 transition-colors duration-200">Categories</a>
              <NavLink to="/cart" active={location.pathname === '/cart'}>Cart</NavLink>
              {isLoggedIn && (
                <NavLink to="/my-orders" active={location.pathname === '/my-orders'}>My Orders</NavLink>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Phone (desktop) */}
              <a
                href="tel:+919346566945"
                className="hidden lg:flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition-colors font-medium"
              >
                <span>📞</span>
                <span>+91 9346566945</span>
              </a>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <span className="text-base">🛒</span>
                <span className="hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-fade-in">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              {/* User menu / Login */}
              {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-green-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                      {user?.avatar
                        ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        : user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[80px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden animate-slide-up z-50">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="font-semibold text-gray-800 text-sm truncate">{user?.name}</p>
                        <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                      </div>
                      {/* Links */}
                      <div className="py-1">
                        <DropdownItem to="/my-orders" icon="📦">My Orders</DropdownItem>
                        <DropdownItem to="/cart" icon="🛒">My Cart</DropdownItem>
                      </div>
                      {/* Logout */}
                      <div className="border-t border-gray-50 py-1">
                        <button
                          onClick={() => { logout(); navigate('/') }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium transition-colors flex items-center gap-2"
                        >
                          🚪 Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-1.5 text-sm font-bold text-green-600 hover:text-green-700 border border-green-200 hover:border-green-400 px-4 py-2 rounded-xl transition-all"
                >
                  🔑 Sign In
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-xl hover:bg-green-50 text-gray-600 transition-colors"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-green-100 px-4 py-3 space-y-1 animate-slide-up shadow-soft">
            {isLoggedIn && (
              <div className="flex items-center gap-3 px-3 py-2.5 mb-1 bg-green-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                  {user?.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    : user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
            )}
            <MobileNavLink to="/">🏪 Shop</MobileNavLink>
            <MobileNavLink to="/cart">🛒 Cart {totalItems > 0 && `(${totalItems})`}</MobileNavLink>
            {isLoggedIn ? (
              <>
                <MobileNavLink to="/my-orders">📦 My Orders</MobileNavLink>
                <button
                  onClick={() => { logout(); navigate('/') }}
                  className="block w-full text-left px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 font-medium text-sm transition-colors"
                >
                  🚪 Sign Out
                </button>
              </>
            ) : (
              <MobileNavLink to="/login">🔑 Sign In / Sign Up</MobileNavLink>
            )}
            <div className="pt-2 border-t border-gray-100 mt-2">
              <a href="tel:+919346566945" className="block px-3 py-2.5 text-sm text-gray-500 font-medium">
                📞 +91 9346566945
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`text-sm font-semibold transition-colors duration-200 ${
        active ? 'text-green-600 border-b-2 border-green-500 pb-0.5' : 'text-gray-600 hover:text-green-600'
      }`}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="block px-3 py-2.5 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium text-sm transition-colors"
    >
      {children}
    </Link>
  )
}

function DropdownItem({ to, icon, children }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium transition-colors"
    >
      <span>{icon}</span>
      {children}
    </Link>
  )
}
