'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { subscriptionPlansAPI } from '../../lib/api'
import { Plus, Trash2, Edit2 } from 'lucide-react'

const FREQ_OPTIONS = ['daily', 'weekly', 'bi-weekly', 'monthly', 'custom']

const EMPTY_FORM = {
  name: '', frequency: '', frequency_days: '',
  base_price: '', margin_percent: '', discount_percent: '',
  description: '', is_active: true,
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => { fetchPlans() }, [])

  async function fetchPlans() {
    try {
      const res = await subscriptionPlansAPI.getAll()
      setPlans(Array.isArray(res.data) ? res.data : [])
    } catch(e) {
      console.error('Fetch plans error:', e)
    } finally { setLoading(false) }
  }

  function openModal(plan = null) {
    setError('')
    if (plan) {
      setEditId(plan.id)
      setForm({
        name:             plan.name,
        frequency:        plan.frequency,
        frequency_days:   plan.frequency_days ?? '',
        base_price:       plan.base_price ?? '',
        margin_percent:   plan.margin_percent ?? '',
        discount_percent: plan.discount_percent ?? '',
        description:      plan.description ?? '',
        is_active:        plan.is_active !== false,
      })
    } else {
      setEditId(null)
      setForm(EMPTY_FORM)
    }
    setShowModal(true)
  }

  async function savePlan(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        name:             form.name.trim(),
        frequency:        form.frequency.trim(),
        frequency_days:   parseInt(form.frequency_days) || null,
        base_price:       parseFloat(form.base_price)   || 0,
        margin_percent:   parseFloat(form.margin_percent)   || 0,
        discount_percent: parseFloat(form.discount_percent) || 0,
        description:      form.description.trim(),
        is_active:        form.is_active,
      }
      if (editId) {
        await subscriptionPlansAPI.update(editId, payload)
      } else {
        await subscriptionPlansAPI.create(payload)
      }
      await fetchPlans()
      setShowModal(false)
    } catch(e) {
      console.error('Save plan error:', e)
      setError(e?.response?.data?.error || e.message || 'Failed to save plan')
    } finally { setSaving(false) }
  }

  async function deletePlan(id) {
    if (!confirm('Delete this subscription plan?')) return
    try {
      await subscriptionPlansAPI.delete(id)
      setPlans(prev => prev.filter(p => p.id !== id))
    } catch(e) { alert('Error: ' + (e?.response?.data?.error || e.message)) }
  }

  const activeCount = plans.filter(p => p.is_active).length

  return (
    <AdminLayout title="Subscription Plans">
      {/* Stats + Add button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
            <p className="text-sm text-gray-500 mt-0.5">Active Plans</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-400">{plans.length - activeCount}</p>
            <p className="text-sm text-gray-500 mt-0.5">Inactive</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium shadow-sm"
        >
          <Plus size={18} /> Add Plan
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Plan Name</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Frequency</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Every N Days</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Margin %</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Discount %</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading…</td></tr>
            )}
            {!loading && plans.length === 0 && (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">No plans yet — click Add Plan to create one</td></tr>
            )}
            {plans.map(plan => (
              <tr key={plan.id} className={`border-b border-gray-50 hover:bg-gray-50 transition ${!plan.is_active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{plan.name}</p>
                  {plan.description && <p className="text-xs text-gray-400 mt-0.5">{plan.description}</p>}
                </td>
                <td className="px-4 py-3 capitalize text-gray-700">{plan.frequency}</td>
                <td className="px-4 py-3 text-center text-gray-600">{plan.frequency_days ?? '—'}</td>
                <td className="px-4 py-3 text-center text-gray-600">{plan.margin_percent}%</td>
                <td className="px-4 py-3 text-center">
                  <span className="font-semibold text-green-600">{plan.discount_percent}% off</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => openModal(plan)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition"><Edit2 size={15} /></button>
                    <button onClick={() => deletePlan(plan.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editId ? 'Edit Plan' : 'New Subscription Plan'}</h2>
            </div>

            <form onSubmit={savePlan} className="p-6 space-y-4">
              {/* Name + Frequency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Plan Name *</label>
                  <input
                    type="text" required
                    placeholder="e.g. Weekly Bundle"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Frequency *</label>
                  <select
                    required
                    value={form.frequency}
                    onChange={e => {
                      const v = e.target.value
                      const dayMap = { daily:1, weekly:7, 'bi-weekly':14, monthly:30 }
                      setForm({...form, frequency: v, frequency_days: dayMap[v] ?? ''})
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select…</option>
                    {FREQ_OPTIONS.map(f => <option key={f} value={f} className="capitalize">{f.charAt(0).toUpperCase()+f.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Days + Margin + Discount */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Every N Days</label>
                  <input
                    type="number" min="1"
                    placeholder="e.g. 7"
                    value={form.frequency_days}
                    onChange={e => setForm({...form, frequency_days: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Margin %</label>
                  <input
                    type="number" min="0" step="0.01"
                    placeholder="e.g. 20"
                    value={form.margin_percent}
                    onChange={e => setForm({...form, margin_percent: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Discount %</label>
                  <input
                    type="number" min="0" step="0.01"
                    placeholder="e.g. 10"
                    value={form.discount_percent}
                    onChange={e => setForm({...form, discount_percent: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Description</label>
                <textarea
                  rows={2} placeholder="Short description shown to customers…"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm({...form, is_active: e.target.checked})}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700 font-medium">Active (visible to customers during checkout)</span>
              </label>

              {/* Error */}
              {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition font-semibold disabled:opacity-60"
                >
                  {saving ? 'Saving…' : editId ? 'Update Plan' : 'Create Plan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition font-semibold"
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
