'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { couponsAPI } from '../../lib/api'
import { Plus, Trash2, Pencil, X } from 'lucide-react'

const EMPTY = { code:'', type:'percent', value:'', min_order:'0', max_uses:'100', expires_at:'' }

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    try { const { data } = await couponsAPI.getAll(); setCoupons(data) } catch(e) { console.error(e) }
  }
  useEffect(() => { load() }, [])

  function openAdd() { setEditing(null); setForm(EMPTY); setShowModal(true) }
  function openEdit(c) {
    setEditing(c.id)
    setForm({ code:c.code, type:c.type, value:c.value, min_order:c.min_order, max_uses:c.max_uses,
              expires_at: c.expires_at ? c.expires_at.split('T')[0] : '' })
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) await couponsAPI.update(editing, form)
      else await couponsAPI.create(form)
      setShowModal(false); load()
    } catch(e) { alert(e.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  async function del(id) {
    if (!confirm('Delete coupon?')) return
    try { await couponsAPI.delete(id); load() } catch(e) { alert('Failed') }
  }

  return (
    <AdminLayout title="Coupons">
      <div className="flex justify-end mb-5">
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#1B4332] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#163826]">
          <Plus size={16}/> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {coupons.map(c => (
          <div key={c.id} className={`bg-white border rounded-2xl p-5 shadow-sm ${!c.is_active ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xl font-bold text-[#1B4332] font-mono">{c.code}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {c.type === 'percent' ? `${c.value}% off` : `₹${c.value} off`}
                  {c.min_order > 0 && ` · Min ₹${c.min_order}`}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={()=>openEdit(c)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500"><Pencil size={14}/></button>
                <button onClick={()=>del(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={14}/></button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{c.used_count}/{c.max_uses} used</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {c.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {c.expires_at && (
              <p className="text-xs text-gray-400 mt-2">Expires: {new Date(c.expires_at).toLocaleDateString()}</p>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold">{editing ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={()=>setShowModal(false)}><X size={20} className="text-gray-400"/></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                  <input required value={form.code} onChange={e=>setForm(p=>({...p,code:e.target.value.toUpperCase()}))}
                    disabled={!!editing}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#1B4332] disabled:bg-gray-50"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                    <option value="percent">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                  <input required type="number" min="0" step="0.01" value={form.value} onChange={e=>setForm(p=>({...p,value:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                    placeholder={form.type==='percent' ? '% e.g. 10' : '₹ e.g. 50'}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (₹)</label>
                  <input type="number" min="0" value={form.min_order} onChange={e=>setForm(p=>({...p,min_order:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                  <input type="number" min="1" value={form.max_uses} onChange={e=>setForm(p=>({...p,max_uses:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"/>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" value={form.expires_at} onChange={e=>setForm(p=>({...p,expires_at:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"/>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
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
