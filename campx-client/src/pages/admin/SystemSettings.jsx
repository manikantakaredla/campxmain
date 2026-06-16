import React, { useState, useEffect } from 'react'
import { Settings, Globe, Mail, Bell, Shield, Save, RefreshCw, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    platformName: 'CAMPX',
    supportEmail: 'support@adityauniversity.in',
    contactEmail: 'support@adityauniversity.in',
    contactMobile: '',
    logoUrl: '',
    maintenanceMode: false,
    facultyRegistrationEnabled: true,
    emailDomain: '@adityauniversity.in',
    branchConfigs: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings')
      setSettings(response.data.settings)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings', settings)
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
        <p className="text-gray-500 mt-1">Configure platform settings and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Settings className="w-5 h-5" /> General Settings</h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
            <input type="text" name="platformName" value={settings.platformName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
            <input type="email" name="supportEmail" value={settings.supportEmail} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Mobile</label>
              <input type="text" name="contactMobile" value={settings.contactMobile} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Domain</label>
            <input type="text" name="emailDomain" value={settings.emailDomain} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            <p className="text-xs text-gray-400 mt-1">Students and faculty must use this domain for registration</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input type="text" name="logoUrl" value={settings.logoUrl} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="https://example.com/logo.png" />
          </div>
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Maintenance Mode</p>
              <p className="text-sm text-gray-500">When enabled, only admins can access the platform</p>
            </div>
            <button onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))} className={`relative w-12 h-6 rounded-full transition-all ${settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-800">Faculty Registration</p>
              <p className="text-sm text-gray-500">Allow faculty to self-register</p>
            </div>
            <button onClick={() => setSettings(prev => ({ ...prev, facultyRegistrationEnabled: !prev.facultyRegistrationEnabled }))} className={`relative w-12 h-6 rounded-full transition-all ${settings.facultyRegistrationEnabled ? 'bg-green-600' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.facultyRegistrationEnabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Layers className="w-5 h-5" /> Branch & Section Settings</h2>
          <button onClick={() => {
            const newBranch = prompt("Enter new branch name:")
            if (newBranch) {
              setSettings(prev => ({
                ...prev,
                branchConfigs: [
                  ...(prev.branchConfigs || []),
                  { branch: newBranch, years: { "1": ["A", "B", "C"], "2": ["A", "B", "C"], "3": ["A", "B", "C"], "4": ["A", "B", "C"] } }
                ]
              }))
            }
          }} className="px-4 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Add Branch</button>
        </div>
        <div className="p-6 space-y-4">
          {(settings.branchConfigs || []).map((config, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 relative group hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">{config.branch}</h3>
                <button onClick={() => {
                  if(window.confirm("Are you sure you want to remove this branch?")) {
                    setSettings(prev => ({
                      ...prev,
                      branchConfigs: prev.branchConfigs.filter((_, i) => i !== index)
                    }))
                  }
                }} className="text-red-500 text-sm hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Remove Branch</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {["1", "2", "3", "4"].map(year => (
                  <div key={year}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Year {year} Sections</label>
                    <input 
                      type="text" 
                      value={(config.years && config.years[year]) ? config.years[year].join(', ') : ''} 
                      onChange={(e) => {
                        const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        setSettings(prev => {
                          const newConfigs = [...prev.branchConfigs]
                          if (!newConfigs[index].years) newConfigs[index].years = {}
                          newConfigs[index].years[year] = val
                          return { ...prev, branchConfigs: newConfigs }
                        })
                      }}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="A, B, C..."
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SystemSettings