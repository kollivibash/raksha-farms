'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { Plus, Trash2, Edit2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    frequency: '',
    frequency_days: '',
    base_price: '',
    margin_percent: '',
    discount_percent: '',
    description: '',
    is_active: true,
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  async function fetchPlans() {
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`${API_URL}/api/subscription-plans/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setPlans(Array.isArray(data) ? data : data.data || [])
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  function openModal(plan = null) {
    if (plan) {
      setEditId(plan.id)
      setForm({
        name: plan.name,
        frequency: plan.frequency,
        frequency_days: plan.frequency_days || '',
        base_price: plan.base_price || '',
        margin_percent: plan.margin_percent || '',
        discount_percent: plan.discount_percent || '',
        description: plan.description || '',
        is_active: plan.is_active !== false,
      })
    } else {
      setEditId(null)
      setForm({
        name: '',
        frequency: '',
        frequency_days: '',
        base_price: '',
        margin_percent: '',
        discount_percent: '',
        description: '',
        is_active: true,
      })
    }
    setShowModal(true)
  }

  async function savePlan(e) {
    e.preventDefault()
    try {
      const token = localStorage.getItem('admin_token')
      const method = editId ? 'PUT' : 'POST'
      const url = editId ? `${API_URL}/api/subscription-plans/${editId}` : `${API_URL}/api/subscription-plans`

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          base_price: parseFloat(form.base_price) || 0,
          margin_percent: parseFloat(form.margin_percent) || 0,
          discount_percent: parseFloat(form.discount_percent) || 0,
          frequency_days: parseInt(form.frequency_days) || null,
        })
      })

      if (!res.ok) throw new Error('Failed to save plan')

      await fetchPlans()
      setShowModal(false)
    } catch(e) {
      alert('Error: ' + e.message)
    }
  }

  async function deletePlan(id) {
    if (!confirm('Delete this subscription plan?')) return
    try {
      const token = localStorage.getItem('admin_token')
      await fetch(`${API_URL}/api/subscription-plans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchPlans()
    } catch(e) { alert('Error: ' + e.message) }
  }

  const activeCount = plans.filter(p => p.is_active).length

  return (
    <AdminLayout title="Subscription Plans">
      <div className="flex justify-between items-center mb-6">
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
          <p className="text-sm text-gray-500 mt-0.5">Active Plans</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-medium"
        >
          <Plus size={18} /> Add Plan
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Plan Name</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Frequency</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Days</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Price</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Margin %</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Discount %</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="px-4 py-3"/>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="py-12 text-center text-gray-400">Loading…</td></tr>}
            {!loading && plans.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-gray-400">No plans yet</td></tr>}
            {plans.map(plan => (
              <tr key={plan.id} className={`border-b border-gray-50 hover:bg-gray-50 ${!plan.is_active?'opacity-60':''}`}>
                <td className="px-4 py-3 font-semibold text-gray-900">{plan.name}</td>
                <td className="px-4 py-3 text-gray-700 capitalize">{plan.frequency}</td>
                <td className="px-4 py-3 text-center text-gray-600">{plan.frequency_days || '—'}</td>
                <td className="px-4 py-3 text-right text-gray-700 font-medium">₹{parseFloat(plan.base_price || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-gray-600">{plan.margin_percent}%</td>
                <td className="px-4 py-3 text-center text-blue-600 font-semibold">{plan.discount_percent}%</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2 justify-end">
                  <button
                    onClick={() => openModal(plan)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{editId ? 'Edit Plan' : 'New Plan'}</h2>

            <form onSubmit={savePlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Plan name"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Frequency (e.g., daily, weekly, monthly)"
                  value={form.frequency}
                  onChange={(e) => setForm({...form, frequency: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Days (e.g., 1, 7, 30)"
                  value={form.frequency_days}
                  onChange={(e) => setForm({...form, frequency_days: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Base price"
                  step="0.01"
                  value={form.base_price}
                  onChange={(e) => setForm({...form, base_price: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Margin %"
                  step="0.01"
                  value={form.margin_percent}
                  onChange={(e) => setForm({...form, margin_percent: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Discount % (savings for customers)"
                  step="0.01"
                  value={form.discount_percent}
                  onChange={(e) => setForm({...form, discount_percent: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({...form, is_active: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>

              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  {editId ? 'Update Plan' : 'Create Plan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
