'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import KPICard from '../components/KPICard'
import StatusBadge from '../components/StatusBadge'
import { analyticsAPI } from '../lib/api'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { ShoppingCart, IndianRupee, Users, Clock } from 'lucide-react'

// Y-axis domain with 25% headroom above the tallest bar
const yDomain = (dataKey) => [0, (data) => {
  const max = Math.max(...data.map(d => Number(d[dataKey]) || 0), 1)
  return Math.ceil(max * 1.25)
}]

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-[#1B4332] font-bold">₹{Number(payload[0]?.value || 0).toLocaleString()}</p>
    </div>
  )
}

const OrderTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-[#D97706] font-bold">{payload[0]?.value} orders</p>
    </div>
  )
}

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
  // Only show days that have at least some activity (removes dead zero-days on left)
  const allDaily = data?.dailySales || []
  const firstActive = allDaily.findIndex(d => Number(d.revenue) > 0 || Number(d.orders) > 0)
  const daily = firstActive >= 0 ? allDaily.slice(firstActive) : allDaily
  const top   = data?.topProducts || []

  const maxRevenue = Math.max(...daily.map(d => Number(d.revenue) || 0), 1)
  const maxOrders  = Math.max(...daily.map(d => Number(d.orders)  || 0), 1)

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
        {/* Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Revenue — Last 7 Days</h2>
            <span className="text-xs font-bold text-[#1B4332] bg-green-50 px-2.5 py-1 rounded-full">
              ₹{daily.reduce((a,b) => a + Number(b.revenue||0), 0).toLocaleString()} total
            </span>
          </div>
          {daily.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={daily} margin={{top:30, right:20, left:8, bottom:5}} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false}/>
                <XAxis dataKey="label" tick={{fontSize:11, fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                <YAxis
                  tick={{fontSize:11, fill:'#9ca3af'}}
                  tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
                  width={52}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, Math.ceil(maxRevenue * 1.3)]}
                  tickCount={5}
                />
                <Tooltip content={<RevenueTooltip/>} cursor={{fill:'#f0fdf4'}}/>
                <Bar dataKey="revenue" radius={[6,6,0,0]} maxBarSize={48} isAnimationActive={false}>
                  {daily.map((d, i) => (
                    <Cell key={i} fill={Number(d.revenue) === maxRevenue ? '#1B4332' : '#3f9a67'}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Orders Trend</h2>
            <span className="text-xs font-bold text-[#D97706] bg-amber-50 px-2.5 py-1 rounded-full">
              {daily.reduce((a,b) => a + Number(b.orders||0), 0)} orders
            </span>
          </div>
          {daily.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={daily} margin={{top:30, right:20, left:0, bottom:5}} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false}/>
                <XAxis dataKey="label" tick={{fontSize:11, fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                <YAxis
                  tick={{fontSize:11, fill:'#9ca3af'}}
                  width={36}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  domain={[0, Math.ceil(maxOrders * 1.3)]}
                  tickCount={5}
                />
                <Tooltip content={<OrderTooltip/>} cursor={{fill:'#fffbeb'}}/>
                <Bar dataKey="orders" radius={[6,6,0,0]} maxBarSize={48} isAnimationActive={false}>
                  {daily.map((d, i) => (
                    <Cell key={i} fill={Number(d.orders) === maxOrders ? '#D97706' : '#f5c842'}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">#</th>
                <th className="text-left py-2 text-gray-500 font-medium">Product</th>
                <th className="text-left py-2 text-gray-500 font-medium">Category</th>
                <th className="text-right py-2 text-gray-500 font-medium">Units Sold</th>
                <th className="text-right py-2 text-gray-500 font-medium">Orders</th>
              </tr>
            </thead>
            <tbody>
              {top.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">No sales data yet</td></tr>
              )}
              {top.map((p, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 text-gray-400 font-medium">{i + 1}</td>
                  <td className="py-3 font-semibold text-gray-900">{p.name}</td>
                  <td className="py-3 text-gray-500 capitalize">{p.category}</td>
                  <td className="py-3 text-right font-bold text-[#1B4332]">{p.units_sold}</td>
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
