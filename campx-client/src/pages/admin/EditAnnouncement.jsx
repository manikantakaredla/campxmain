import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const EditAnnouncement = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general',
    priority: 'medium',
    audience: 'all',
    location: '',
    expiryDate: '',
    contacts: [],
    status: 'active'
  })
  const [newContact, setNewContact] = useState({ role: '', name: '', phone: '' })

  useEffect(() => {
    fetchAnnouncement()
  }, [id])

  const fetchAnnouncement = async () => {
    try {
      const response = await api.get(`/announcements/${id}`)
      const data = response.data.announcement
      setFormData({
        title: data.title || '',
        description: data.description || '',
        type: data.type || 'general',
        priority: data.priority || 'medium',
        audience: data.audience || 'all',
        location: data.location || '',
        expiryDate: data.expiryDate ? data.expiryDate.split('T')[0] : '',
        contacts: data.contacts || [],
        status: data.status || 'active'
      })
    } catch (error) {
      toast.error('Failed to load announcement')
      navigate('/admin/announcements')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Please enter contact name and phone')
      return
    }
    setFormData({
      ...formData,
      contacts: [...formData.contacts, { 
        role: newContact.role || 'Contact', 
        name: newContact.name, 
        phone: newContact.phone 
      }]
    })
    setNewContact({ role: '', name: '', phone: '' })
  }

  const handleRemoveContact = (index) => {
    setFormData({
      ...formData,
      contacts: formData.contacts.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put(`/announcements/${id}`, formData)
      toast.success('Announcement updated successfully')
      navigate('/admin/announcements')
    } catch (error) {
      toast.error('Failed to update announcement')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate('/admin/announcements')} className="flex items-center gap-2 text-gray-600 mb-4">
        <ArrowLeft size={18} /> Back
      </button>
      
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-2">Edit Announcement</h1>
        <p className="text-gray-500 text-sm mb-6">Update announcement details</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="general">General</option>
                <option value="exam">Exam</option>
                <option value="workshop">Workshop</option>
                <option value="event">Event</option>
                <option value="fee">Fee</option>
                <option value="holiday">Holiday</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
              <select name="audience" value={formData.audience} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="faculty">Faculty Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="active">Active (Published)</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          
          {/* Contacts Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Persons</label>
            {formData.contacts.map((contact, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-2">
                <span className="text-sm flex-1">{contact.role}: {contact.name} ({contact.phone})</span>
                <button type="button" onClick={() => handleRemoveContact(idx)} className="text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input type="text" placeholder="Role" value={newContact.role} onChange={(e) => setNewContact({...newContact, role: e.target.value})} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <input type="text" placeholder="Name" value={newContact.name} onChange={(e) => setNewContact({...newContact, name: e.target.value})} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <input type="tel" placeholder="Phone" value={newContact.phone} onChange={(e) => setNewContact({...newContact, phone: e.target.value})} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <button type="button" onClick={handleAddContact} className="px-3 bg-blue-600 text-white rounded-lg">Add</button>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => navigate('/admin/announcements')} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditAnnouncement