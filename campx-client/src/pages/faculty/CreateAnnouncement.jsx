import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Upload, X, Plus, Trash2, Search, Users, AlertCircle, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useSettings } from '../../hooks/useSettings'
import { useAuth } from '../../hooks/useAuth'

const CreateAnnouncement = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { settings } = useSettings()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const targetParam = new URLSearchParams(location.search).get('target')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general',
    priority: 'medium',
    audienceType: targetParam === 'class' ? 'class' : (targetParam === 'proctor' ? 'proctor' : 'class'),
    addToCalendar: false,
    sendNotification: true,
    isPinned: false,
    allowReadTracking: false,
    eventDate: '',
    eventTime: '',
    eventVenue: '',
    contacts: [],
    attachment: null,
    targetSections: '' // For faculty, targetSections is usually a string from the dropdown
  })

  const [assignedSections, setAssignedSections] = useState([])
  const [newContact, setNewContact] = useState({ role: '', name: '', phone: '' })

  // Fetch assigned sections for faculty
  useEffect(() => {
    api.get('/faculty/students/class?limit=500')
      .then(res => {
        if (res.data?.students) {
          const unique = [...new Set(res.data.students.map(s => s.section).filter(Boolean))];
          setAssignedSections(unique);
        }
      })
      .catch(err => console.error("Failed to load sections", err));
  }, [])

  const calendarEventCategories = ["workshop", "seminar", "hackathon", "internship", "placement", "event", "examination"];

  useEffect(() => {
    if (calendarEventCategories.includes(formData.type)) {
      setFormData(prev => ({ ...prev, addToCalendar: true }));
    }
  }, [formData.type]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
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

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachment: e.target.files[0] })
  }

  const handleSubmit = async (e, status = 'active') => {
    if (e) e.preventDefault()
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in title and description')
      return
    }
    
    if (formData.audienceType === 'section' && !formData.targetSections) {
      toast.error('Please select an assigned section')
      return
    }

    setLoading(true)
    try {
      const submitData = new FormData()

      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('type', formData.type)
      submitData.append('priority', formData.priority)
      submitData.append('audience', formData.audienceType)
      submitData.append('status', status)
      
      // Faculty Specific Target Flags
      submitData.append('targetMyClass', formData.audienceType === 'class')
      submitData.append('targetMyProctor', formData.audienceType === 'proctor')
      submitData.append('targetMySection', formData.audienceType === 'section')
      submitData.append('targetMyDepartment', formData.audienceType === 'department')

      submitData.append('addToCalendar', formData.addToCalendar)
      submitData.append('sendNotification', formData.sendNotification)
      submitData.append('isPinned', formData.isPinned)
      submitData.append('allowReadTracking', formData.allowReadTracking)
      
      if (formData.addToCalendar) {
        submitData.append('eventDate', formData.eventDate)
        submitData.append('eventVenue', formData.eventVenue)
        // Combine date and time if time is provided
        if (formData.eventDate && formData.eventTime) {
           const dateTime = new Date(`${formData.eventDate}T${formData.eventTime}`)
           submitData.append('startDate', dateTime.toISOString())
        }
      }

      submitData.append('contacts', JSON.stringify(formData.contacts))
      
      if (formData.audienceType === 'section' && formData.targetSections) {
        submitData.append('targetSections', JSON.stringify([formData.targetSections]))
      }

      if (formData.attachment) {
        submitData.append('attachment', formData.attachment)
      }
      
      await api.post('/announcements', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      toast.success(`Announcement ${status === 'draft' ? 'saved as draft' : 'published successfully'}`)
      navigate('/faculty/announcements')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create announcement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate('/faculty/announcements')} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900 font-medium">
        <ArrowLeft size={18} /> Back to Announcements
      </button>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-800">Create Announcement</h1>
          <p className="text-gray-500 mt-1">Share important updates with your students and branch</p>
        </div>
        
        <form className="p-6 space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">1. Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter announcement title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter detailed description"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                  {(() => {
                    let types = ['general', 'academic', 'emergency'];
                    if (['admin', 'dean', 'hod', 'principal'].includes(user?.role)) {
                      types = ['general', 'academic', 'examination', 'internship', 'placement', 'hackathon', 'event', 'holiday', 'emergency', 'fee', 'workshop', 'crt', 'sports'];
                    } else if (user?.role === 'faculty') {
                      const roles = user?.specialRoles || [];
                      if (roles.includes("exam_controller")) types.push("examination");
                      if (roles.includes("academics")) types.push("fee", "examination", "holiday");
                      if (roles.includes("event_coordinator")) types.push("event", "workshop", "hackathon");
                      if (roles.includes("placement_coordinator")) types.push("placement", "internship", "crt");
                      if (roles.includes("sports_coordinator")) types.push("sports");
                    }
                    const allowedTypes = [...new Set(types)];
                    
                    return (
                      <>
                        {allowedTypes.includes('general') && <option value="general">General</option>}
                        {allowedTypes.includes('academic') && <option value="academic">Academic</option>}
                        {allowedTypes.includes('fee') && <option value="fee">Fee</option>}
                        {allowedTypes.includes('examination') && <option value="examination">Examination</option>}
                        {allowedTypes.includes('internship') && <option value="internship">Internship</option>}
                        {allowedTypes.includes('placement') && <option value="placement">Placement</option>}
                        {allowedTypes.includes('hackathon') && <option value="hackathon">Hackathon</option>}
                        {allowedTypes.includes('event') && <option value="event">Event</option>}
                        {allowedTypes.includes('workshop') && <option value="workshop">Workshop</option>}
                        {allowedTypes.includes('crt') && <option value="crt">CRT</option>}
                        {allowedTypes.includes('sports') && <option value="sports">Sports</option>}
                        {allowedTypes.includes('holiday') && <option value="holiday">Holiday</option>}
                        {allowedTypes.includes('emergency') && <option value="emergency">Emergency</option>}
                      </>
                    );
                  })()}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
          
          <hr className="border-gray-100" />
          
          {/* Section 2: Target Audience */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">2. Target Audience</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Audience Scope</label>
              <select name="audienceType" value={formData.audienceType} onChange={handleChange} className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="class">My Classes</option>
                <option value="proctor">My Proctor Students</option>
                <option value="section">My Sections</option>
                
              </select>
            </div>
            
            {formData.audienceType === 'section' && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <label className="block text-sm font-medium text-blue-900 mb-2">Select Assigned Section</label>
                <select name="targetSections" value={formData.targetSections} onChange={handleChange} className="w-full md:w-1/2 px-4 py-2 border border-blue-200 rounded-lg bg-white">
                  <option value="">-- Choose Section --</option>
                  {assignedSections.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <hr className="border-gray-100" />
          
          {/* Section 3: Calendar Options */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">3. Calendar Event</h2>
            
            <label className={`flex items-center p-4 border border-gray-200 rounded-xl transition-colors w-fit ${calendarEventCategories.includes(formData.type) ? 'bg-gray-50 opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
              <input
                type="checkbox"
                name="addToCalendar"
                checked={formData.addToCalendar}
                disabled={calendarEventCategories.includes(formData.type)}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="ml-3 font-medium text-gray-800">Add to Academic Calendar {calendarEventCategories.includes(formData.type) && <span className="text-xs text-blue-600 ml-1">(Required for this category)</span>}</span>
            </label>
            
            {formData.addToCalendar && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                  <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                  <input type="time" name="eventTime" value={formData.eventTime} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                  <input type="text" name="eventVenue" value={formData.eventVenue} onChange={handleChange} placeholder="e.g. Main Auditorium" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            )}
          </div>
          
          <hr className="border-gray-100" />
          
          {/* Section 4: Other Options */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">4. Options & Attachments</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input type="checkbox" name="sendNotification" checked={formData.sendNotification} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                <span className="ml-3 font-medium text-gray-700">Send Notification</span>
              </label>
              
              <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input type="checkbox" name="isPinned" checked={formData.isPinned} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                <span className="ml-3 font-medium text-gray-700">Pin Announcement</span>
              </label>
              
              <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input type="checkbox" name="allowReadTracking" checked={formData.allowReadTracking} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                <span className="ml-3 font-medium text-gray-700">Allow Read Tracking</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
              <div className="border border-gray-300 border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                <input type="file" id="attachment" onChange={handleFileChange} className="hidden" />
                <label htmlFor="attachment" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-blue-600">Click to upload a file</span>
                  <span className="text-xs text-gray-500 mt-1">PDF, DOCX, PPT, Images up to 10MB</span>
                </label>
                {formData.attachment && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100">
                    <span className="text-sm font-medium truncate max-w-xs">{formData.attachment.name}</span>
                    <button type="button" onClick={(e) => { e.preventDefault(); setFormData({...formData, attachment: null}) }} className="text-blue-400 hover:text-blue-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 -mb-6 flex justify-end items-center z-10 shadow-lg">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'active')}
                disabled={loading}
                className="px-8 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[180px]"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Publish Announcement'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateAnnouncement