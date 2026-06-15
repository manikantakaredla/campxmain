import React, { useState, useEffect } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { announcementService } from '../../services/announcementService'
import { SearchBar } from '../../components/common/SearchBar'
import { Pagination } from '../../components/common/Pagination'
import { Loader } from '../../components/common/Loader'
import { EmptyState } from '../../components/common/EmptyState'
import { 
  Megaphone, Plus, Edit, Trash2, Eye, 
  MapPin, X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../services/api'

const MyAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([])
  const { settings } = useSettings()
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('my')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    audience: 'all',
    location: '',
    expiryDate: '',
    contacts: [],
    addToCalendar: false,
        attachment: null
  })
  
  const [newContact, setNewContact] = useState({ role: '', name: '', phone: '' })

  useEffect(() => {
    fetchAnnouncements()
  }, [pagination.page, searchTerm, filterType])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const response = filterType === 'all' 
        ? await announcementService.getAll() 
        : await announcementService.getMyAnnouncements()
      let filtered = response.announcements || []
      if (searchTerm) {
        filtered = filtered.filter(a => 
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      setAnnouncements(filtered)
      setPagination(prev => ({
        ...prev,
        total: filtered.length,
        pages: Math.ceil(filtered.length / prev.limit)
      }))
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementService.delete(id)
        toast.success('Announcement deleted')
        fetchAnnouncements()
      } catch (error) {
        toast.error('Failed to delete')
      }
    }
  }

    const handleCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked })
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      setFormData({
        ...formData,
        contacts: [...formData.contacts, { ...newContact, role: newContact.role || 'Contact' }]
      })
      setNewContact({ role: '', name: '', phone: '' })
    } else {
      toast.error('Please enter contact name and phone')
    }
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

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.description) {
      toast.error('Please fill in title and description')
      return
    }
    
    setSubmitting(true)
    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('priority', formData.priority)
      submitData.append('audience', formData.audience)
      submitData.append('location', formData.location || '')
      submitData.append('expiryDate', formData.expiryDate || '')
      submitData.append('contacts', JSON.stringify(formData.contacts))
      submitData.append('addToCalendar', formData.addToCalendar)
      if (formData.attachment) {
        submitData.append('attachment', formData.attachment)
      }
      
      await api.post('/announcements', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      toast.success('Announcement created successfully')
      setShowCreateModal(false)
      resetForm()
      fetchAnnouncements()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create announcement')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await announcementService.update(selectedAnnouncement._id, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        audience: formData.audience,
        location: formData.location,
        expiryDate: formData.expiryDate,
        contacts: formData.contacts
      })
      toast.success('Announcement updated successfully')
      setShowEditModal(false)
      resetForm()
      fetchAnnouncements()
    } catch (error) {
      toast.error('Failed to update announcement')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (announcement) => {
    setSelectedAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      description: announcement.description,
      priority: announcement.priority,
      audience: announcement.audience,
      location: announcement.location || '',
      expiryDate: announcement.expiryDate?.split('T')[0] || '',
      contacts: announcement.contacts || [],
      attachment: null,
      addToCalendar: false
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      audience: 'all',
      location: '',
      expiryDate: '',
      contacts: [],
    addToCalendar: false,
        attachment: null
    })
    setNewContact({ role: '', name: '', phone: '' })
  }

  const paginatedAnnouncements = announcements.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  )

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
        <p className="text-gray-500 mt-1">Manage and view announcements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Panel: Form */}
      

        {/* Right Panel: List */}
        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex-1 overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  All Announcements
                </button>
                <button
                  onClick={() => setFilterType('my')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === 'my' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  mAnnouncements
                </button>
              </div>
              <div className="w-full sm:w-64">
                <SearchBar onSearch={setSearchTerm} placeholder="Search..." />
              </div>
            </div>

            {loading ? (
              <Loader />
            ) : announcements.length === 0 ? (
              <EmptyState 
                icon={<Megaphone className="w-12 h-12" />}
                title="No announcements"
                description={filterType === 'my' ? "You haven't created any announcements yet" : "No announcements found"}
              />
            ) : (
              <div className="space-y-3">
                {paginatedAnnouncements.map((announcement) => (
                  <div key={announcement._id} className="p-4 rounded-lg border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all bg-gray-50/50">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold ${
                            announcement.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            announcement.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {announcement.priority || 'NORMAL'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase font-semibold">
                            {announcement.audience}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">{announcement.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2">{announcement.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Link to={`/announcement/${announcement._id}`} className="p-1.5 text-gray-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {filterType === 'my' && (
                          <>
                            <button onClick={() => openEditModal(announcement)} className="p-1.5 text-gray-400 hover:text-green-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(announcement._id)} className="p-1.5 text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Pagination 
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyAnnouncements
