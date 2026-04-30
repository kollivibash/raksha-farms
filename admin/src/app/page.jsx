'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import KPICard from '../components/KPICard'
import StatusBadge from '../components/StatusBadge'
import { analyticsAPI } from '../lib/api'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { ShoppingCart, IndianRupee, Users, Clock } from 'lucide-react'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <AdminLayout title="Dashboard">
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#1B4332] border-t-transparent rounded-full animate-spin"/>
      </div>
    </AdminLayout>
  )

  const kpis = data?.kpis || {}
  const daily = data?.dailySales || []
  const top   = data?.topProducts || []

  return (
    <AdminLayout title="Dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Orders"   value={kpis.totalOrders?.toLocaleString() || '—'} icon={<ShoppingCart size={22}/>} color="blue" />
        <KPICard title="Revenue"        value={`₹${(kpis.totalRevenue||0).toLocaleString()}`} icon={<IndianRupee size={22}/>} color="green" />
        <KPICard title="Active Users"   value={kpis.activeUsers?.toLocaleString() || '—'} icon={<Users size={22}/>} color="orange" />
        <KPICard title="Pending Orders" value={kpis.pendingOrders?.toLocaleString() || '—'} icon={<Clock size={22}/>} color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Revenue — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={daily} margin={{top:5,right:20,left:10,bottom:5}}>
              <defs>
                <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B4332" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1B4332" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="label" tick={{fontSize:12}} />
              <YAxis tick={{fontSize:12}} tickFormatter={v=>`₹${v}`} width={70}/>
              <Tooltip formatter={v=>[`₹${Number(v).toLocaleString()}`,'Revenue']}/>
              <Area type="monotone" dataKey="revenue" stroke="#1B4332" strokeWidth={2} fill="url(#rv)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Orders Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={daily} margin={{top:5,right:20,left:0,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="label" tick={{fontSize:12}}/>
              <YAxis tick={{fontSize:12}} width={40}/>
              <Tooltip/>
              <Bar dataKey="orders" fill="#D97706" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">Product</th>
                <th className="text-left py-2 text-gray-500 font-medium">Category</th>
                <th className="text-right py-2 text-gray-500 font-medium">Units Sold</th>
                <th className="text-right py-2 text-gray-500 font-medium">Orders</th>
              </tr>
            </thead>
            <tbody>
              {top.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">No sales data yet</td></tr>
              )}
              {top.map((p, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="py-3 text-gray-500 capitalize">{p.category}</td>
                  <td className="py-3 text-right font-semibold">{p.units_sold}</td>
                  <td className="py-3 text-right text-gray-600">{p.order_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
