import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { announcementService } from '../../services/announcementService'
import { ArrowLeft, Calendar, User, MapPin, Phone, Mail, FileText, Image, Download, X, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const AnnouncementDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAttachment, setShowAttachment] = useState(false)

  useEffect(() => {
    fetchAnnouncement()
  }, [id])

  const fetchAnnouncement = async () => {
    try {
      const response = await announcementService.getById(id)
      if (response.success) {
        setAnnouncement(response.announcement)
      } else {
        toast.error('Announcement not found')
        navigate(-1)
      }
    } catch (error) {
      console.error('Error fetching announcement:', error)
      toast.error('Failed to load announcement')
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-green-100 text-green-700'
    }
  }

  const getPriorityLabel = (priority) => {
    if (!priority) return 'Normal'
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (!announcement) {
    return null
  }

  const isImage = announcement.attachmentType === 'image' || 
    (announcement.attachment && (announcement.attachment.endsWith('.jpg') || announcement.attachment.endsWith('.jpeg') || announcement.attachment.endsWith('.png') || announcement.attachment.endsWith('.gif')))
  const isPdf = announcement.attachmentType === 'pdf' || (announcement.attachment && announcement.attachment.endsWith('.pdf'))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(announcement.priority)}`}>
                {getPriorityLabel(announcement.priority)}
              </span>
              {announcement.type && announcement.type !== 'general' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                </span>
              )}
              <span className="text-xs text-gray-400">
                {new Date(announcement.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">{announcement.title}</h1>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <User size={14} />
                <span>{announcement.createdBy?.name || 'Admin'}</span>
              </div>
              {announcement.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  <span>{announcement.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {announcement.description}
              </p>
            </div>

            {/* Attachment */}
            {announcement.attachment && (
              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-3">Attachment</h2>
                <div 
                  onClick={() => setShowAttachment(true)}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {isImage ? (
                      <Image size={20} className="text-blue-500" />
                    ) : (
                      <FileText size={20} className="text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        View Attachment
                      </p>
                      <p className="text-xs text-gray-400">
                        {isImage ? 'Click to view image' : 'Click to view document'}
                      </p>
                    </div>
                  </div>
                  <Eye size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            )}

            {/* Contacts */}
            {announcement.contacts && announcement.contacts.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h2>
                <div className="space-y-3">
                  {announcement.contacts.map((contact, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {contact.name?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.role}</p>
                      </div>
                      <a 
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Phone size={14} />
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            {announcement.expiryDate && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  This announcement will expire on {new Date(announcement.expiryDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attachment Modal */}
      {showAttachment && (
        <>
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                <h3 className="text-sm font-medium text-gray-700">Attachment Preview</h3>
                <button
                  onClick={() => setShowAttachment(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-4 overflow-auto max-h-[calc(90vh-60px)]">
                {isImage ? (
                  <img 
                    src={announcement.attachment} 
                    alt={announcement.title}
                    className="max-w-full h-auto mx-auto rounded-lg"
                  />
                ) : isPdf ? (
                  <iframe 
                    src={`${announcement.attachment}#toolbar=0`}
                    className="w-full h-[70vh] rounded-lg"
                    title={announcement.title}
                  />
                ) : (
                  <div className="text-center py-12">
                    <FileText size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">Cannot preview this file type</p>
                    <a 
                      href={announcement.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download size={16} />
                      Download File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AnnouncementDetails