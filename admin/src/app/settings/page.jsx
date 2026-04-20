'use client'
import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { authAPI } from '../../lib/api'
import { Lock, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })
  const [msg, setMsg] = useState(null)
  const [saving, setSaving] = useState(false)

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
      <div className="max-w-md">
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
