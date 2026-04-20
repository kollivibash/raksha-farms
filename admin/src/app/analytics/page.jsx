'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { analyticsAPI } from '../../lib/api'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = ['#1B4332','#D97706','#3f9a67','#6db38d','#eab842','#a0ccb3','#f5dea1']

export default function AnalyticsPage() {
  const [sales, setSales] = useState([])
  const [categories, setCategories] = useState([])
  const [period, setPeriod] = useState('30')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const [s, c] = await Promise.all([
        analyticsAPI.getSales(period),
        analyticsAPI.getCategories()
      ])
      setSales(s.data); setCategories(c.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [period])

  const totalRevenue = sales.reduce((a,b) => a + Number(b.revenue), 0)
  const totalOrders  = sales.reduce((a,b) => a + Number(b.orders), 0)
  const avgOrderVal  = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <AdminLayout title="Analytics">
      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {[['7','7 Days'],['30','30 Days'],['90','90 Days']].map(([v,l]) => (
          <button key={v} onClick={()=>setPeriod(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition
              ${period===v ? 'bg-[#1B4332] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:'Total Revenue', value:`₹${totalRevenue.toLocaleString()}` },
          { label:'Total Orders',  value: totalOrders.toLocaleString() },
          { label:'Avg Order Value', value:`₹${Math.round(avgOrderVal).toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <p className="text-3xl font-bold text-[#1B4332]">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Revenue Over Time</h2>
        {loading ? <div className="h-64 flex items-center justify-center text-gray-400">Loading…</div> : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={sales}>
              <defs>
                <linearGradient id="rv2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B4332" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1B4332" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="label" tick={{fontSize:11}} interval="preserveStartEnd"/>
              <YAxis tick={{fontSize:11}} tickFormatter={v=>`₹${v}`}/>
              <Tooltip formatter={v=>[`₹${Number(v).toLocaleString()}`, 'Revenue']}/>
              <Area type="monotone" dataKey="revenue" stroke="#1B4332" strokeWidth={2} fill="url(#rv2)"/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Orders bar chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Daily Orders</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="label" tick={{fontSize:11}} interval="preserveStartEnd"/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip/>
              <Bar dataKey="orders" fill="#D97706" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Revenue by Category</h2>
          {categories.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categories} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={({category,percent})=>`${category} ${(percent*100).toFixed(0)}%`}>
                  {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>`₹${Number(v).toLocaleString()}`}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
