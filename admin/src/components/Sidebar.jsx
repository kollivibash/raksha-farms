'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse,
  Users, Tag, RefreshCw, BarChart2, Settings, LogOut, Leaf
} from 'lucide-react'
import Cookies from 'js-cookie'

const nav = [
  { label:'Dashboard',     href:'/',               icon: LayoutDashboard },
  { label:'Orders',        href:'/orders',         icon: ShoppingCart },
  { label:'Products',      href:'/products',       icon: Package },
  { label:'Inventory',     href:'/inventory',      icon: Warehouse },
  { label:'Customers',     href:'/customers',      icon: Users },
  { label:'Coupons',       href:'/coupons',        icon: Tag },
  { label:'Subscriptions', href:'/subscriptions',  icon: RefreshCw },
  { label:'Analytics',     href:'/analytics',      icon: BarChart2 },
  { label:'Settings',      href:'/settings',       icon: Settings },
]

export default function Sidebar() {
  const path = usePathname()
  function logout() {
    Cookies.remove('admin_token')
    localStorage.removeItem('admin_token')
    window.location.href = '/login'
  }
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#1B4332] text-white flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-[#D97706] rounded-xl flex items-center justify-center">
          <Leaf size={18} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-base leading-none">Raksha Farms</p>
          <p className="text-xs text-green-300 mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors mx-2 rounded-lg mb-0.5
                ${active ? 'bg-white/15 text-white' : 'text-green-200 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-300 hover:bg-white/10 rounded-lg transition-colors">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
