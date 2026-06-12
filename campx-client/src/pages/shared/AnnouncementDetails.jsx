import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { announcementService } from '../../services/announcementService'
import { 
  ArrowLeft, Calendar, User, MapPin, Phone, Mail, 
  FileText, Image, Download, X, Eye, Clock, 
  Tag, Users, Building, AlertCircle, CheckCircle,
  ExternalLink, Copy, Printer, Share2
} from 'lucide-react'
import toast from 'react-hot-toast'

const AnnouncementDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAttachment, setShowAttachment] = useState(false)
  const [copied, setCopied] = useState(false)

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
      case 'urgent': 
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <AlertCircle className="w-3.5 h-3.5" /> }
      case 'high': 
        return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: <AlertCircle className="w-3.5 h-3.5" /> }
      case 'medium': 
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: <Clock className="w-3.5 h-3.5" /> }
      default: 
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: <CheckCircle className="w-3.5 h-3.5" /> }
    }
  }

  const getPriorityLabel = (priority) => {
    if (!priority) return 'Normal'
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
          <p className="mt-3 text-sm text-gray-500">Loading announcement...</p>
        </div>
      </div>
    )
  }

  if (!announcement) {
    return null
  }

  const priorityStyle = getPriorityColor(announcement.priority)
  const isImage = announcement.attachmentType === 'image' || 
    (announcement.attachment && (announcement.attachment.endsWith('.jpg') || announcement.attachment.endsWith('.jpeg') || 
    announcement.attachment.endsWith('.png') || announcement.attachment.endsWith('.gif') || announcement.attachment.endsWith('.webp')))
  const isPdf = announcement.attachmentType === 'pdf' || (announcement.attachment && announcement.attachment.endsWith('.pdf'))
  const isActive = !announcement.expiryDate || new Date(announcement.expiryDate) > new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy link"
              >
                {copied ? <CheckCircle size={18} className="text-green-600" /> : <Copy size={18} />}
              </button>
              <button
                onClick={handlePrint}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Print"
              >
                <Printer size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Hero Section */}
          <div className={`p-6 sm:p-8 border-b border-gray-200 ${priorityStyle.bg}`}>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${priorityStyle.bg} ${priorityStyle.text} border ${priorityStyle.border}`}>
                {priorityStyle.icon}
                {getPriorityLabel(announcement.priority)}
              </span>
              {announcement.type && announcement.type !== 'general' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  <Tag size={12} />
                  {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                isActive 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                {isActive ? 'Active' : 'Expired'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{announcement.title}</h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <User size={14} className="text-gray-400" />
                <span>Posted by {announcement.createdBy?.name || 'Admin'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <span>{new Date(announcement.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              {announcement.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span>{announcement.location}</span>
                </div>
              )}
              {announcement.audience && (
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-gray-400" />
                  <span>Target: {announcement.audience === 'all' ? 'All Users' : 
                    announcement.audience === 'students' ? 'Students Only' : 'Faculty Only'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Description */}
            {announcement.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-gray-400" />
                  Description
                </h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {announcement.description}
                  </p>
                </div>
              </div>
            )}

            {/* Attachment */}
            {announcement.attachment && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Image size={18} className="text-gray-400" />
                  Attachment
                </h2>
                <div 
                  onClick={() => setShowAttachment(true)}
                  className="group relative overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50 cursor-pointer hover:border-blue-300 hover:bg-gray-100 transition-all duration-200"
                >
                  {isImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={announcement.attachment} 
                        alt={announcement.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-white rounded-full p-3 shadow-lg">
                            <Eye size={20} className="text-gray-700" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {!isImage && (
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        {isPdf ? (
                          <FileText size={24} className="text-red-500" />
                        ) : (
                          <FileText size={24} className="text-blue-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                            View Attachment
                          </p>
                          <p className="text-xs text-gray-400">
                            {isImage ? 'Click to view image' : isPdf ? 'Click to view PDF' : 'Click to view document'}
                          </p>
                        </div>
                      </div>
                      <Eye size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contacts */}
            {announcement.contacts && announcement.contacts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Phone size={18} className="text-gray-400" />
                  Contact Information
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {announcement.contacts.map((contact, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {contact.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                        {contact.role && <p className="text-xs text-gray-500">{contact.role}</p>}
                        {contact.email && (
                          <a 
                            href={`mailto:${contact.email}`}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                          >
                            <Mail size={12} />
                            {contact.email}
                          </a>
                        )}
                      </div>
                      {contact.phone && (
                        <a 
                          href={`tel:${contact.phone}`}
                          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Phone size={14} />
                          {contact.phone}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Info */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex flex-wrap justify-between items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-4">
                  <span>Posted: {new Date(announcement.createdAt).toLocaleString()}</span>
                  {announcement.updatedAt && announcement.updatedAt !== announcement.createdAt && (
                    <span>Last updated: {new Date(announcement.updatedAt).toLocaleString()}</span>
                  )}
                </div>
                {announcement.expiryDate && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>Expires on {new Date(announcement.expiryDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions (if user is admin) */}
        {window.location.pathname.includes('/admin') && (
          <div className="mt-6 flex justify-end gap-3">
            <Link
              to={`/admin/announcements/edit/${announcement._id}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit Announcement
            </Link>
            <Link
              to="/admin/announcements"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manage All
            </Link>
          </div>
        )}
      </div>

      {/* Attachment Modal */}
      {showAttachment && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowAttachment(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Attachment Preview</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{announcement.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={announcement.attachment}
                    download
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download size={18} />
                  </a>
                  <button
                    onClick={() => setShowAttachment(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="flex-1 overflow-auto p-4 bg-gray-100">
                {isImage ? (
                  <img 
                    src={announcement.attachment} 
                    alt={announcement.title}
                    className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                  />
                ) : isPdf ? (
                  <iframe 
                    src={`${announcement.attachment}#toolbar=0`}
                    className="w-full h-[70vh] rounded-lg shadow-lg"
                    title={announcement.title}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText size={64} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">Cannot preview this file type</p>
                    <a 
                      href={announcement.attachment}
                      download
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Download size={16} />
                      Download File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .sticky, .fixed, button, .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
          .bg-gray-50 {
            background: white;
          }
          .shadow-sm, .border {
            box-shadow: none;
            border: 1px solid #e5e7eb;
          }
        }
      `}</style>
    </div>
  )
}

export default AnnouncementDetails