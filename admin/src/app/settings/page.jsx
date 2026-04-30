'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { authAPI, settingsAPI } from '../../lib/api'
import { Lock, CheckCircle, Truck } from 'lucide-react'

export default function SettingsPage() {
  const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })
  const [msg, setMsg] = useState(null)
  const [saving, setSaving] = useState(false)

  // Delivery fee settings
  const [fees, setFees] = useState({ free_delivery_threshold: '', delivery_fee_standard: '', delivery_fee_express: '' })
  const [feeMsg, setFeeMsg] = useState(null)
  const [feeSaving, setFeeSaving] = useState(false)

  useEffect(() => {
    settingsAPI.getDelivery()
      .then(r => setFees({
        free_delivery_threshold: r.data.free_delivery_threshold ?? 500,
        delivery_fee_standard:   r.data.delivery_fee_standard   ?? 30,
        delivery_fee_express:    r.data.delivery_fee_express     ?? 60,
      }))
      .catch(() => {})
  }, [])

  async function handleFeeSubmit(e) {
    e.preventDefault()
    setFeeSaving(true); setFeeMsg(null)
    try {
      await settingsAPI.updateDelivery({
        free_delivery_threshold: Number(fees.free_delivery_threshold),
        delivery_fee_standard:   Number(fees.delivery_fee_standard),
        delivery_fee_express:    Number(fees.delivery_fee_express),
      })
      setFeeMsg({ type: 'success', text: 'Delivery fees updated!' })
    } catch(e) { setFeeMsg({ type: 'error', text: e.response?.data?.error || 'Failed to save' }) }
    finally { setFeeSaving(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) { setMsg({type:'error', text:'Passwords do not match'}); return }
    if (form.newPassword.length < 8) { setMsg({type:'error', text:'Min 8 characters'}); return }
    setSaving(true); setMsg(null)
    try {
      await authAPI.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setMsg({type:'success', text:'Password updated successfully!'})
      setForm({ currentPassword:'', newPassword:'', confirmPassword:'' })
    } catch(e) { setMsg({type:'error', text: e.response?.data?.error || 'Failed'}) }
    finally { setSaving(false) }
  }

  return (
    <AdminLayout title="Settings">
      <div className="max-w-2xl space-y-6">

        {/* Delivery Fee Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#D97706]/10 rounded-xl flex items-center justify-center">
              <Truck size={18} className="text-[#D97706]"/>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Delivery Fee Settings</h2>
              <p className="text-sm text-gray-500">Adjust free delivery threshold and delivery charges</p>
            </div>
          </div>

          <form onSubmit={handleFeeSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Free Delivery Above (₹)
                </label>
                <input type="number" min="0" step="1" required
                  value={fees.free_delivery_threshold}
                  onChange={e => setFees(p => ({ ...p, free_delivery_threshold: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"/>
                <p className="text-xs text-gray-400 mt-1">Orders above this get free delivery</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Standard Delivery Fee (₹)
                </label>
                <input type="number" min="0" step="1" required
                  value={fees.delivery_fee_standard}
                  onChange={e => setFees(p => ({ ...p, delivery_fee_standard: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"/>
                <p className="text-xs text-gray-400 mt-1">Charged for standard delivery</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Express Delivery Fee (₹)
                </label>
                <input type="number" min="0" step="1" required
                  value={fees.delivery_fee_express}
                  onChange={e => setFees(p => ({ ...p, delivery_fee_express: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"/>
                <p className="text-xs text-gray-400 mt-1">Charged for express delivery</p>
              </div>
            </div>

            {feeMsg && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${feeMsg.type==='success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {feeMsg.type==='success' && <CheckCircle size={16}/>}
                {feeMsg.text}
              </div>
            )}

            <button type="submit" disabled={feeSaving}
              className="px-6 py-2.5 bg-[#D97706] text-white rounded-xl text-sm font-semibold hover:bg-[#b45309] disabled:opacity-50">
              {feeSaving ? 'Saving…' : 'Save Delivery Settings'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#1B4332]/10 rounded-xl flex items-center justify-center">
              <Lock size={18} className="text-[#1B4332]"/>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Change Password</h2>
              <p className="text-sm text-gray-500">Update your admin password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {['currentPassword','newPassword','confirmPassword'].map((field, i) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {['Current Password','New Password','Confirm New Password'][i]}
                </label>
                <input type="password" required value={form[field]} onChange={e=>setForm(p=>({...p,[field]:e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]"/>
              </div>
            ))}

            {msg && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${msg.type==='success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {msg.type==='success' && <CheckCircle size={16}/>}
                {msg.text}
              </div>
            )}

            <button type="submit" disabled={saving}
              className="w-full py-2.5 bg-[#1B4332] text-white rounded-xl text-sm font-semibold hover:bg-[#163826] disabled:opacity-50">
              {saving ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>
    </AdminLayout>
  )
}
