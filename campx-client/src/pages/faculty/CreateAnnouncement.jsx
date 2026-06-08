import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { announcementService } from '../../services/announcementService'
import { Upload, X, MapPin, Calendar, Users, AlertCircle, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const CreateAnnouncement = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    audience: 'all',
    location: '',
    expiryDate: '',
    contacts: [],
    attachment: null
  })
  const [newContact, setNewContact] = useState({ role: '', name: '', phone: '' })
  const [attachmentPreview, setAttachmentPreview] = useState(null)

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Please enter contact name and phone number')
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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Allowed: Images and PDF')
        return
      }
      
      setFormData({ ...formData, attachment: file })
      setAttachmentPreview({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type
      })
    }
  }

  const removeAttachment = () => {
    setFormData({ ...formData, attachment: null })
    setAttachmentPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in title and description')
      return
    }
    
    setLoading(true)
    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('priority', formData.priority)
      submitData.append('audience', formData.audience)
      submitData.append('location', formData.location || '')
      submitData.append('expiryDate', formData.expiryDate || '')
      submitData.append('contacts', JSON.stringify(formData.contacts))
      if (formData.attachment) {
        submitData.append('attachment', formData.attachment)
      }
      
      const response = await api.post('/announcements', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (response.data.success) {
        toast.success('Announcement created successfully!')
        navigate('/faculty/announcements')
      } else {
        toast.error(response.data.message || 'Failed to create announcement')
      }
    } catch (error) {
      console.error('Create error:', error)
      toast.error(error.response?.data?.message || 'Failed to create announcement')
    } finally {
      setLoading(false)
    }
  }

  const getAttachmentIcon = () => {
    if (!attachmentPreview) return <Upload className="w-10 h-10 text-gray-400" />
    if (attachmentPreview.type.includes('pdf')) return '📄'
    if (attachmentPreview.type.includes('image')) return '🖼️'
    return '📎'
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create Announcement</h1>
        <p className="text-gray-500 mt-1">Share important updates with students and faculty</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Basic Information</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter announcement title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter detailed announcement content..."
                required
              />
            </div>

            {/* Priority & Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">🟢 Low - Normal Information</option>
                  <option value="medium">🟡 Medium - Important</option>
                  <option value="high">🟠 High - Very Important</option>
                  <option value="urgent">🔴 Urgent - Immediate Attention</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                <select
                  name="audience"
                  value={formData.audience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">👥 All Users</option>
                  <option value="students">🎓 Students Only</option>
                  <option value="faculty">👨‍🏫 Faculty Only</option>
                </select>
              </div>
            </div>

            {/* Location & Expiry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location (Optional)
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Main Auditorium, Online, Room 201"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contacts Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Contact Persons
            </h2>
            <p className="text-xs text-gray-500 mt-1">Add people to contact for this announcement</p>
          </div>
          <div className="p-6 space-y-4">
            {/* Existing Contacts */}
            {formData.contacts.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.contacts.map((contact, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-800">{contact.role}</span>
                        <span className="text-gray-600">{contact.name}</span>
                        <span className="text-gray-500 text-sm">{contact.phone}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(idx)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Contact */}
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Role (e.g., Coordinator, HOD)"
                value={newContact.role}
                onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddContact}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Attachment Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Attachment (Optional)</h2>
            <p className="text-xs text-gray-500 mt-1">Upload images or PDF files (Max 10MB)</p>
          </div>
          <div className="p-6">
            {!attachmentPreview ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-all cursor-pointer"
                onClick={() => document.getElementById('attachment-input').click()}
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Click to upload attachment</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, PDF up to 10MB</p>
                <input
                  id="attachment-input"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getAttachmentIcon()}</div>
                    <div>
                      <p className="font-medium text-gray-800">{attachmentPreview.name}</p>
                      <p className="text-xs text-gray-400">{attachmentPreview.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Guidelines Card */}
        <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Announcement Guidelines:</p>
            <ul className="list-disc list-inside mt-1 text-xs text-blue-700 space-y-0.5">
              <li>Keep announcements clear and concise</li>
              <li>Use priority levels appropriately (Urgent for critical updates only)</li>
              <li>Add contact persons for students to reach out</li>
              <li>Set expiry date for time-sensitive announcements</li>
              <li>Attachments will be visible to all targeted users</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/faculty/announcements')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Publish Announcement
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateAnnouncement