'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { customersAPI } from '../../lib/api'
import { Search, UserCheck, UserX } from 'lucide-react'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    try { const { data } = await customersAPI.getAll({ search }); setCustomers(data.customers); setTotal(data.total) }
    catch(e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function toggle(id) {
    try {
      const { data } = await customersAPI.toggle(id)
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, is_active: data.is_active } : c))
    } catch(e) { alert('Failed') }
  }

  return (
    <AdminLayout title="Customers">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-72">
          <Search size={16} className="text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()}
            placeholder="Name, email or phone…" className="outline-none text-sm flex-1"/>
        </div>
        <span className="text-sm text-gray-500">{total} customers</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Customer</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Phone</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Orders</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Spent</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Joined</th>
              <th className="px-4 py-3"/>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading…</td></tr>}
            {customers.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1B4332] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{c.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                <td className="px-4 py-3 text-right font-semibold">{c.total_orders}</td>
                <td className="px-4 py-3 text-right font-semibold">₹{Number(c.total_spent).toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {c.is_active ? 'Active' : 'Blocked'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={()=>toggle(c.id)}
                    className={`p-1.5 rounded-lg transition ${c.is_active ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-600'}`}
                    title={c.is_active ? 'Block' : 'Unblock'}>
                    {c.is_active ? <UserX size={15}/> : <UserCheck size={15}/>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
