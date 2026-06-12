import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, X, Plus, Trash2, Search, Users, AlertCircle, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useSettings } from '../../hooks/useSettings'

const CreateAnnouncement = () => {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general',
    priority: 'medium',
    audienceType: 'all',
    addToCalendar: false,
    sendNotification: true,
    isPinned: false,
    allowReadTracking: false,
    eventDate: '',
    eventTime: '',
    eventVenue: '',
    contacts: [],
    attachment: null,
    targetBranches: [],
    sectionBranch: '',
    targetSections: [],
    targetSpecificStudents: [] // Array of student objects {id, name, rollNumber}
  })

  // Student Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const [newContact, setNewContact] = useState({ role: '', name: '', phone: '' })

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchStudents(searchQuery)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const calendarEventCategories = ["workshop", "seminar", "hackathon", "internship", "placement", "event", "examination"];

  useEffect(() => {
    if (calendarEventCategories.includes(formData.type)) {
      setFormData(prev => ({ ...prev, addToCalendar: true }));
    }
  }, [formData.type]);

  const searchStudents = async (query) => {
    setIsSearching(true)
    try {
      const res = await api.get(`/announcements/search-students?q=${query}`)
      setSearchResults(res.data.students || [])
    } catch (error) {
      console.error("Search failed", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddStudent = (student) => {
    if (!formData.targetSpecificStudents.find(s => s._id === student._id)) {
      setFormData({
        ...formData,
        targetSpecificStudents: [...formData.targetSpecificStudents, student]
      })
    }
    setSearchQuery('')
    setSearchResults([])
  }

  const handleRemoveStudent = (studentId) => {
    setFormData({
      ...formData,
      targetSpecificStudents: formData.targetSpecificStudents.filter(s => s._id !== studentId)
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked, options } = e.target
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked })
    } else if (type === 'select-multiple') {
      const values = Array.from(options).filter(opt => opt.selected).map(opt => opt.value)
      setFormData({ ...formData, [name]: values })
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

  const fetchPreview = async () => {
    setPreviewLoading(true)
    try {
      let audiencePayload = 'all'
      if (formData.audienceType === 'branch_wise' || formData.audienceType === 'section_wise') {
        audiencePayload = 'students'
      } else if (formData.audienceType === 'individual') {
        audiencePayload = 'individual'
      }

      const payload = {
        audience: audiencePayload,
        targetBranches: formData.audienceType === 'branch_wise' ? formData.targetBranches : (formData.audienceType === 'section_wise' ? [formData.sectionBranch] : []),
        targetSections: formData.audienceType === 'section_wise' ? formData.targetSections : [],
        targetSpecificStudents: formData.audienceType === 'individual' ? formData.targetSpecificStudents.map(s => s._id) : []
      }

      const res = await api.post('/announcements/preview-recipients', payload)
      setPreviewData(res.data.counts)
      setShowPreviewModal(true)
    } catch (error) {
      toast.error('Failed to load preview')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleSubmit = async (e, status = 'active') => {
    if (e) e.preventDefault()
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in title and description')
      return
    }
    
    if (formData.audienceType === 'branch_wise' && formData.targetBranches.length === 0) {
      toast.error('Please select at least one branch')
      return
    }
    if (formData.audienceType === 'section_wise' && formData.targetSections.length === 0) {
      toast.error('Please select at least one section')
      return
    }
    if (formData.audienceType === 'individual' && formData.targetSpecificStudents.length === 0) {
      toast.error('Please select at least one student')
      return
    }

    setLoading(true)
    try {
      const submitData = new FormData()
      
      let audiencePayload = 'all'
      if (formData.audienceType === 'branch_wise' || formData.audienceType === 'section_wise') {
        audiencePayload = 'students'
      } else if (formData.audienceType === 'individual') {
        audiencePayload = 'individual'
      }

      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('type', formData.type)
      submitData.append('priority', formData.priority)
      submitData.append('audience', audiencePayload)
      submitData.append('status', status)
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
      
      if (formData.audienceType === 'branch_wise') {
        submitData.append('targetBranches', JSON.stringify(formData.targetBranches))
      } else if (formData.audienceType === 'section_wise') {
        submitData.append('targetBranches', JSON.stringify([formData.sectionBranch]))
        submitData.append('targetSections', JSON.stringify(formData.targetSections))
      } else if (formData.audienceType === 'individual') {
        submitData.append('targetSpecificStudents', JSON.stringify(formData.targetSpecificStudents.map(s => s._id)))
      }

      if (formData.attachment) {
        submitData.append('attachment', formData.attachment)
      }
      
      await api.post('/announcements', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      toast.success(`Announcement ${status === 'draft' ? 'saved as draft' : 'published successfully'}`)
      navigate('/admin/announcements')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create announcement')
    } finally {
      setLoading(false)
      setShowPreviewModal(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate('/admin/announcements')} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900 font-medium">
        <ArrowLeft size={18} /> Back to Announcements
      </button>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-800">Create Announcement</h1>
          <p className="text-gray-500 mt-1">Publish targeted updates for the university</p>
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
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="examination">Examination</option>
                  <option value="internship">Internship</option>
                  <option value="placement">Placement</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="event">Event</option>
                  <option value="holiday">Holiday</option>
                  <option value="emergency">Emergency</option>
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
                <option value="all">Entire University</option>
                <option value="branch_wise">Branch Wise</option>
                <option value="section_wise">Section Wise</option>
                <option value="individual">Individual Students</option>
              </select>
            </div>
            
            {formData.audienceType === 'branch_wise' && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <label className="block text-sm font-medium text-blue-900 mb-2">Select Branches (Multi-select)</label>
                <select multiple name="targetBranches" value={formData.targetBranches} onChange={handleChange} className="w-full px-4 py-2 border border-blue-200 rounded-lg bg-white h-32 focus:ring-blue-500">
                  {settings?.branches?.map(b => (
                    <option key={b} value={b} className="p-2 hover:bg-blue-50">{b}</option>
                  ))}
                </select>
                <p className="text-xs text-blue-600 mt-2">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</p>
              </div>
            )}
            
            {formData.audienceType === 'section_wise' && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Select Branch</label>
                  <select name="sectionBranch" value={formData.sectionBranch} onChange={handleChange} className="w-full px-4 py-2 border border-blue-200 rounded-lg bg-white">
                    <option value="">-- Choose Branch --</option>
                    {settings?.branches?.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Select Sections (Multi-select)</label>
                  <select multiple name="targetSections" value={formData.targetSections} onChange={handleChange} disabled={!formData.sectionBranch} className="w-full px-4 py-2 border border-blue-200 rounded-lg bg-white h-32 disabled:bg-gray-100 disabled:text-gray-400">
                    {settings?.sections?.map(s => (
                      <option key={s} value={s} className="p-2 hover:bg-blue-50">{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {formData.audienceType === 'individual' && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <label className="block text-sm font-medium text-blue-900 mb-2">Search Students</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-blue-500 outline-none"
                    placeholder="Search by Roll Number, Name, or Email..."
                  />
                  {isSearching && <div className="absolute right-3 top-3 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
                  
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map(student => (
                        <div 
                          key={student._id} 
                          onClick={() => handleAddStudent(student)}
                          className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{student.name} <span className="text-gray-500 text-xs font-normal">({student.employeeId})</span></p>
                            <p className="text-xs text-gray-500">{student.branch} • Year {student.currentYear} • Section {student.section}</p>
                          </div>
                          <Plus className="w-4 h-4 text-blue-600" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.targetSpecificStudents.map(student => (
                    <div key={student._id} className="flex items-center gap-2 bg-white border border-blue-200 px-3 py-1.5 rounded-full shadow-sm">
                      <span className="text-sm text-gray-700 font-medium">{student.employeeId}</span>
                      <span className="text-xs text-gray-500">{student.name}</span>
                      <button type="button" onClick={() => handleRemoveStudent(student._id)} className="text-red-400 hover:text-red-600 ml-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.targetSpecificStudents.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No students selected yet</p>
                  )}
                </div>
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
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 -mb-6 flex justify-between items-center z-10 shadow-lg">
            <button
              type="button"
              onClick={fetchPreview}
              disabled={loading || previewLoading}
              className="px-6 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {previewLoading ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> : <Eye size={16} />}
              Preview Target
            </button>
            
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

      {/* Preview Modal */}
      {showPreviewModal && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Audience Preview
              </h3>
              <button onClick={() => setShowPreviewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-3">Recipients Breakdown</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Students:</span>
                    <span className="text-lg font-bold text-gray-900">{previewData.students.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Faculty/Staff:</span>
                    <span className="text-lg font-bold text-gray-900">{previewData.faculty.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-blue-600 font-bold uppercase text-sm tracking-wider">Total Reach:</span>
                    <span className="text-2xl font-black text-blue-600">{previewData.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {previewData.total === 0 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">Warning: This announcement currently targets 0 users. Please adjust your targeting selections.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setShowPreviewModal(false)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg">Close</button>
              <button onClick={(e) => handleSubmit(e, 'active')} disabled={previewData.total === 0} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">Publish Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateAnnouncement