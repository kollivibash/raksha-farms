'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse,
  Users, Tag, RefreshCw, BarChart2, Settings, LogOut, Leaf, Grid3X3, X, ChevronLeft, ChevronRight
} from 'lucide-react'
import Cookies from 'js-cookie'

const nav = [
  { label:'Dashboard',     href:'/',                      icon: LayoutDashboard },
  { label:'Orders',        href:'/orders',                icon: ShoppingCart },
  { label:'Products',      href:'/products',              icon: Package },
  { label:'Categories',    href:'/categories',            icon: Grid3X3 },
  { label:'Inventory',     href:'/inventory',             icon: Warehouse },
  { label:'Customers',     href:'/customers',             icon: Users },
  { label:'Coupons',       href:'/coupons',               icon: Tag },
  { label:'Sub Overview',   href:'/subscription-plans', icon: BarChart2  },
  { label:'Subscriptions',  href:'/subscriptions',        icon: RefreshCw },
  { label:'Analytics',     href:'/analytics',             icon: BarChart2 },
  { label:'Settings',      href:'/settings',              icon: Settings },
]

export default function Sidebar({ mobileOpen = true, onClose, collapsed = false, onToggleCollapse }) {
  const path = usePathname()
  function logout() {
    Cookies.remove('admin_token')
    localStorage.removeItem('admin_token')
    window.location.href = '/login'
  }

  function handleLinkClick() {
    // Close sidebar on mobile after navigation
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 bg-[#1B4332] text-white flex flex-col z-50
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Logo + Close button */}
        <div className={`flex items-center gap-3 ${collapsed ? 'px-4' : 'px-6'} py-5 border-b border-white/10 relative`}>
          <div className="w-9 h-9 bg-[#D97706] rounded-xl flex items-center justify-center flex-shrink-0">
            <Leaf size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 transition-opacity duration-300">
              <p className="font-bold text-base leading-none">Raksha Farms</p>
              <p className="text-xs text-green-300 mt-0.5">Admin Panel</p>
            </div>
          )}
          {/* Close button — visible only on mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close menu"
          >
            <X size={18} className="text-white/80" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = path === href || (href !== '/' && path.startsWith(href))
            return (
              <Link key={href} href={href} onClick={handleLinkClick} title={collapsed ? label : undefined}
                className={`flex items-center gap-3 ${collapsed ? 'justify-center px-0' : 'px-6'} py-2.5 text-sm font-medium transition-colors mx-2 rounded-lg mb-0.5
                  ${active ? 'bg-white/15 text-white' : 'text-green-200 hover:bg-white/10 hover:text-white'}`}>
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-white/10">
          {/* Toggle collapse (desktop only) */}
          <button onClick={onToggleCollapse}
            className={`hidden md:flex items-center ${collapsed ? 'justify-center px-0' : 'px-6'} gap-3 w-full py-3 text-sm text-green-300 hover:bg-white/10 hover:text-white transition-colors border-b border-white/10`}>
            {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> <span className="truncate">Collapse Sidebar</span></>}
          </button>
          {/* Logout */}
          <div className="p-4">
            <button onClick={logout} title={collapsed ? 'Sign Out' : undefined}
              className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center px-0' : 'px-4'} py-2.5 text-sm text-red-300 hover:bg-white/10 rounded-lg transition-colors`}>
              <LogOut size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
