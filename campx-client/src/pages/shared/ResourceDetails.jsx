import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { resourceService } from '../../services/resourceService'
import { ArrowLeft, Download, Eye, User, Calendar, FileText, Tag } from 'lucide-react'
import toast from 'react-hot-toast'

const ResourceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchResource()
  }, [id])

  const fetchResource = async () => {
    try {
      const response = await resourceService.getById(id)
      if (response.success) {
        setResource(response.resource)
      } else {
        toast.error('Resource not found')
        navigate(-1)
      }
    } catch (error) {
      console.error('Error fetching resource:', error)
      toast.error('Failed to load resource')
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const response = await resourceService.download(id)
      if (response.success && response.fileUrl) {
        window.open(response.fileUrl, '_blank')
        toast.success('Download started')
        // Update download count locally

      }
    } catch (error) {
      toast.error('Failed to download')
    } finally {
      setDownloading(false)
    }
  }

  const getFileIcon = () => {
    const fileType = resource?.fileType
    if (fileType?.includes('pdf')) return '📄 PDF'
    if (fileType?.includes('powerpoint')) return '📊 PowerPoint'
    if (fileType?.includes('word')) return '📝 Word Document'
    if (fileType?.includes('excel')) return '📈 Excel Spreadsheet'
    if (fileType?.includes('image')) return '🖼️ Image'
    return '📁 File'
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!resource) {
    return null
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              {resource.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{resource.title}</h1>

          {/* Description */}
          {resource.description && (
            <div className="mb-6">
              <p className="text-gray-600 leading-relaxed">{resource.description}</p>
            </div>
          )}

          {/* File Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{getFileIcon()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{formatFileSize(resource.fileSize)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-gray-500" />

            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Uploaded by {resource.uploadedBy?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {new Date(resource.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {downloading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download Resource
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResourceDetails