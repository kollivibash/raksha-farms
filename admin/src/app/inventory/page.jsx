'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { productsAPI } from '../../lib/api'
import { AlertTriangle, Package } from 'lucide-react'

export default function InventoryPage() {
  const [products, setProducts] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [newStock, setNewStock] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    Promise.all([
      productsAPI.getAll({ limit: 100 }),
      productsAPI.getLowStock(10)
    ]).then(([all, low]) => {
      setProducts(all.data.products)
      setLowStock(low.data)
    }).finally(() => setLoading(false))
  }, [])

  async function saveStock(id) {
    try {
      await productsAPI.updateStock(id, parseInt(newStock), reason)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: parseInt(newStock) } : p))
      setLowStock(prev => prev.filter(p => !(p.id === id && parseInt(newStock) > 10)))
      setEditing(null); setNewStock(''); setReason('')
    } catch(e) { alert('Failed to update stock') }
  }

  return (
    <AdminLayout title="Inventory">
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-600"/>
            <p className="font-semibold text-amber-800">{lowStock.length} product{lowStock.length>1?'s':''} low on stock</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(p => (
              <span key={p.id} className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium">
                {p.name} — {p.stock} left
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Package size={18} className="text-gray-600"/>
          <h2 className="font-semibold text-gray-800">Stock Levels</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Product</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Category</th>
              <th className="text-right px-5 py-3 text-gray-500 font-medium">Current Stock</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Level</th>
              <th className="px-5 py-3"/>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="py-12 text-center text-gray-400">Loading…</td></tr>}
            {products.map(p => {
              const level = p.stock === 0 ? 'out' : p.stock <= 5 ? 'critical' : p.stock <= 15 ? 'low' : 'good'
              const colors = { out:'bg-red-100 text-red-700', critical:'bg-orange-100 text-orange-700', low:'bg-yellow-100 text-yellow-700', good:'bg-green-100 text-green-700' }
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-5 py-3 capitalize text-gray-500">{p.category}</td>
                  <td className="px-5 py-3 text-right font-bold text-gray-900">{p.stock}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[level]}`}>
                      {level === 'out' ? 'Out of Stock' : level === 'critical' ? 'Critical' : level === 'low' ? 'Low' : 'Good'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {editing === p.id ? (
                      <div className="flex items-center gap-2">
                        <input type="number" min="0" value={newStock} onChange={e=>setNewStock(e.target.value)}
                          className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#1B4332]" placeholder="Qty"/>
                        <input value={reason} onChange={e=>setReason(e.target.value)}
                          className="w-32 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none" placeholder="Reason"/>
                        <button onClick={()=>saveStock(p.id)} className="bg-[#1B4332] text-white px-2 py-1 rounded-lg text-xs hover:bg-[#163826]">Save</button>
                        <button onClick={()=>setEditing(null)} className="text-gray-400 text-xs hover:text-gray-600">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={()=>{setEditing(p.id);setNewStock(String(p.stock));setReason('')}}
                        className="text-xs text-[#1B4332] font-medium hover:underline">Update</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
