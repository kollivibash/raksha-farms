'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { productsAPI } from '../../lib/api'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'

const CATEGORIES = ['vegetables','fruits','oils','microgreens','mushrooms','grains','millets','eggs','flours']
const EMPTY = { name:'', category:'vegetables', description:'', price:'', offer_price:'', stock:'', unit:'kg', is_featured:false, is_active:true }

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [image, setImage] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    try { const { data } = await productsAPI.getAll({ limit: 100, search }); setProducts(data.products) }
    catch(e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function openAdd() { setEditing(null); setForm(EMPTY); setImage(null); setShowModal(true) }
  function openEdit(p) {
    setEditing(p.id)
    setForm({ name:p.name, category:p.category, description:p.description||'', price:p.price, offer_price:p.offer_price||'', stock:p.stock, unit:p.unit||'kg', is_featured:p.is_featured||false, is_active: p.is_active !== false })
    setImage(null); setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v]) => fd.append(k, v))
      if (image) fd.append('image', image)
      if (editing) await productsAPI.update(editing, fd)
      else await productsAPI.create(fd)
      setShowModal(false); load()
    } catch(e) { alert(e.response?.data?.error || 'Save failed') }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    try { await productsAPI.delete(id); load() }
    catch(e) { alert('Delete failed') }
  }

  return (
    <AdminLayout title="Products">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-72">
          <Search size={16} className="text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()}
            placeholder="Search products…" className="outline-none text-sm flex-1"/>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#1B4332] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#163826] transition">
          <Plus size={16}/> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Product</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Category</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Price</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Stock</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="py-12 text-center text-gray-400">Loading…</td></tr>}
            {products.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image_url && <img src={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api','') : 'http://localhost:4000'}${p.image_url}`} alt="" className="w-10 h-10 rounded-lg object-cover"/>}
                    <div>
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.unit}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-gray-600">{p.category}</td>
                <td className="px-4 py-3 text-right font-semibold">₹{p.price}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-semibold ${p.stock <= 5 ? 'text-red-600' : p.stock <= 15 ? 'text-orange-500' : 'text-green-600'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={()=>openEdit(p)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"><Pencil size={15}/></button>
                    <button onClick={()=>handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={()=>setShowModal(false)}><X size={20} className="text-gray-400"/></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input required value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select required value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]">
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]" placeholder="kg, 500g…"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MRP / Original Price (₹) *</label>
                  <input required type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offer Price (₹) <span className="text-gray-400 font-normal text-xs">optional</span>
                  </label>
                  <input type="number" min="0" step="0.01" value={form.offer_price} onChange={e=>setForm(p=>({...p,offer_price:e.target.value}))}
                    placeholder="Leave empty for no offer"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"/>
                  {form.offer_price && form.price && Number(form.offer_price) < Number(form.price) && (
                    <p className="text-green-600 text-xs mt-1 font-medium">
                      {Math.round((1 - form.offer_price/form.price)*100)}% off
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input required type="number" min="0" value={form.stock} onChange={e=>setForm(p=>({...p,stock:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"/>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] resize-none"/>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                  <input type="file" accept="image/*" onChange={e=>setImage(e.target.files[0])}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"/>
                </div>
                <div className="col-span-2 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_active" checked={form.is_active} onChange={e=>setForm(p=>({...p,is_active:e.target.checked}))} className="w-4 h-4"/>
                    <label htmlFor="is_active" className="text-sm text-gray-700">Active (visible on website)</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="featured" checked={form.is_featured} onChange={e=>setForm(p=>({...p,is_featured:e.target.checked}))} className="w-4 h-4"/>
                    <label htmlFor="featured" className="text-sm text-gray-700">Mark as Featured</label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-[#1B4332] text-white rounded-xl text-sm font-medium hover:bg-[#163826] disabled:opacity-50">
                  {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
